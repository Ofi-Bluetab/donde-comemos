import {execFileSync} from 'node:child_process';
import {existsSync, readFileSync, mkdirSync, copyFileSync, writeFileSync, lstatSync} from 'node:fs';
import {resolve, dirname, relative, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const listed=execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean);
const top=new Set(['.gitignore','.env.example','AGENTS.md','README.md','STATUS.md','NEXT_ACTIONS.md','DECISIONS.md','CHANGELOG.md','RISKS.md','IDEAS.md','AGENT_LOG.md','package.json','pnpm-lock.yaml','pnpm-workspace.yaml','wrangler.jsonc','server.py','render.yaml']);
const allowed=p=>top.has(p)||/^(public|worker|migrations|scripts|tests|docs)\//.test(p);
const forbidden=p=>/(^|\/)(\.git|\.codex|\.agents|node_modules|data|__pycache__)(\/|$)/.test(p)||/(^|\/)(\.dev\.vars(?:\..*)?|\.env(?:\..*)?)$/.test(p)&&p!=='.env.example'||/\.(pem|key|p12|sqlite3?|db|pyc)$/i.test(p);
const files=[...new Set(listed)].filter(p=>allowed(p)&&!forbidden(p)).sort();
if(!files.length)throw new Error('No hay archivos compartibles.');
const secrets=[];
if(existsSync(resolve(root,'.dev.vars'))){
 for(const line of readFileSync(resolve(root,'.dev.vars'),'utf8').split(/\r?\n/)){
  const match=line.match(/^\s*[A-Z_]*(?:SECRET|TOKEN|PASSWORD|PEPPER|KEY)[A-Z_]*\s*=\s*(.*?)\s*$/);
  if(match&&match[1].length>=16)secrets.push(match[1].replace(/^['"]|['"]$/g,''));
 }
}
const production=resolve(root,'data/deployment-secrets.json');
if(existsSync(production))for(const [key,value] of Object.entries(JSON.parse(readFileSync(production,'utf8'))))if(/secret|token|password|pepper|key/i.test(key)&&typeof value==='string'&&value.length>=16)secrets.push(value);
const credentials=/(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|(?:PASSWORD_PEPPER|CLOUDFLARE_API_TOKEN)\s*[=:]\s*["']?[A-Za-z0-9_-]{32,})/;
for(const file of files){
 const absolute=resolve(root,file);
 if(relative(root,absolute).startsWith('..'+sep)||file.includes('..'))throw new Error('Ruta no válida: '+file);
 let current=root;
 for(const part of file.split('/')){current=resolve(current,part);if(lstatSync(current).isSymbolicLink())throw new Error('Enlace no exportable: '+file);}
 const content=readFileSync(absolute,'utf8');
 if(credentials.test(content)||secrets.some(secret=>content.includes(secret)))throw new Error('Posible secreto: '+file+'. Exportación cancelada sin mostrar valores.');
}
const target=resolve(root,'data/share',new Date().toISOString().replace(/[:.]/g,'-')+'-'+randomUUID().slice(0,8));
mkdirSync(target,{recursive:true});
for(const file of files){const destination=resolve(target,file);mkdirSync(dirname(destination),{recursive:true});copyFileSync(resolve(root,file),destination);}
writeFileSync(resolve(target,'ARCHIVOS_COMPARTIDOS.txt'),files.join('\n')+'\n');
console.log(`Copia preparada: ${target}\n${files.length} archivos. Sin publicación ni permisos concedidos.`);
