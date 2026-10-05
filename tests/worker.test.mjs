import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync, readdirSync} from 'node:fs';
import {today, matchesFilters, emptyFilters} from '../public/filters.js';
import worker from '../worker/index.js';
import {passwordHash, verifyPassword, sha256} from '../worker/auth.js';
import {recommendations} from '../worker/recommendations.js';

// Adapter executes the production SQL against SQLite, matching the D1 methods used.
function fixture(beforeGroups) {
  const database = new DatabaseSync(':memory:');
  database.exec('PRAGMA foreign_keys=ON');
  for (const file of readdirSync(new URL('../migrations/', import.meta.url)).filter(f => f.endsWith('.sql')).sort()) {
    if (file === '0003_groups.sql') beforeGroups?.(database);
    database.exec(readFileSync(new URL('../migrations/'+file, import.meta.url), 'utf8'));
  }
  const wrap = (sql, values = []) => ({
    bind: (...bound) => wrap(sql, bound),
    first: async () => database.prepare(sql).get(...values) || null,
    all: async () => ({results:database.prepare(sql).all(...values)}),
    run: async () => database.prepare(sql).run(...values)
  });
  const env = {DB:{prepare:sql => wrap(sql), batch:async statements => {
    database.exec('BEGIN');
    try {const results = []; for (const statement of statements) results.push(await statement.all()); database.exec('COMMIT'); return results;}
    catch(error) {database.exec('ROLLBACK'); throw error;}
  }}, REGISTRATION_CODE:'invitation-for-tests-only-'.repeat(2), PASSWORD_PEPPER:'pepper-for-tests-only-'.repeat(2),
  ASSETS:{fetch:async () => new Response('asset', {headers:{'Content-Type':'text/html'}})}};
  async function request(path, data, cookie = '', extra = {}) {
    const headers = {'Content-Type':'application/json', 'Cookie':cookie, 'CF-Connecting-IP':'192.0.2.1', ...extra};
    const httpRequest = new Request('https://comemos.example.test'+path, data === undefined ? {headers} : {method:'POST',headers,body:JSON.stringify(data)});
    const response = await worker.fetch(httpRequest, env);
    const result = {status:response.status, headers:response.headers, body:await response.json(), cookie:response.headers.get('Set-Cookie')?.split(';')[0] || ''};
    return result;
  }
  return {database,env,request};
}

test('restaurant deletion requires authentication and origin, removes all ratings and preserves other data', async () => {
  const f=fixture();try {
    const a=await f.request('/api/register',{name:'Delete A',email:'delete-a@example.test',password:'test-password'});
    const b=await f.request('/api/register',{name:'Delete B',email:'delete-b@example.test',password:'test-password'});
    for(const name of ['Eliminar','Conservar'])await f.request('/api/restaurants',{name,cuisine:'Casera',price:15,minutes:5},a.cookie);
    const rows=(await f.request('/api/state',undefined,a.cookie)).body.restaurants;
    const id=rows[0].id,keep=rows[1].id;
    for(const cookie of [a.cookie,b.cookie])for(const restaurant_id of [id,keep])await f.request('/api/ratings',{restaurant_id,quality:5,service:4,value:3,distance:2},cookie);
    assert.equal((await f.request('/api/restaurants/delete',{restaurant_id:id})).status,401);
    assert.equal((await f.request('/api/restaurants/delete',{restaurant_id:id},a.cookie,{Origin:'https://evil.test'})).status,403);
    for(const restaurant_id of [null,0,-1,1.5,'1'])assert.equal((await f.request('/api/restaurants/delete',{restaurant_id},a.cookie)).status,400);
    assert.equal((await f.request('/api/restaurants/delete',{restaurant_id:id},b.cookie)).status,200);
    assert.equal((await f.request('/api/restaurants/delete',{restaurant_id:id},b.cookie)).status,404);
    assert.equal(f.database.prepare('SELECT COUNT(*) n FROM ratings WHERE restaurant_id=?').get(id).n,0);
    assert.equal(f.database.prepare('SELECT COUNT(*) n FROM ratings WHERE restaurant_id=?').get(keep).n,2);
    for(const cookie of [a.cookie,b.cookie])assert.deepEqual((await f.request('/api/state',undefined,cookie)).body.restaurants.map(r=>r.id),[keep]);
    const uid=(await f.request('/api/state',undefined,a.cookie)).body.user.id;
    assert.deepEqual((await f.request('/api/recommendations',{members:[uid]},a.cookie)).body.recommendations.map(r=>r.id),[keep]);
  }finally{f.database.close();}
});

test('private accounts, shared catalogue, isolated ratings, recommendations and revoked session', async () => {
  const f = fixture();
  try {
    assert.equal((await f.request('/api/state')).status,401);
    assert.equal((await f.request('/api/config')).body.registration_code_required,false);
    const ana = await f.request('/api/register',{name:'Ana',email:'ana@example.test',password:'test-password'});
    assert.equal(ana.status,200);
    assert.match(ana.headers.get('Set-Cookie'), /HttpOnly.*SameSite=Strict.*Secure/);
    let state = await f.request('/api/state',undefined,ana.cookie);
    assert.equal(state.body.restaurants.length,0);
    assert.equal(await f.request('/api/restaurants',{name:'Sitio real',cuisine:'Casera',price:'15',minutes:'6',address:'Calle'},ana.cookie).then(r=>r.status),200);
    state = await f.request('/api/state',undefined,ana.cookie);
    const rid = state.body.restaurants[0].id, uid = state.body.user.id;
    const rating = {restaurant_id:rid,quality:5,service:4,value:5,distance:4};
    assert.equal((await f.request('/api/ratings',rating,ana.cookie)).status,200);
    rating.service = 5;
    assert.equal((await f.request('/api/ratings',rating,ana.cookie)).status,200);
    assert.equal(f.database.prepare('SELECT COUNT(*) AS total FROM ratings').get().total,1);
    const luis = await f.request('/api/register',{name:'Luis',email:'luis@example.test',password:'other-password',registration_code:f.env.REGISTRATION_CODE});
    assert.equal((await f.request('/api/state',undefined,luis.cookie)).body.ratings.length,0);
    const rec = await f.request('/api/recommendations',{members:[uid]},ana.cookie);
    assert.equal(rec.body.recommendations[0].coverage,1);
    assert.equal((await f.request('/api/ratings',{...rating,quality:6},ana.cookie)).status,400);
    assert.equal((await f.request('/api/ratings',rating,ana.cookie, {Origin:'https://evil.test'})).status,403);
    assert.equal((await f.request('/api/recommendations',{members:[999]},ana.cookie)).status,400);
    assert.equal((await f.request('/api/login',{email:'ana@example.test',password:'wrong-password'})).status,401);
    assert.equal((await f.request('/api/logout',{},ana.cookie)).status,200);
    assert.equal((await f.request('/api/state',undefined,ana.cookie)).status,401);
    assert.equal((await f.request('/api/login',{email:'ana@example.test',password:'test-password'})).status,200);
    const stored = f.database.prepare('SELECT token_hash FROM sessions LIMIT 1').get();
    assert.equal(stored.token_hash.length,64);
    assert.notEqual(stored.token_hash,luis.cookie.split('=')[1]);
  } finally {f.database.close();}
});

test('former groups no longer hide the catalogue; existing data, passwords and sessions remain intact', async () => {
  const token='a'.repeat(64), hash=await passwordHash('test-password','pepper-for-tests-only-'.repeat(2)), tokenHash=await sha256(token);
  const f=fixture(db=> {
    db.prepare('INSERT INTO users(id,name,email,password) VALUES(1,?,?,?)').run('Antes','before@example.test',hash);
    db.exec("INSERT INTO restaurants(id,name,cuisine,price,minutes) VALUES(9,'Antes','Casera',15,5)");
    db.exec('INSERT INTO ratings VALUES(1,9,5,4,3,2)');
    db.prepare('INSERT INTO sessions(token_hash,user_id,expires) VALUES(?,1,?)').run(tokenHash,Math.floor(Date.now()/1000)+3600);
    db.prepare('INSERT INTO daily_filters(user_id,day,max_minutes,max_price,cuisine) VALUES(1,?,5,20,?)').run(today(),'Casera');
  });
  try {
    f.database.exec("INSERT INTO groups(id,name,join_code,created_by) VALUES(2,'Otro anterior','otro-anterior',1)");
    f.database.exec("INSERT INTO restaurants(id,name,cuisine,price,minutes,group_id) VALUES(10,'Otro sitio anterior','Casera',12,3,2)");
    f.database.exec('INSERT INTO ratings VALUES(1,10,4,4,4,4)');
    f.database.prepare('UPDATE sessions SET active_group_id=2 WHERE token_hash=?').run(tokenHash);
    const legacy=await f.request('/api/state',undefined,'session='+token);
    assert.equal(legacy.status,200);
    assert.equal(legacy.body.group,undefined);
    const login=await f.request('/api/login',{email:'before@example.test',password:'test-password'});
    assert.equal(login.status,200);
    const s=(await f.request('/api/state',undefined,login.cookie)).body;
    assert.equal(s.group,undefined); assert.equal(s.groups,undefined);
    assert.equal(s.restaurants[0].id,9); assert.equal(s.ratings[0].service,4);
    assert.equal(s.restaurants.length,2); assert.equal(s.ratings.length,2);
    assert.equal(s.users[0].filters.max_price,20);
    assert.equal(f.database.prepare('SELECT active_group_id FROM sessions WHERE token_hash=?').get(tokenHash).active_group_id,2);
    assert.equal(f.database.prepare('SELECT password FROM users WHERE id=1').get().password,hash);
    const outsider=await f.request('/api/register',{name:'Nuevo',email:'new@example.test',password:'test-password'});
    const fresh=(await f.request('/api/state',undefined,outsider.cookie)).body;
    assert.equal(fresh.group,undefined); assert.equal(fresh.restaurants.length,2); assert.equal(fresh.users.length,2);
    assert.equal('group_id' in s.restaurants[0],false);
    for (const route of ['create','join','select']) assert.equal((await f.request('/api/groups/'+route,{},outsider.cookie)).status,404);
  } finally {f.database.close();}
});

test('failed authentication counter is persistent and access is closed without secrets', async () => {
  const f = fixture();
  try {
    for (let i=0;i<20;i++) assert.equal((await f.request('/api/login',{email:'absent@example.test',password:'wrong-password'})).status,401);
    assert.equal((await f.request('/api/login',{email:'absent@example.test',password:'wrong-password'})).status,429);
    f.env.PASSWORD_PEPPER = '';
    assert.equal((await f.request('/api/state')).status,503);
  } finally {f.database.close();}
});

test('allowlist, malformed requests and missing restaurants', async () => {
  const f = fixture();
  try {
    f.env.ALLOWED_EMAILS = 'allowed@example.test';
    assert.equal((await f.request('/api/register',{name:'No',email:'outside@example.test',password:'test-password',registration_code:f.env.REGISTRATION_CODE})).status,403);
    const user = await f.request('/api/register',{name:'Sí',email:'allowed@example.test',password:'test-password',registration_code:f.env.REGISTRATION_CODE});
    assert.equal((await f.request('/api/ratings',{restaurant_id:999,quality:5,service:5,value:5,distance:5},user.cookie)).status,404);
    assert.equal((await f.request('/api/restaurants',{name:'X',cuisine:'X',price:'NaN',minutes:'2'},user.cookie)).status,400);
    assert.equal((await f.request('/api/login',{},'',{'Content-Type':'text/plain'})).status,415);
    assert.equal((await f.request('/api/login',{},'',{'Content-Length':'20000'})).status,413);
    f.env.ALLOWED_EMAILS = 'other@example.test';
    assert.equal((await f.request('/api/state',undefined,user.cookie)).status,401);
  } finally {f.database.close();}
});

test('password salt and pepper, equal group weight and suggestions for new places', async () => {
  const hash = await passwordHash('test-password','test-pepper');
  assert.equal(await verifyPassword('test-password',hash,'test-pepper'),true);
  assert.equal(await verifyPassword('test-password',hash,'other-pepper'),false);
  const restaurants = [{id:1,cuisine:'Casera',price:15,minutes:5},{id:2,cuisine:'casera',price:16,minutes:6}];
  const ratings = [{user_id:1,restaurant_id:1,quality:5,service:5,value:5,distance:5},{user_id:2,restaurant_id:1,quality:1,service:1,value:1,distance:1}];
  const group = recommendations(restaurants,ratings,[1,2]);
  assert.equal(group.find(r=>r.id===1).score,3);
  assert.equal(group.find(r=>r.id===2).new,true);
  assert.match(group.find(r=>r.id===2).reason,/similares/);
});

test('daily filters persist by account, combine group limits, and expire without altering ratings', async () => {
  const f = fixture();
  try {
    const signup = name => f.request('/api/register', {name, email:name+'@example.test', password:'test-password', registration_code:f.env.REGISTRATION_CODE});
    const ana = await signup('Ana'), luis = await signup('Luis');
    const restaurants = [
      {name:'Cerca', cuisine:'Asiática', price:20, minutes:5},
      {name:'Lejos', cuisine:'Asiática', price:15, minutes:6},
      {name:'Cara', cuisine:'Asiática', price:21, minutes:4},
      {name:'Pasta', cuisine:'Italiana', price:10, minutes:3}
    ];
    for (const r of restaurants) assert.equal((await f.request('/api/restaurants',r,ana.cookie)).status,200);
    let state = (await f.request('/api/state',undefined,ana.cookie)).body;
    const uid = state.user.id, lid = state.users.find(u=>u.name === 'Luis').id;
    const rating = {restaurant_id:state.restaurants[0].id, quality:5, service:4, value:4, distance:5};
    await f.request('/api/ratings',rating,ana.cookie);
    const filters = {max_minutes:5,max_price:20,cuisine:'asiatica'};
    assert.equal((await f.request('/api/filters',{...filters,user_id:lid},ana.cookie)).status,200);
    state = (await f.request('/api/state',undefined,ana.cookie)).body;
    assert.equal(state.users.find(u=>u.id === uid).filters.max_minutes,5);
    assert.deepEqual(state.users.find(u=>u.id === lid).filters,emptyFilters());
    const rec = async members => (await f.request('/api/recommendations',{members},ana.cookie)).body.recommendations;
    assert.deepEqual((await rec([uid])).map(r=>r.name),['Cerca']);
    await f.request('/api/filters',{max_minutes:null,max_price:10,cuisine:''},luis.cookie);
    assert.equal((await rec([uid,lid])).length,0);
    assert.deepEqual((await rec([lid])).map(r=>r.name),['Pasta']);
    for (const bad of [{max_minutes:-1},{max_minutes:5.5},{max_minutes:'5'},{max_price:501},{max_price:false},{cuisine:[]},{cuisine:'x'.repeat(201)}]) {
      assert.equal((await f.request('/api/filters',{...filters,...bad},ana.cookie)).status,400);
    }
    assert.equal((await f.request('/api/filters',filters)).status,401);
    assert.equal((await f.request('/api/filters',filters,ana.cookie,{Origin:'https://evil.test'})).status,403);
    f.database.prepare("UPDATE daily_filters SET day='2000-01-01' WHERE user_id=?").run(uid);
    state = (await f.request('/api/state',undefined,ana.cookie)).body;
    assert.deepEqual(state.users.find(u=>u.id === uid).filters,emptyFilters());
    assert.equal((await rec([uid])).length,4);
    assert.equal(state.ratings[0].quality,5);
    await f.request('/api/filters',emptyFilters(),luis.cookie);
    assert.equal((await rec([uid,lid])).length,4);
    assert.equal(f.database.prepare('SELECT COUNT(*) AS n FROM daily_filters').get().n,2);
    assert.equal(today(new Date('2026-10-02T22:01:00Z')),'2026-10-03');
    assert.equal(today(new Date('2026-10-02T21:59:00Z')),'2026-10-02');
    assert.equal(matchesFilters({price:0,minutes:0,cuisine:'A'}, {max_price:0,max_minutes:0,cuisine:''}),true);
  } finally {f.database.close();}
});


test('nearby uses pedestrian routes, all selected filters, confirmed prices and cached sources', async()=>{
 const f=fixture();try{
 const a=await f.request('/api/register',{name:'Mapa A',email:'mapa@example.test',password:'test-password'});
 const b=await f.request('/api/register',{name:'Mapa B',email:'mapb@example.test',password:'test-password'});
 const aid=(await f.request('/api/state',undefined,a.cookie)).body.user.id,bid=(await f.request('/api/state',undefined,b.cookie)).body.user.id;
 assert.equal((await f.request('/api/office',{latitude:NaN,longitude:1},a.cookie)).status,400);
 assert.equal((await f.request('/api/office',{latitude:40.45,longitude:-3.69},a.cookie)).status,200);
 assert.equal((await f.request('/api/state',undefined,b.cookie)).body.office.address,'Plaza de Pablo Ruiz Picasso, 11, Madrid');
 await f.request('/api/filters',{max_minutes:5,max_price:20,cuisine:'Asiática'},a.cookie);
 await f.request('/api/filters',{max_minutes:3,max_price:15,cuisine:''},b.cookie);
 let calls=0;
 f.env.NEARBY_FETCH=async url=>{calls++;return Response.json(url.includes('interpreter')?{elements:[
 {type:'node',id:11,lat:40.4501,lon:-3.6901,tags:{name:'Sushi',cuisine:'japanese'}},
 {type:'node',id:12,lat:40.4502,lon:-3.6902,tags:{name:'Lejos',cuisine:'chinese'}},
 {type:'node',id:13,lat:40.4503,lon:-3.6903,tags:{name:'Sin ruta',cuisine:'asian'}},
 {type:'node',id:14,lat:40.4504,lon:-3.6904,tags:{name:'Pizza',cuisine:'italian'}}]}:
 {code:'Ok',durations:[[120,240,null,60].slice(0,url.split('/foot/')[1].split('?')[0].split(';').length-1)],sources:[{distance:0}],destinations:[{distance:0},{distance:0},{distance:0},{distance:0}]});};
 let r=await f.request('/api/nearby',{members:[aid,bid],radius:500},a.cookie);
 assert.equal(r.status,200);assert.equal(r.body.restaurants.length,0);assert.deepEqual(r.body.pending.map(x=>x.name),['Sushi']);assert.equal(calls,2);
 assert.equal((await f.request('/api/nearby',{members:[999],radius:500},a.cookie)).status,400);
 assert.equal((await f.request('/api/nearby',{members:[aid],radius:9000},a.cookie)).status,400);
 const item={...r.body.pending[0],cuisine:'Asiática',price:18};
 assert.equal((await f.request('/api/restaurants',item,a.cookie)).status,200);
 assert.equal((await f.request('/api/restaurants',item,a.cookie)).status,409);
 r=await f.request('/api/nearby',{members:[aid],radius:500},a.cookie);assert.equal(r.body.restaurants[0].name,'Sushi');assert.equal(r.body.restaurants[0].price,18);assert.equal(calls,2);
 r=await f.request('/api/nearby',{members:[aid,bid],radius:500},a.cookie);assert.equal(r.body.restaurants.length,0);assert.equal(r.body.pending.length,0);
 await f.request('/api/filters',emptyFilters(),b.cookie);f.database.exec('UPDATE provider_limits SET requested=0');
 r=await f.request('/api/nearby',{members:[bid],radius:500},a.cookie);assert.equal(r.body.restaurants.length,4);
 f.database.prepare('UPDATE nearby_cache SET expires=?').run(Date.now()-1000);f.database.exec('UPDATE provider_limits SET requested=0');f.env.NEARBY_FETCH=async()=>{throw new Error('offline');};
 const fallback=await f.request('/api/nearby',{members:[aid],radius:500},a.cookie);assert.equal(fallback.status,200);assert.ok(fallback.body.warnings.length);assert.equal(fallback.body.restaurants[0].price,18);
 f.database.prepare('UPDATE nearby_cache SET expires=?').run(Date.now()-604800000);f.database.exec('UPDATE provider_limits SET requested=0');assert.equal((await f.request('/api/nearby',{members:[aid],radius:500},a.cookie)).status,503);
 f.database.exec('DELETE FROM nearby_cache; DELETE FROM provider_limits');
 assert.equal((await f.request('/api/nearby',{members:[aid],radius:500},a.cookie)).status,503);
 assert.equal((await f.request('/api/nearby',{members:[aid],radius:500},a.cookie)).status,429);
 assert.equal((await f.request('/api/state',undefined,a.cookie)).body.restaurants.length,1);
 assert.equal(matchesFilters({minutes:null,price:null,cuisine:'Asiática'},{max_minutes:5,max_price:20,cuisine:''}),false);
 }finally{f.database.close();}
});


test('office address lookup requires explicit confirmation and keeps saved location on errors',async()=>{
 const f=fixture();try{
 const a=await f.request('/api/register',{name:'Dirección',email:'address@example.test',password:'test-password'});
 f.env.NEARBY_FETCH=async url=>{assert.ok(url.startsWith('https://www.cartociudad.es/'));return Response.json([{address:'PLAZA PABLO RUIZ PICASSO 11, Madrid',lat:40.450025,lng:-3.693875},{address:'Invalid',lat:null,lng:null}]);};
 assert.equal((await f.request('/api/office/search',{address:'x'},a.cookie)).status,400);
 const found=await f.request('/api/office/search',{address:'Plaza Pablo Ruiz Picasso 11 Madrid'},a.cookie);assert.equal(found.body.locations.length,1);
 assert.equal(f.database.prepare('SELECT COUNT(*) total FROM office_locations').get().total,0);
 assert.equal((await f.request('/api/office',found.body.locations[0],a.cookie)).status,200);
 const saved=(await f.request('/api/state',undefined,a.cookie)).body.office;assert.equal(saved.address,'PLAZA PABLO RUIZ PICASSO 11, Madrid');
 f.database.exec('DELETE FROM nearby_cache; UPDATE provider_limits SET requested=0');f.env.NEARBY_FETCH=async()=>Response.json({elements:[],remark:'runtime error'});
 const failed=await f.request('/api/nearby',{members:[a.body.user?.id||1],radius:500},a.cookie);assert.equal(failed.status,503);assert.equal(f.database.prepare('SELECT COUNT(*) total FROM nearby_cache').get().total,0);
 assert.deepEqual((await f.request('/api/state',undefined,a.cookie)).body.office,saved);
 }finally{f.database.close();}
});

test('reverse address preserves GPS point, formats portal, caches and handles missing or distant addresses',async()=>{
 const f=fixture();try{
 const a=await f.request('/api/register',{name:'Reverse',email:'reverse@example.test',password:'test-password'});
 const p={latitude:40.45,longitude:-3.69};let calls=0;
 f.env.NEARBY_FETCH=async url=>{calls++;assert.ok(url.includes('reverseGeocode'));return Response.json({tip_via:'CALLE',address:'PRUEBA',portalNumber:12,muni:'Madrid',lat:40.4501,lng:-3.6901});};
 const r=await f.request('/api/office/reverse',p,a.cookie);assert.equal(r.status,200);assert.equal(r.body.address,'CALLE PRUEBA 12 Madrid');assert.equal(r.body.approximate,true);
 assert.equal((await f.request('/api/office/reverse',p,a.cookie)).status,200);assert.equal(calls,1);assert.equal(f.database.prepare('SELECT COUNT(*) n FROM office_locations').get().n,0);
 assert.equal((await f.request('/api/office/reverse',{latitude:'40',longitude:0},a.cookie)).status,400);
 f.database.exec('DELETE FROM nearby_cache;DELETE FROM provider_limits');f.env.NEARBY_FETCH=async()=>Response.json({address:'Lejos',lat:41,lng:-3});assert.equal((await f.request('/api/office/reverse',p,a.cookie)).body.address,'');
 f.database.exec('DELETE FROM nearby_cache;DELETE FROM provider_limits');f.env.NEARBY_FETCH=async()=>{throw Error('offline');};assert.equal((await f.request('/api/office/reverse',p,a.cookie)).status,503);
 }finally{f.database.close();}
});
