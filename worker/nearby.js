import {today, matchesFilters, normalizeCuisine} from '../public/filters.js';

export const defaultOffice = {latitude:40.45002533227958,longitude:-3.693875262562316,address:'Plaza de Pablo Ruiz Picasso, 11, Madrid',source:'CartoCiudad (IGN/CNIG)'};
export async function officeFor(env,user){const office=await q(env,'SELECT latitude,longitude,address FROM office_locations WHERE user_id=?',user.id).first();return office||defaultOffice;}
export function metres(a,b){const radians=Math.PI/180,dlat=(b.latitude-a.latitude)*radians,dlon=(b.longitude-a.longitude)*radians,h=Math.sin(dlat/2)**2+Math.cos(a.latitude*radians)*Math.cos(b.latitude*radians)*Math.sin(dlon/2)**2;return 12742000*Math.asin(Math.min(1,Math.sqrt(h)));}
export const validPoint = p => typeof p.latitude === 'number' && Number.isFinite(p.latitude) && Math.abs(p.latitude)<=85 && typeof p.longitude === 'number' && Number.isFinite(p.longitude) && Math.abs(p.longitude)<=180;
export const overpassQuery = office => `[out:json][timeout:10][maxsize:33554432];nwr(around:2000,${office.latitude},${office.longitude})[amenity=restaurant][name];out tags center;`;
const q = (env,sql,...args) => env.DB.prepare(sql).bind(...args);
export function cuisines(value='') {
  const aliases={asian:'Asiática',japanese:'Asiática',chinese:'Asiática',thai:'Asiática',korean:'Asiática',vietnamese:'Asiática',indian:'Asiática',ramen:'Asiática',sushi:'Asiática',italian:'Italiana',pizza:'Italiana',spanish:'Española',mediterranean:'Mediterránea',mexican:'Mexicana',burger:'Hamburguesas',regional:'Casera'};
  return [...new Set(value.split(';').flatMap(c=>[c.trim(),aliases[c.trim().toLowerCase()]]).filter(Boolean))];
}
export function compatible(r,filters,ignorePrice=false) {
  return filters.every(f=>matchesFilters({...r,cuisine:f.cuisine && r.cuisines.some(c=>normalizeCuisine(c)===normalizeCuisine(f.cuisine)) ? f.cuisine : r.cuisine},{...f,max_price:ignorePrice?null:f.max_price}));
}
async function cached(env,key,provider,task,fail,warnings=[]) {
  const now=Date.now(),stored=await q(env,'SELECT payload,expires FROM nearby_cache WHERE cache_key=? AND expires>?',key,now-604800000+21600000).first();
  if(stored?.expires>now)return JSON.parse(stored.payload);
  const previous=()=>{warnings.push('Servicio temporalmente no disponible: se muestran los últimos datos disponibles, de '+new Date(stored.expires-21600000).toLocaleDateString('es-ES',{timeZone:'Europe/Madrid'})+'.');return JSON.parse(stored.payload);};
  const claim=await q(env,`INSERT INTO provider_limits(provider,requested) VALUES(?,?) ON CONFLICT(provider) DO UPDATE SET requested=excluded.requested WHERE provider_limits.requested<=? RETURNING requested`,provider,now,now-1000).first();
  if(!claim && stored)return previous();
  if(!claim)fail(429,'Hay otra búsqueda en curso. Espera unos segundos y vuelve a buscar.');
  let result;try{result=await task();}catch(error){if(stored && error.status===503)return previous();throw error;}
  await q(env,'DELETE FROM nearby_cache WHERE expires<=?',now-604800000+21600000).run();
  await q(env,'INSERT INTO nearby_cache(cache_key,payload,expires) VALUES(?,?,?) ON CONFLICT(cache_key) DO UPDATE SET payload=excluded.payload,expires=excluded.expires',key,JSON.stringify(result),now+21600000).run();
  return result;
}
async function remote(env,url,options,fail,label) {
  let upstreamStatus;
  try {
    const response=await (env.NEARBY_FETCH || fetch)(url,{...options,headers:{'User-Agent':'DondeComemos/0.2 (+https://donde-comemos.mesa-equipo-dfv.workers.dev)','Accept':'application/json','Referer':'https://donde-comemos.mesa-equipo-dfv.workers.dev/',...options?.headers},signal:AbortSignal.timeout(label==='Overpass'?35000:25000)});
    upstreamStatus=response.status;
    if(!response.ok){console.warn('Proveedor externo',label,response.status);throw new Error('provider');}
    const text=await response.text();if(text.length>2000000)throw new Error('size');
    return JSON.parse(text);
  } catch (error) {fail(503,label==='CartoCiudad'?'No se puede localizar la dirección ahora. Inténtalo de nuevo; la salida guardada se conserva.':label==='Overpass'?'No se pueden consultar restaurantes ahora. Inténtalo de nuevo; tu catálogo sigue disponible.':'No se pueden calcular las rutas a pie ahora. Inténtalo de nuevo; tu catálogo sigue disponible.',{provider:label,upstream_status:upstreamStatus??null,upstream_error:error.name});}
}
export async function nearby(env,user,data,permitted,fail) {
  if(!Array.isArray(data.members)||!data.members.length||data.members.length>100||data.members.some(id=>!Number.isInteger(id)))fail(400,'Selecciona al menos un compañero.');
  const [users,filters,saved]=await env.DB.batch([q(env,'SELECT id,email FROM users'),q(env,'SELECT * FROM daily_filters WHERE day=?',today()),q(env,'SELECT * FROM restaurants WHERE external_id IS NOT NULL')]);
  if(data.members.some(id=>!users.results.some(u=>u.id===id&&permitted(env,u.email))))fail(400,'Selecciona compañeros autorizados.');
  const criteria=filters.results.filter(f=>data.members.includes(f.user_id));
  const office=await officeFor(env,user),warnings=[];
  const radius=Number(data.radius);if(![500,1000,2000].includes(radius))fail(400,'Elige un radio de 500, 1000 o 2000 metros.');
  const origin=[office.latitude,office.longitude].map(n=>n.toFixed(6)).join(':');
  const key=`osm-get:${origin}:2000`;
  const raw=await cached(env,key,'overpass',async()=>{
    const url=(env.OVERPASS_URL||'https://overpass-api.de/api/interpreter')+'?'+new URLSearchParams({data:overpassQuery(office)});
    const result=await remote(env,url,{},fail,'Overpass');
    if(!Array.isArray(result.elements)||result.remark)fail(503,'La fuente de restaurantes ha devuelto datos incompletos. Inténtalo de nuevo.');
    return result;
  },fail,warnings);
  const candidates=raw.elements.map(e=>{const local=saved.results.find(r=>r.external_id===`${e.type}/${e.id}`);const latitude=e.lat??e.center?.lat,longitude=e.lon??e.center?.lon;return {external_id:`${e.type}/${e.id}`,latitude,longitude,name:String(e.tags?.name||'').slice(0,200),cuisine:local?.cuisine||cuisines(e.tags?.cuisine).find(c=>['Asiática','Italiana','Española','Mediterránea','Mexicana','Hamburguesas','Casera'].includes(c))||e.tags?.cuisine||'',cuisines:local?[local.cuisine]:cuisines(e.tags?.cuisine),price:local?.price??null,id:local?.id??null,address:local?.address||[e.tags?.['addr:street'],e.tags?.['addr:housenumber']].filter(Boolean).join(' ').slice(0,200)};}).filter(r=>validPoint(r)&&r.name&&metres(office,r)<=radius);
  candidates.sort((a,b)=>metres(office,a)-metres(office,b)||a.external_id.localeCompare(b.external_id));
  const rows=candidates.filter(r=>compatible({...r,minutes:0},criteria.map(f=>({...f,max_minutes:null,max_price:null})))).slice(0,30);
  if(rows.length){
    const coords=[office,...rows].map(p=>`${p.longitude.toFixed(6)},${p.latitude.toFixed(6)}`).join(';');
    const route=await cached(env,`foot-v2:${coords}`,'foot',async()=>{const result=await remote(env,`${env.FOOT_URL||'https://routing.openstreetmap.de/routed-foot'}/table/v1/foot/${coords}?sources=0&destinations=${rows.map((_,i)=>i+1).join(';')}&annotations=duration,distance`,{},fail,'FOSSGIS');if(result.code!=='Ok'||result.durations?.[0]?.length!==rows.length)fail(503,'El servicio de rutas ha devuelto datos incompletos. Inténtalo de nuevo.');return result;},fail,warnings);
    if(route.code!=='Ok'||!Array.isArray(route.durations?.[0]))fail(503,'No se han podido calcular las rutas a pie.');
    rows.forEach((r,i)=>{const duration=route.durations[0][i],offset=(route.sources?.[0]?.distance??Infinity)+(route.destinations?.[i]?.distance??Infinity);r.minutes=typeof duration==='number'&&Number.isFinite(duration)&&duration>=0&&offset<=100?Math.ceil((duration+offset/1.1)/60):null;});
  }
  rows.sort((a,b)=>(a.minutes??Infinity)-(b.minutes??Infinity));
  return {office,warnings:[...new Set(warnings)],restaurants:rows.filter(r=>compatible(r,criteria)),pending:rows.filter(r=>r.price===null&&criteria.some(f=>f.max_price!==null)&&compatible(r,criteria,true)),examined:rows.length,total:candidates.length,day:today()};
}

export async function locateOffice(env,data,fail){
 const address=typeof data.address==='string'?data.address.trim():'';
 if(address.length<5||address.length>200)fail(400,'Introduce una dirección y el municipio (entre 5 y 200 caracteres).');
 const results=await cached(env,'address:'+address.toLocaleLowerCase('es'),'cartociudad',()=>remote(env,'https://www.cartociudad.es/geocoder/api/geocoder/candidates?'+new URLSearchParams({q:address,limit:'5',no_process:'municipio,provincia,comunidad autonoma,poblacion,toponimo'}),{},fail,'CartoCiudad'),fail);
 if(!Array.isArray(results))fail(503,'CartoCiudad ha devuelto una respuesta incompleta.');
 const locations=results.map(r=>({address:String(r.address||'').slice(0,200),latitude:r.lat,longitude:r.lng})).filter(r=>validPoint(r)&&r.address);
 return {locations};
}

export async function reverseOffice(env,data,fail){
 if(!validPoint(data))fail(400,'Ubicación no válida.');
 const key=`reverse:${data.latitude.toFixed(6)}:${data.longitude.toFixed(6)}`;
 const r=await cached(env,key,'cartociudad',async()=>{
  const result=await remote(env,'https://www.cartociudad.es/geocoder/api/geocoder/reverseGeocode?'+new URLSearchParams({lat:data.latitude,lon:data.longitude}),{},fail,'CartoCiudad');
  if(!result||typeof result!=='object'||Array.isArray(result))fail(503,'No se ha podido obtener la dirección.');
  return result;
 },fail);
 const near={latitude:r.lat,longitude:r.lng};
 const address=typeof r.address==='string'&&r.address.trim()&&validPoint(near)&&metres(data,near)<=350?[r.tip_via,r.address,r.portalNumber,r.muni||r.poblacion].filter(v=>v!==null&&v!==undefined&&v!=='').join(' ').slice(0,200):'';
 return {address,approximate:true};
}
