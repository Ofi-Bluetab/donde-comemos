export const overpassQuery = office => `[out:json][timeout:10][maxsize:33554432];nwr(around:2000,${office.latitude},${office.longitude})[amenity=restaurant][name];out tags center;`;

// Only public map data travels here. Accounts, prices and filters stay on our API.
const sources=new Map();
export function browserRestaurants(office) {
  const key=[office.latitude,office.longitude].map(n=>n.toFixed(6)).join(':');
  const stored=sources.get(key);if(stored?.expires>Date.now())return stored.result;
  if(sources.size>=8)sources.delete(sources.keys().next().value);
  const result=fetchBrowserRestaurants(office).catch(error=>{sources.delete(key);throw error;});
  sources.set(key,{result,expires:Date.now()+21600000});return result;
}
async function fetchBrowserRestaurants(office) {
  const body=new URLSearchParams({data:overpassQuery(office)}).toString();
  const endpoints=['https://overpass-api.de/api/interpreter','https://overpass.private.coffee/api/interpreter'];
  for(let i=0;i<endpoints.length;i++) {
    let status;
    try {
      const options={method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','Accept':'application/json'},body,credentials:'omit',signal:AbortSignal.timeout(18000)};
      let response=await fetch(endpoints[i],options);status=response.status;
      if(status===406){response=await fetch(endpoints[i]+'?'+body,{credentials:'omit',signal:AbortSignal.timeout(18000)});status=response.status;}
      if(!response.ok)throw Error('provider');
      const result=await response.json();
      if(!Array.isArray(result.elements)||result.remark)throw Error('incomplete');
      // Drop unused provider metadata and tags before forwarding to our API.
      return {elements:result.elements.map(e=>({type:e.type,id:e.id,lat:e.lat??e.center?.lat,lon:e.lon??e.center?.lon,tags:{name:e.tags?.name,cuisine:e.tags?.cuisine,'addr:street':e.tags?.['addr:street'],'addr:housenumber':e.tags?.['addr:housenumber']}}))};
    }catch(error) {
      if(i===endpoints.length-1||status&&status<500)throw new Error('No se pueden consultar restaurantes ahora. Inténtalo de nuevo; tu catálogo sigue disponible.');
    }
  }
}
