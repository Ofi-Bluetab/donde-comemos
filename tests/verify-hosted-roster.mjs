import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';

const origin='https://donde-comemos.mesa-equipo-dfv.workers.dev';
const stamp=Date.now(), accounts=[];
let cookie='';
async function api(path,data,status=200) {
  const response=await fetch(origin+'/api/'+path,{method:data === undefined?'GET':'POST',headers:{'Content-Type':'application/json',Cookie:cookie,Origin:origin},body:data === undefined?undefined:JSON.stringify(data)});
  const body=await response.json(); assert.equal(response.status,status,`${path}: ${response.status} ${body.error || ''}`);
  if(response.headers.has('Set-Cookie')) cookie=response.headers.get('Set-Cookie').split(';')[0];
  return body;
}
async function signup(suffix) {
  const user={name:'QA listado temporal',email:`qa-roster-${stamp}-${suffix}@example.test`,password:randomBytes(24).toString('hex')};
  await api('register',user); const state=await api('state');
  user.id=state.user.id; accounts.push(user);
  writeFileSync('data/cleanup-hosted-roster.sql',`DELETE FROM users WHERE ${accounts.map(u=>`(id=${u.id} AND email='${u.email}')`).join(' OR ')};\n`);
  assert.equal(state.group,undefined); assert.equal(state.groups,undefined);
  assert.ok(state.users.some(u=>u.id===user.id)); assert.equal(state.ratings.length,0);
  return {user,state};
}
assert.equal((await api('config')).registration_code_required,false);
const a=await signup('a');
await api('filters',{max_minutes:0,max_price:0,cuisine:''});
for(const route of ['create','join','select']) await api('groups/'+route,{},404);
const b=await signup('b');
assert.ok(b.state.users.some(u=>u.id===a.user.id));
assert.deepEqual(b.state.restaurants.map(r=>r.id),a.state.restaurants.map(r=>r.id));
assert.equal((await api('recommendations',{members:[b.user.id]})).recommendations.length,b.state.restaurants.length);
assert.equal((await api('recommendations',{members:[a.user.id,b.user.id]})).recommendations.length,0);
await api('recommendations',{members:[]},400);
await api('logout',{});
await api('login',{email:a.user.email,password:a.user.password});
const saved=await api('state');
assert.equal(saved.users.find(u=>u.id===a.user.id).filters.max_price,0);
assert.ok(saved.users.some(u=>u.id===b.user.id)); assert.equal(saved.ratings.length,0);
await api('logout',{});
assert.equal((await fetch(origin+'/health')).status,200);
console.log('Remoto: registro libre, listado común inmediato, participantes/filtros seleccionados y persistencia OK. Sin modificar restaurantes ni notas. Limpieza de dos cuentas QA preparada.');
