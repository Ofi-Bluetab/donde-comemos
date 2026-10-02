import http.client
import json
import sys
import tempfile
import threading
import unittest
import sqlite3
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import server


class AppTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory()
        server.DB = Path(cls.temp.name) / 'comemos.sqlite3'
        server.initialize()
        cls.http = server.ThreadingHTTPServer(('127.0.0.1', 0), server.Handler)
        cls.thread = threading.Thread(target=cls.http.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.http.shutdown()
        cls.http.server_close()
        cls.temp.cleanup()

    def request(self, path, data=None, cookie='', origin=None):
        connection = http.client.HTTPConnection('127.0.0.1', self.http.server_port)
        headers = {'Content-Type': 'application/json', 'Cookie': cookie}
        if origin:
            headers['Origin'] = origin
        connection.request('GET' if data is None else 'POST', path, None if data is None else json.dumps(data), headers)
        response = connection.getresponse()
        body = json.loads(response.read())
        result = response.status, body, response.getheader('Set-Cookie', '').split(';')[0]
        connection.close()
        return result

    def test_accounts_ratings_recommendations_and_logout(self):
        self.assertEqual(self.request('/api/state')[0], 401)
        status, _, cookie = self.request('/api/register', {'name': 'Ana', 'email': 'ana@example.test', 'password': 'pass-test-123'})
        self.assertEqual(status, 200)
        _, state, _ = self.request('/api/state', cookie=cookie)
        uid = state['user']['id']
        rid = state['restaurants'][0]['id']
        rating = {'restaurant_id': rid, 'quality': 5, 'service': 4, 'value': 4, 'distance': 5}
        self.assertEqual(self.request('/api/ratings', rating, cookie)[0], 200)
        rating['service'] = 5
        self.assertEqual(self.request('/api/ratings', rating, cookie)[0], 200)
        _, state, _ = self.request('/api/state', cookie=cookie)
        self.assertEqual(len(state['ratings']), 1)
        self.assertEqual(state['ratings'][0]['service'], 5)
        _, result, _ = self.request('/api/recommendations', {'members': [uid]}, cookie)
        self.assertEqual(result['recommendations'][0]['id'], rid)
        self.assertEqual(result['recommendations'][0]['coverage'], 1)
        self.assertTrue(any(x['new'] and 'similares' in x['reason'] for x in result['recommendations']))
        rating['quality'] = 6
        self.assertEqual(self.request('/api/ratings', rating, cookie)[0], 400)
        self.assertEqual(self.request('/api/ratings', rating, cookie, 'https://evil.test')[0], 403)
        self.assertEqual(self.request('/api/recommendations', {'members': []}, cookie)[0], 400)
        status, _, cookie2 = self.request('/api/register', {'name': 'Luis', 'email': 'luis@example.test', 'password': 'pass-test-456'})
        self.assertEqual(status, 200)
        _, other, _ = self.request('/api/state', cookie=cookie2)
        self.assertEqual(other['ratings'], [])
        self.assertEqual(self.request('/api/login', {'email': 'ana@example.test', 'password': 'wrong-pass'})[0], 401)
        self.assertEqual(self.request('/api/logout', {}, cookie)[0], 200)
        self.assertEqual(self.request('/api/state', cookie=cookie)[0], 401)
        self.assertEqual(self.request('/api/login', {'email': 'ana@example.test', 'password': 'pass-test-123'})[0], 200)

    def test_group_has_equal_weight(self):
        restaurants = [{'id': 1, 'cuisine': 'Casera', 'price': 12, 'minutes': 5}]
        ratings = [{'user_id': uid, 'restaurant_id': 1, **dict.fromkeys(server.CATEGORIES, score)} for uid, score in [(1, 5), (2, 1)]]
        result = server.recommendations(restaurants, ratings, {1, 2})
        self.assertEqual(result[0]['score'], 3)
        self.assertEqual(result[0]['coverage'], 2)

    def test_persistence_restart_and_backup(self):
        status, _, cookie = self.request('/api/register', {'name': 'Memoria', 'email': 'memoria@example.test', 'password': 'persistent-test'})
        self.assertEqual(status, 200)
        _, before, _ = self.request('/api/state', cookie=cookie)
        rating = {'restaurant_id': before['restaurants'][0]['id'], **dict.fromkeys(server.CATEGORIES, 4)}
        self.assertEqual(self.request('/api/ratings', rating, cookie)[0], 200)
        cls = type(self)
        cls.http.shutdown()
        cls.http.server_close()
        server.initialize()
        cls.http = server.configured_server('127.0.0.1', 0)
        cls.thread = threading.Thread(target=cls.http.serve_forever, daemon=True)
        cls.thread.start()
        status, after, _ = self.request('/api/state', cookie=cookie)
        self.assertEqual(status, 200)
        self.assertEqual(after['user'], before['user'])
        self.assertEqual(after['restaurants'], before['restaurants'])
        self.assertEqual(after['ratings'][0]['quality'], 4)
        target = server.backup_database(Path(cls.temp.name) / 'backups')
        copy = sqlite3.connect(target)
        try:
            self.assertEqual(copy.execute('PRAGMA integrity_check').fetchone()[0], 'ok')
            self.assertEqual(copy.execute('SELECT quality FROM ratings WHERE user_id=?', (before['user']['id'],)).fetchone()[0], 4)
        finally:
            copy.close()

    def test_private_configuration_and_attempt_limits(self):
        with self.assertRaises(ValueError):
            server.configured_server('0.0.0.0', 0)
        with self.assertRaises(ValueError):
            server.configured_server('0.0.0.0', 0, allowed_emails=['ana@example.test'])
        self.http.allowed_emails = {'permitted@example.test'}
        try:
            self.assertEqual(self.request('/api/register', {'name':'Fuera', 'email':'outside@example.test', 'password':'test-password'})[0], 403)
            with server.connect() as db:
                db.execute('INSERT OR REPLACE INTO auth_attempts VALUES(?,?,?)', ('127.0.0.1', server.time.time(), 20))
            self.assertEqual(self.request('/api/login', {'email':'permitted@example.test', 'password':'test-password'})[0], 429)
        finally:
            self.http.allowed_emails = set()
            with server.connect() as db:
                db.execute('DELETE FROM auth_attempts')

    def test_render_invitation_and_origin_boundary(self):
        self.http.allowed_emails = {'invited@example.test'}
        self.http.registration_code = 'test-invitation-code-123456'
        self.http.public_origin = 'https://comemos.example.test'
        self.http.secure_cookies = True
        payload = {'name':'Invitado', 'email':'invited@example.test', 'password':'test-password'}
        try:
            self.assertEqual(self.request('/api/config')[1]['registration_code_required'], True)
            self.assertEqual(self.request('/api/register', payload)[0], 403)
            payload['registration_code'] = self.http.registration_code
            self.assertEqual(self.request('/api/register', payload, origin='https://wrong.example.test')[0], 403)
            connection = http.client.HTTPConnection('127.0.0.1', self.http.server_port)
            connection.request('POST', '/api/register', json.dumps(payload), {'Content-Type':'application/json', 'Origin':self.http.public_origin})
            response = connection.getresponse()
            response.read()
            self.assertEqual(response.status, 200)
            self.assertIn('; Secure', response.getheader('Set-Cookie'))
            connection.close()
        finally:
            self.http.allowed_emails = set()
            self.http.registration_code = None
            self.http.public_origin = None
            self.http.secure_cookies = False


if __name__ == '__main__':
    unittest.main()
