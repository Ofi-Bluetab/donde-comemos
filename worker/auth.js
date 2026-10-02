const encoder = new TextEncoder();
const hex = bytes => [...new Uint8Array(bytes)].map(value => value.toString(16).padStart(2, '0')).join('');
export const randomToken = () => hex(crypto.getRandomValues(new Uint8Array(32)));
export const sha256 = async text => hex(await crypto.subtle.digest('SHA-256', encoder.encode(text)));

export async function equalSecrets(a, b) {
  const left = await sha256(a), right = await sha256(b);
  let difference = 0;
  for (let i = 0; i < left.length; i++) difference |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return difference === 0;
}

export async function passwordHash(password, pepper, salt = randomToken()) {
  const hmac = await crypto.subtle.importKey('raw', encoder.encode(pepper), {name:'HMAC', hash:'SHA-256'}, false, ['sign']);
  const prepared = await crypto.subtle.sign('HMAC', hmac, encoder.encode(password));
  const key = await crypto.subtle.importKey('raw', prepared, 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({name:'PBKDF2', hash:'SHA-256', salt:encoder.encode(salt), iterations:100000}, key, 256);
  return `pbkdf2:100000:${salt}:${hex(bits)}`;
}

export async function verifyPassword(password, stored, pepper) {
  if (!/^pbkdf2:100000:[a-f0-9]{64}:[a-f0-9]{64}$/.test(stored)) return false;
  return equalSecrets(await passwordHash(password, pepper, stored.split(':')[2]), stored);
}

export function sessionToken(request) {
  const match = (request.headers.get('Cookie') || '').match(/(?:^|;\s*)session=([a-f0-9]{64})(?:;|$)/);
  return match?.[1] || '';
}

export function sessionCookie(request, token, maxAge = 604800) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`;
}
