// Prepare public OSM cache only; apply the generated SQL explicitly to the intended D1.
import {readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {defaultOffice, overpassQuery} from '../worker/nearby.js';

const key='osm-get:'+ [defaultOffice.latitude,defaultOffice.longitude].map(n=>n.toFixed(6)).join(':')+':2000';
let source;
if(process.argv.includes('--from-local-cache')) {
  const directory='.wrangler/state/v3/d1/miniflare-D1DatabaseObject';
  for(const file of readdirSync(directory).filter(f=>f.endsWith('.sqlite')&&f!=='metadata.sqlite')) {
    const db=new DatabaseSync(directory+'/'+file,{readOnly:true});
    try {source ||= db.prepare('SELECT payload,expires FROM nearby_cache WHERE cache_key=? AND expires>?').get(key,Date.now());} catch {}
    finally {db.close();}
  }
  if(!source)throw Error('No hay caché pública fresca de la oficina; no se cambia su fecha.');
} else {
  const config=JSON.parse(readFileSync('wrangler.jsonc','utf8'));
  const endpoint=config.vars.OVERPASS_URL || 'https://overpass-api.de/api/interpreter';
  const response=await fetch(endpoint+'?'+new URLSearchParams({data:overpassQuery(defaultOffice)}),{headers:{Accept:'application/json','User-Agent':'DondeComemos/0.2 (+https://donde-comemos.mesa-equipo-dfv.workers.dev)'},signal:AbortSignal.timeout(35000)});
  if(!response.ok)throw Error('Overpass '+response.status);
  source={payload:JSON.stringify(await response.json()),expires:Date.now()+21600000};
}
const raw=JSON.parse(source.payload);
if(!Array.isArray(raw.elements)||raw.remark)throw Error('Respuesta pública incompleta.');
const quote=s=>s.replaceAll("'","''");
let sql=`INSERT INTO nearby_cache(cache_key,payload,expires) VALUES('${quote(key)}','',${source.expires}) ON CONFLICT(cache_key) DO UPDATE SET payload='',expires=excluded.expires;\n`;
const characters=Array.from(source.payload);
// D1 caps SQL statement length; split by code points to preserve Unicode.
for(let i=0;i<characters.length;i+=20000)sql+=`UPDATE nearby_cache SET payload=payload||'${quote(characters.slice(i,i+20000).join(''))}' WHERE cache_key='${quote(key)}';\n`;
writeFileSync('data/public-office-cache.sql',sql);
console.log('SQL público preparado:',raw.elements.length,'elementos; caducidad original:',new Date(source.expires).toISOString(),'. No se han modificado cuentas/restaurantes/notas ni D1 remoto.');
