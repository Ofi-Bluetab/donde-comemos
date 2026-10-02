import {randomBytes} from 'node:crypto';
import {existsSync, writeFileSync} from 'node:fs';

if (!existsSync('.dev.vars')) {
  writeFileSync('.dev.vars', `PASSWORD_PEPPER=${randomBytes(32).toString('hex')}\n`, {mode:0o600});
  console.log('Secretos locales creados en .dev.vars (archivo excluido de Git).');
} else {
  console.log('Se conservan los secretos locales existentes.');
}
