import {nearby, officeFor, locateOffice, reverseOffice, validPoint} from './nearby.js';
import {recommendations} from './recommendations.js';
import {today, emptyFilters, matchesFilters} from '../public/filters.js';
import {randomToken, sha256, passwordHash, verifyPassword, sessionToken, sessionCookie} from './auth.js';

const categories = ['quality', 'service', 'value', 'distance'];
const now = () => Math.floor(Date.now() / 1000);
class HttpError extends Error {constructor(status, message, details) {super(message); this.status = status; this.details = details;}}
const fail = (status, message, details) => {throw new HttpError(status, message, details);};
const query = (env, sql, ...values) => env.DB.prepare(sql).bind(...values);
const allowedEmails = env => new Set((env.ALLOWED_EMAILS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean));
const permitted = (env, email) => !allowedEmails(env).size || allowedEmails(env).has(email);

function json(status, data, cookie) {
  const headers = new Headers({'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store'});
  if (cookie) headers.set('Set-Cookie', cookie);
  return new Response(JSON.stringify(data), {status, headers});
}

function secureResponse(response, request) {
  const copy = new Response(response.body, response);
  copy.headers.set('X-Content-Type-Options', 'nosniff');
  copy.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  copy.headers.set('X-Frame-Options', 'DENY');
  copy.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: https://tile.openstreetmap.org; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  if (new URL(request.url).protocol === 'https:') copy.headers.set('Strict-Transport-Security', 'max-age=31536000');
  return copy;
}

async function currentUser(request, env) {
  const token = sessionToken(request);
  if (!token) return null;
  const user = await query(env, 'SELECT users.id,name,email FROM users JOIN sessions ON users.id=sessions.user_id WHERE token_hash=? AND expires>?', await sha256(token), now()).first();
  return user && permitted(env, user.email) ? user : null;
}

async function readBody(request) {
  if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) fail(415, 'La solicitud debe usar JSON.');
  if (Number(request.headers.get('Content-Length')) > 16384) fail(413, 'Solicitud demasiado grande.');
  const reader = request.body?.getReader();
  if (!reader) fail(400, 'Solicitud vacía.');
  const chunks = []; let size = 0;
  while (true) {
    const {done, value} = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 16384) {await reader.cancel(); fail(413, 'Solicitud demasiado grande.');}
    chunks.push(value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) {bytes.set(chunk, offset); offset += chunk.length;}
  let data;
  try {data = JSON.parse(new TextDecoder().decode(bytes));} catch {fail(400, 'Solicitud JSON no válida.');}
  if (!data || typeof data !== 'object' || Array.isArray(data)) fail(400, 'Solicitud no válida.');
  return data;
}

async function authenticate(path, request, env, data) {
  const address = await sha256(request.headers.get('CF-Connecting-IP') || 'local');
  const timestamp = now();
  const attempt = await query(env, `INSERT INTO auth_attempts(address,started,attempts) VALUES(?,?,1)
    ON CONFLICT(address) DO UPDATE SET
    attempts=CASE WHEN started<=? THEN 1 ELSE attempts+1 END,
    started=CASE WHEN started<=? THEN excluded.started ELSE started END RETURNING attempts`, address, timestamp, timestamp - 900, timestamp - 900).first();
  if (attempt.attempts > 20) fail(429, 'Demasiados intentos. Vuelve a intentarlo en 15 minutos.');
  const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
  const password = data.password;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200 || typeof password !== 'string' || password.length < 8 || password.length > 128) fail(400, 'Introduce un correo y una contraseña de 8 a 128 caracteres.');
  if (!permitted(env, email)) fail(403, 'Este correo no está autorizado para el equipo.');
  let user;
  if (path === '/api/register') {
    const name = typeof data.name === 'string' ? data.name.trim() : '';
    if (!name || name.length > 60) fail(400, 'Introduce un nombre de hasta 60 caracteres.');
    const hash = await passwordHash(password, env.PASSWORD_PEPPER);
    try {user = await query(env, 'INSERT INTO users(name,email,password) VALUES(?,?,?) RETURNING id', name, email, hash).first();}
    catch (error) {if (String(error).includes('UNIQUE')) fail(409, 'Ese correo ya tiene una cuenta.'); throw error;}
  } else {
    user = await query(env, 'SELECT id,password FROM users WHERE email=?', email).first();
    const dummy = `pbkdf2:100000:${'0'.repeat(64)}:${'0'.repeat(64)}`;
    if (!await verifyPassword(password, user?.password || dummy, env.PASSWORD_PEPPER) || !user) fail(401, 'Correo o contraseña incorrectos.');
  }
  const token = randomToken();
  await env.DB.batch([
    query(env, 'DELETE FROM auth_attempts WHERE address=? OR started<?', address, timestamp - 900),
    query(env, 'DELETE FROM sessions WHERE expires<?', timestamp),
    query(env, 'INSERT INTO sessions(token_hash,user_id,expires) VALUES(?,?,?)', await sha256(token), user.id, timestamp + 604800)
  ]);
  return json(200, {ok:true}, sessionCookie(request, token));
}

async function handle(request, env) {
  const path = new URL(request.url).pathname;
  if (request.method === 'GET' && path === '/api/config') return json(200, {registration_code_required:false});
  if (!path.startsWith('/api/') && path !== '/health') {
    if (!['GET','HEAD'].includes(request.method)) fail(405, 'Método no permitido.');
    return env.ASSETS.fetch(request);
  }
  if (!env.DB || typeof env.PASSWORD_PEPPER !== 'string' || env.PASSWORD_PEPPER.length < 32) fail(503, 'El acceso del equipo todavía no está configurado.');
  if (path === '/health' && request.method === 'GET') {await query(env, 'SELECT id FROM users LIMIT 1').first(); return json(200, {ok:true});}
  if (request.method === 'GET' && path === '/api/state') {
    const user = await currentUser(request, env);
    if (!user) fail(401, 'Inicia sesión para continuar.');
    const day = today();
    const [users, restaurants, ratings, filters] = await env.DB.batch([
      query(env, 'SELECT id,name,email FROM users ORDER BY id'),
      query(env, 'SELECT id,name,cuisine,price,minutes,address,demo FROM restaurants ORDER BY id'),
      query(env, 'SELECT * FROM ratings WHERE user_id=?', user.id),
      query(env, 'SELECT * FROM daily_filters WHERE day=?', day)
    ]);
    const office = await officeFor(env,user);
    return json(200, {office,user:{id:user.id,name:user.name,email:user.email}, day, users:users.results.filter(u => permitted(env,u.email)).map(({id,name}) => ({id,name,filters:filters.results.find(f => f.user_id === id) || emptyFilters()})), restaurants:restaurants.results, ratings:ratings.results});
  }
  if (request.method !== 'POST') fail(404, 'Ruta no encontrada.');
  const origin = request.headers.get('Origin');
  if ((origin && origin !== new URL(request.url).origin) || request.headers.get('Sec-Fetch-Site') === 'cross-site') fail(403, 'Origen no permitido.');
  const data = await readBody(request);
  if (['/api/register','/api/login'].includes(path)) return authenticate(path, request, env, data);
  const user = await currentUser(request, env);
  if (!user) fail(401, 'Inicia sesión para continuar.');
  if (path === '/api/logout') {
    await query(env, 'DELETE FROM sessions WHERE token_hash=?', await sha256(sessionToken(request))).run();
    return json(200, {ok:true}, sessionCookie(request, '', 0));
  }
  if (path === '/api/office/reverse') return json(200,await reverseOffice(env,data,fail));
  if (path === '/api/office/search') return json(200,await locateOffice(env,data,fail));
  if (path === '/api/office') {
    if (!validPoint(data)) fail(400,'Revisa las coordenadas de la oficina.');
    const address=typeof data.address==='string'?data.address.trim():'';
    if(address.length>200)fail(400,'La dirección es demasiado larga.');
    await query(env,'INSERT INTO office_locations(user_id,latitude,longitude,address) VALUES(?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET latitude=excluded.latitude,longitude=excluded.longitude,address=excluded.address',user.id,data.latitude,data.longitude,address).run();
    return json(200,{ok:true});
  }
  if (path === '/api/nearby') return json(200,await nearby(env,user,data,permitted,fail));
  if (path === '/api/filters') {
    const {max_minutes, max_price, cuisine} = data;
    if (!(max_minutes === null || Number.isInteger(max_minutes) && max_minutes >= 0 && max_minutes <= 300)
      || !(max_price === null || typeof max_price === 'number' && Number.isFinite(max_price) && max_price >= 0 && max_price <= 500)
      || typeof cuisine !== 'string' || cuisine.trim().length > 200) fail(400, 'Revisa los minutos, presupuesto y cocina de tus filtros.');
    const day = today();
    await query(env, `INSERT INTO daily_filters(user_id,day,max_minutes,max_price,cuisine) VALUES(?,?,?,?,?)
      ON CONFLICT(user_id) DO UPDATE SET day=excluded.day,max_minutes=excluded.max_minutes,max_price=excluded.max_price,cuisine=excluded.cuisine`, user.id,day,max_minutes,max_price,cuisine.trim()).run();
    return json(200, {ok:true, day});
  }
  if (path === '/api/restaurants') {
    const name = typeof data.name === 'string' ? data.name.trim() : '';
    const cuisine = typeof data.cuisine === 'string' ? data.cuisine.trim() : '';
    const address = typeof data.address === 'string' ? data.address.trim() : '';
    const price = Number(data.price), minutes = Number(data.minutes);
    if (!name || !cuisine || Math.max(name.length,cuisine.length,address.length) > 200 || !Number.isFinite(price) || price <= 0 || price > 500 || data.minutes === '' || !Number.isInteger(minutes) || minutes < 0 || minutes > 300) fail(400, 'Revisa el nombre, cocina, precio y minutos desde la oficina.');
    const external = data.external_id || null;
    if (external && (typeof external !== 'string' || !/^(node|way|relation)\/\d+$/.test(external) || !validPoint(data))) fail(400,'Revisa la ubicación del restaurante.');
    if (external && await query(env,'SELECT id FROM restaurants WHERE external_id=?',external).first()) fail(409,'Este sitio ya está guardado en el catálogo.');
    await query(env, 'INSERT INTO restaurants(name,cuisine,price,minutes,address,latitude,longitude,external_id) VALUES(?,?,?,?,?,?,?,?)', name,cuisine,price,minutes,address,external ? data.latitude : null,external ? data.longitude : null,external).run();
    return json(200, {ok:true});
  }
  if (path === '/api/ratings') {
    const values = categories.map(category => data[category]);
    if (!Number.isInteger(data.restaurant_id) || values.some(v => !Number.isInteger(v) || v < 1 || v > 5)) fail(400, 'Todas las notas deben estar entre 1 y 5.');
    if (!await query(env, 'SELECT id FROM restaurants WHERE id=?', data.restaurant_id).first()) fail(404, 'El restaurante no existe.');
    await query(env, `INSERT INTO ratings(user_id,restaurant_id,quality,service,value,distance) VALUES(?,?,?,?,?,?)
      ON CONFLICT(user_id,restaurant_id) DO UPDATE SET quality=excluded.quality,service=excluded.service,value=excluded.value,distance=excluded.distance`, user.id,data.restaurant_id,...values).run();
    return json(200, {ok:true});
  }
  if (path === '/api/recommendations') {
    if (!Array.isArray(data.members) || !data.members.length || data.members.length > 100 || data.members.some(x => !Number.isInteger(x))) fail(400, 'Selecciona compañeros registrados.');
    const members = [...new Set(data.members)];
    const [users, restaurants, ratings, filters] = await env.DB.batch([
      query(env, 'SELECT id,email FROM users'),
      query(env, 'SELECT id,name,cuisine,price,minutes,address,demo FROM restaurants'),
      query(env, 'SELECT * FROM ratings'),
      query(env, 'SELECT * FROM daily_filters WHERE day=?',today())
    ]);
    const valid = new Set(users.results.filter(u => permitted(env,u.email)).map(u => u.id));
    if (members.some(x => !valid.has(x))) fail(400, 'Selecciona compañeros autorizados.');
    const groupFilters = filters.results.filter(f => members.includes(f.user_id));
    return json(200, {recommendations:recommendations(restaurants.results,ratings.results.filter(r=>valid.has(r.user_id)),members).filter(r => groupFilters.every(f => matchesFilters(r,f)))});
  }
  fail(404, 'Ruta no encontrada.');
}

export default {
  async fetch(request, env) {
    try {return secureResponse(await handle(request, env), request);}
    catch (error) {
      if (error instanceof HttpError) return secureResponse(json(error.status, {error:error.message,...error.details}), request);
      console.error('No se pudo completar una operación', error.name);
      return secureResponse(json(503, {error:'El servicio no está disponible temporalmente. Vuelve a intentarlo.'}), request);
    }
  }
};

