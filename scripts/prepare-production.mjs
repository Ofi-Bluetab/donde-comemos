import {randomBytes} from 'node:crypto';
import {existsSync, mkdirSync, writeFileSync, readFileSync} from 'node:fs';

mkdirSync('data', {recursive:true});
const file = 'data/deployment-secrets.json';
if (!existsSync(file)) {
  const secrets = {PASSWORD_PEPPER:randomBytes(32).toString('hex')};
  writeFileSync(file, JSON.stringify(secrets), {mode:0o600});
}
const secrets = JSON.parse(readFileSync(file,'utf8'));
if (!secrets.PASSWORD_PEPPER || secrets.PASSWORD_PEPPER.length < 32) throw new Error('Secretos de despliegue no válidos.');
// Preserve existing administrative secrets; group codes now come from D1.
console.log('Secretos de publicación preparados en data/ (excluida de Git). No se muestran en el registro.');
