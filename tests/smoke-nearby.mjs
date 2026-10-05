import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
import {browserRestaurants} from '../public/overpass.js';
const origin=process.argv[2]||'http://127.0.0.1:8787';
if(!['http://127.0.0.1:8787','https://donde-comemos.mesa-equipo-dfv.workers.dev'].includes(origin))throw Error('Unknown target');
let cookie='';async function api(path,data){const r=await fetch(origin+'/api/'+path,{method:data===undefined?'GET':'POST',headers:{'Content-Type':'application/json',Cookie:cookie,Origin:origin},body:data===undefined?undefined:JSON.stringify(data)});const result=await r.json();assert.equal(r.status,200,path+': '+JSON.stringify(result));if(r.headers.has('Set-Cookie'))cookie=r.headers.get('Set-Cookie').split(';')[0];return result;}
const account={name:'QA mapa temporal',email:`qa-nearby-${Date.now()}@example.test`,password:randomBytes(24).toString('hex')};
if(process.argv.includes('--save-account'))writeFileSync('data/qa-nearby-account.json',JSON.stringify(account));
await api('register',account);let state=await api('state');const id=state.user.id;
writeFileSync('data/cleanup-nearby.sql',`DELETE FROM users WHERE id=${id} AND email='${account.email}';\n`);
const located=await api('office/search',{address:'Plaza Pablo Ruiz Picasso 11 Madrid'});const office=located.locations.find(p=>p.address.includes('PICASSO 11'));assert.ok(office);await api('office',office);
// Node identifies the QA caller; actual browsers send their own User-Agent.
if(process.argv.includes('--browser-source')){const native=globalThis.fetch;globalThis.fetch=(url,options)=>native(url,{...options,headers:{...options?.headers,'User-Agent':'DondeComemos/0.2 (+https://donde-comemos.mesa-equipo-dfv.workers.dev)'}});}
const client_source=process.argv.includes('--browser-source')?await browserRestaurants(office):undefined;
const search=radius=>api('nearby',{members:[id],radius,...(client_source?{client_source}:{})});
await api('filters',{max_minutes:10,max_price:0,cuisine:''});
const checks=[];for(const radius of [500,1000,2000]){const result=await search(radius);assert.equal(result.restaurants.length,0);assert.ok(result.examined>0);checks.push({radius,examined:result.examined,pending:result.pending.length});}
const filtered=await search(500);assert.equal(filtered.restaurants.length,0);assert.ok(filtered.examined>0);assert.ok(filtered.pending.every(r=>r.price===null&&r.minutes<=10));
await api('filters',{max_minutes:10,max_price:null,cuisine:''});const found=await search(500);assert.ok(found.restaurants.length>0);assert.ok(found.restaurants.every(r=>r.minutes<=10));
await api('logout',{});await api('login',{email:account.email,password:account.password});state=await api('state');assert.equal(state.office.address,office.address);assert.equal(state.users.find(u=>u.id===id).filters.max_minutes,10);await api('logout',{});
console.log('Radios verificados',JSON.stringify(checks));
console.log(`Nearby live OK: ${filtered.pending.length} pending prices, ${found.restaurants.length} within 10 min. Office/filters persisted. No catalogue or rating writes. Cleanup prepared for exact QA account.`);
