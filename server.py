import argparse
import hashlib
import hmac
import json
import os
import ssl
import ipaddress
from contextlib import contextmanager
import secrets
import sqlite3
import time
from http.cookies import SimpleCookie
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
DB = Path(os.environ.get('COMEMOS_DB', str(ROOT / 'data' / 'comemos.sqlite3'))).expanduser().resolve()
CATEGORIES = ('quality', 'service', 'value', 'distance')


@contextmanager
def connect():
    db = sqlite3.connect(DB, timeout=15)
    db.row_factory = sqlite3.Row
    db.execute('PRAGMA foreign_keys=ON')
    try:
        with db:
            yield db
    finally:
        db.close()


def initialize():
    DB.parent.mkdir(parents=True, exist_ok=True)
    with connect() as db:
        db.executescript('''
        CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, user_id INTEGER REFERENCES users(id), expires REAL NOT NULL);
        CREATE TABLE IF NOT EXISTS restaurants(id INTEGER PRIMARY KEY, name TEXT NOT NULL, cuisine TEXT NOT NULL, price REAL NOT NULL, minutes INTEGER NOT NULL, address TEXT NOT NULL, demo INTEGER NOT NULL DEFAULT 0);
        CREATE TABLE IF NOT EXISTS ratings(user_id INTEGER REFERENCES users(id), restaurant_id INTEGER REFERENCES restaurants(id), quality INTEGER CHECK(quality BETWEEN 1 AND 5), service INTEGER CHECK(service BETWEEN 1 AND 5), value INTEGER CHECK(value BETWEEN 1 AND 5), distance INTEGER CHECK(distance BETWEEN 1 AND 5), PRIMARY KEY(user_id, restaurant_id));
        CREATE TABLE IF NOT EXISTS auth_attempts(address TEXT PRIMARY KEY, started REAL NOT NULL, attempts INTEGER NOT NULL);
        ''')
        if not db.execute('SELECT 1 FROM restaurants LIMIT 1').fetchone():
            db.executemany('INSERT INTO restaurants(name,cuisine,price,minutes,address,demo) VALUES(?,?,?,?,?,1)', [
                ('La mesa verde', 'Mediterránea', 15, 6, 'Restaurante de ejemplo'),
                ('Pasta & compañía', 'Italiana', 17, 9, 'Restaurante de ejemplo'),
                ('Casa del arroz', 'Asiática', 14, 7, 'Restaurante de ejemplo'),
                ('El patio', 'Mediterránea', 19, 12, 'Restaurante de ejemplo'),
                ('Sabor de barrio', 'Casera', 13, 4, 'Restaurante de ejemplo'),
                ('Ramen de mediodía', 'Asiática', 16, 10, 'Restaurante de ejemplo')])


def backup_database(destination=None):
    if not DB.is_file():
        raise ValueError('No existe la base de datos que se quiere respaldar.')
    folder = Path(destination) if destination else DB.parent / 'backups'
    folder.mkdir(parents=True, exist_ok=True)
    target = folder / f'comemos-{time.strftime("%Y%m%d-%H%M%S")}-{secrets.token_hex(3)}.sqlite3'
    try:
        with connect() as source:
            copy = sqlite3.connect(target)
            try:
                source.backup(copy)
                if copy.execute('PRAGMA integrity_check').fetchone()[0] != 'ok':
                    raise RuntimeError('La copia no supera la comprobación de integridad.')
            finally:
                copy.close()
    except Exception:
        target.unlink(missing_ok=True)
        raise
    return target


def configured_server(host, port, cert=None, key=None, allowed_emails=(), public_origin=None, registration_code=None):
    try:
        local = ipaddress.ip_address(host).is_loopback
    except ValueError:
        local = host.lower() == 'localhost'
    emails = {email.strip().lower() for email in allowed_emails if email.strip()}
    if public_origin:
        parsed = urlparse(public_origin)
        if parsed.scheme != 'https' or not parsed.netloc or parsed.username or parsed.password or parsed.path not in ('', '/') or parsed.query or parsed.fragment:
            raise ValueError('COMEMOS_PUBLIC_ORIGIN debe ser una URL HTTPS sin ruta.')
        if os.environ.get('RENDER') != 'true':
            raise ValueError('La terminación HTTPS gestionada solo está configurada para Render.')
        public_origin = f'https://{parsed.netloc}'
    if bool(cert) != bool(key):
        raise ValueError('Indica tanto --tls-cert como --tls-key.')
    if not local and (not (cert or public_origin) or not emails):
        raise ValueError('Para acceso compartido se requiere certificado TLS y COMEMOS_ALLOWED_EMAILS con los correos del equipo.')
    context = None
    if cert:
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.minimum_version = ssl.TLSVersion.TLSv1_2
        context.load_cert_chain(cert, key)
    http = ThreadingHTTPServer((host, port), Handler)
    http.allowed_emails = emails
    http.secure_cookies = bool(context or public_origin)
    http.public_origin = public_origin
    http.registration_code = registration_code
    if context:
        http.socket = context.wrap_socket(http.socket, server_side=True)
    return http


def password_hash(password, salt=None):
    salt = salt or secrets.token_hex(16)
    digest = hashlib.scrypt(password.encode(), salt=salt.encode(), n=16384, r=8, p=1).hex()
    return salt + ':' + digest


def recommendations(restaurants, ratings, members):
    result = []
    for restaurant in restaurants:
        own = [r for r in ratings if r['restaurant_id'] == restaurant['id'] and r['user_id'] in members]
        community = [r for r in ratings if r['restaurant_id'] == restaurant['id']]
        baseline = sum(sum(r[c] for c in CATEGORIES) / 4 for r in community) / len(community) if community else 3
        member_scores = [sum(r[c] for c in CATEGORIES) / 4 for r in own]
        score = (sum(member_scores) + baseline) / (len(member_scores) + 1)
        known_cuisines = []
        for uid in members:
            for r in ratings:
                if r['user_id'] == uid and sum(r[c] for c in CATEGORIES) / 4 >= 4:
                    match = next((x for x in restaurants if x['id'] == r['restaurant_id']), None)
                    if match:
                        known_cuisines.append(match)
        similar = [x for x in known_cuisines if x['cuisine'] == restaurant['cuisine']]
        affinity = max((max(0, 1 - abs(x['price'] - restaurant['price']) / 20 - abs(x['minutes'] - restaurant['minutes']) / 30) for x in similar), default=0)
        if not own and affinity:
            score = min(5, score + .6 * affinity)
        reason = f'{len(own)} de {len(members)} participantes lo han valorado.' if own else ('Cocina, precio y distancia similares a sitios que os gustan.' if affinity else 'Sin valoraciones del grupo; una opción para explorar.')
        result.append({**restaurant, 'score': round(score, 2), 'coverage': len(own), 'reason': reason, 'new': not own})
    return sorted(result, key=lambda x: (-x['score'], x['minutes'], x['id']))


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT / 'public'), **kwargs)

    def reply(self, status, data, cookie=None):
        body = json.dumps(data, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        if cookie:
            self.send_header('Set-Cookie', cookie)
        self.end_headers()
        self.wfile.write(body)

    def user(self, db):
        cookie = SimpleCookie()
        try:
            cookie.load(self.headers.get('Cookie', ''))
            token = cookie['session'].value if 'session' in cookie else ''
        except Exception:
            return None
        user = db.execute('SELECT users.id,name,email FROM users JOIN sessions ON users.id=sessions.user_id WHERE token=? AND expires>?', (token, time.time())).fetchone()
        allowed = getattr(self.server, 'allowed_emails', set())
        return user if user and (not allowed or user['email'] in allowed) else None

    def do_GET(self):
        if self.path == '/api/config':
            return self.reply(200, {'registration_code_required': bool(getattr(self.server, 'registration_code', None))})
        if self.path == '/health':
            with connect() as db:
                db.execute('SELECT 1 FROM users LIMIT 1').fetchone()
            return self.reply(200, {'ok': True})
        if self.path == '/api/state':
            with connect() as db:
                user = self.user(db)
                if not user:
                    return self.reply(401, {'error': 'Inicia sesión para continuar.'})
                return self.reply(200, {'user': dict(user), 'users': [dict(x) for x in db.execute('SELECT id,name FROM users')], 'restaurants': [dict(x) for x in db.execute('SELECT * FROM restaurants')], 'ratings': [dict(x) for x in db.execute('SELECT * FROM ratings WHERE user_id=?', (user['id'],))]})
        if self.path.startswith('/api/'):
            return self.reply(404, {'error': 'Ruta no encontrada.'})
        super().do_GET()

    def do_POST(self):
        origin = self.headers.get('Origin')
        expected_origin = getattr(self.server, 'public_origin', None)
        if origin and ((expected_origin and origin != expected_origin) or (not expected_origin and urlparse(origin).netloc != self.headers.get('Host'))):
            return self.reply(403, {'error': 'Origen no permitido.'})
        if self.headers.get('Sec-Fetch-Site') == 'cross-site':
            return self.reply(403, {'error': 'Origen no permitido.'})
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if length < 1 or length > 16384:
                raise ValueError('Solicitud no válida.')
            data = json.loads(self.rfile.read(length))
            if not isinstance(data, dict):
                raise ValueError('Solicitud no válida.')
            with connect() as db:
                if self.path in ('/api/register', '/api/login'):
                    address, now = self.client_address[0], time.time()
                    attempt = db.execute('SELECT started,attempts FROM auth_attempts WHERE address=?', (address,)).fetchone()
                    if attempt and now - attempt['started'] < 900 and attempt['attempts'] >= 20:
                        return self.reply(429, {'error': 'Demasiados intentos. Vuelve a intentarlo dentro de 15 minutos.'})
                    started = attempt['started'] if attempt and now - attempt['started'] < 900 else now
                    count = attempt['attempts'] + 1 if attempt and now - attempt['started'] < 900 else 1
                    db.execute('INSERT INTO auth_attempts VALUES(?,?,?) ON CONFLICT(address) DO UPDATE SET started=excluded.started,attempts=excluded.attempts', (address, started, count))
                    db.commit()
                    email = str(data.get('email', '')).strip().lower()
                    password = str(data.get('password', ''))
                    allowed = getattr(self.server, 'allowed_emails', set())
                    if allowed and email not in allowed:
                        return self.reply(403, {'error': 'Este correo no está autorizado para el equipo.'})
                    if len(email) > 200 or '@' not in email or not 8 <= len(password) <= 128:
                        raise ValueError('Introduce un correo y una contraseña de 8 a 128 caracteres.')
                    if self.path == '/api/register':
                        code = getattr(self.server, 'registration_code', None)
                        if code and not hmac.compare_digest(str(data.get('registration_code', '')).encode(), code.encode()):
                            return self.reply(403, {'error': 'El código de invitación no es correcto.'})
                        name = str(data.get('name', '')).strip()
                        if not 1 <= len(name) <= 60:
                            raise ValueError('Introduce un nombre de hasta 60 caracteres.')
                        uid = db.execute('INSERT INTO users(name,email,password) VALUES(?,?,?)', (name, email, password_hash(password))).lastrowid
                    else:
                        record = db.execute('SELECT * FROM users WHERE email=?', (email,)).fetchone()
                        stored = record['password'] if record else password_hash('dummy-password')
                        if not hmac.compare_digest(password_hash(password, stored.split(':')[0]), stored) or not record:
                            return self.reply(401, {'error': 'Correo o contraseña incorrectos.'})
                        uid = record['id']
                    db.execute('DELETE FROM auth_attempts WHERE address=?', (address,))
                    token = secrets.token_urlsafe(32)
                    db.execute('DELETE FROM sessions WHERE expires<?', (time.time(),))
                    db.execute('INSERT INTO sessions VALUES(?,?,?)', (token, uid, time.time() + 604800))
                    secure = '; Secure' if getattr(self.server, 'secure_cookies', False) else ''
                    return self.reply(200, {'ok': True}, f'session={token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800{secure}')
                user = self.user(db)
                if not user:
                    return self.reply(401, {'error': 'Inicia sesión para continuar.'})
                if self.path == '/api/logout':
                    cookie = SimpleCookie(self.headers.get('Cookie', ''))
                    db.execute('DELETE FROM sessions WHERE token=?', (cookie['session'].value,))
                    return self.reply(200, {'ok': True}, 'session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0')
                if self.path == '/api/restaurants':
                    name, cuisine, address = (str(data.get(k, '')).strip() for k in ('name', 'cuisine', 'address'))
                    price, minutes = float(data['price']), int(data['minutes'])
                    if not name or not cuisine or max(len(name), len(cuisine), len(address)) > 200 or not 0 < price <= 500 or not 0 <= minutes <= 300:
                        raise ValueError('Revisa el nombre, la cocina, el precio y la distancia.')
                    db.execute('INSERT INTO restaurants(name,cuisine,price,minutes,address) VALUES(?,?,?,?,?)', (name, cuisine, price, minutes, address))
                elif self.path == '/api/ratings':
                    rid = int(data['restaurant_id'])
                    values = [data[c] for c in CATEGORIES]
                    if any(type(v) is not int or not 1 <= v <= 5 for v in values):
                        raise ValueError('Todas las notas deben estar entre 1 y 5.')
                    db.execute('INSERT INTO ratings VALUES(?,?,?,?,?,?) ON CONFLICT(user_id,restaurant_id) DO UPDATE SET quality=excluded.quality,service=excluded.service,value=excluded.value,distance=excluded.distance', (user['id'], rid, *values))
                elif self.path == '/api/recommendations':
                    members = data.get('members', [])
                    valid = {x['id'] for x in db.execute('SELECT id FROM users')}
                    if not isinstance(members, list) or not members or any(type(x) is not int or x not in valid for x in members):
                        raise ValueError('Selecciona al menos un compañero registrado.')
                    rows = recommendations([dict(x) for x in db.execute('SELECT * FROM restaurants')], [dict(x) for x in db.execute('SELECT * FROM ratings')], set(members))
                    return self.reply(200, {'recommendations': rows})
                else:
                    return self.reply(404, {'error': 'Ruta no encontrada.'})
                return self.reply(200, {'ok': True})
        except sqlite3.IntegrityError:
            self.reply(400, {'error': 'El correo ya está registrado o el restaurante no existe.'})
        except (ValueError, KeyError, TypeError, OverflowError):
            self.reply(400, {'error': 'Revisa los datos. Las notas son de 1 a 5 y todos los campos obligatorios deben completarse.'})
        except Exception as error:
            print(type(error).__name__, str(error))
            self.reply(500, {'error': 'No se pudo completar la operación. Vuelve a intentarlo.'})


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--host', default='127.0.0.1')
    parser.add_argument('--port', default=8000, type=int)
    parser.add_argument('--tls-cert', default=os.environ.get('COMEMOS_TLS_CERT'))
    parser.add_argument('--tls-key', default=os.environ.get('COMEMOS_TLS_KEY'))
    parser.add_argument('--backup', action='store_true', help='Crear una copia consistente y salir')
    parser.add_argument('--backup-dir', default=os.environ.get('COMEMOS_BACKUP_DIR'))
    parser.add_argument('--public-origin', default=os.environ.get('COMEMOS_PUBLIC_ORIGIN') or ('https://' + os.environ['RENDER_EXTERNAL_HOSTNAME'] if os.environ.get('RENDER_EXTERNAL_HOSTNAME') else None))
    args = parser.parse_args()
    if args.backup:
        print(backup_database(args.backup_dir))
        raise SystemExit(0)
    if DB.exists():
        print(f'Copia de seguridad: {backup_database(args.backup_dir)}', flush=True)
    initialize()
    try:
        code = os.environ.get('COMEMOS_REGISTRATION_CODE')
        if args.public_origin and (not code or len(code) < 20):
            raise ValueError('El alojamiento por Internet requiere COMEMOS_REGISTRATION_CODE de al menos 20 caracteres.')
        http = configured_server(args.host, args.port, args.tls_cert, args.tls_key, os.environ.get('COMEMOS_ALLOWED_EMAILS', '').split(','), args.public_origin, code)
    except (ValueError, OSError) as error:
        parser.error(str(error))
    scheme = 'https' if args.tls_cert else 'http'
    print(f'Dónde comemos: {scheme}://{args.host}:{args.port}', flush=True)
    print(f'Datos persistentes: {DB}', flush=True)
    try:
        http.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        http.server_close()
