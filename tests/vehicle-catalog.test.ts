import assert from 'node:assert/strict';
import {catalogUrl,fetchCatalog,resolveCatalogName} from '../lib/vehicle-catalog';
const u=catalogUrl('trim','Audi','RS6');
assert.equal(u.searchParams.get('make'),'Audi');assert.equal(u.searchParams.get('model'),'RS6');assert.equal(u.searchParams.get('rows'),'0');assert.equal(u.searchParams.get('facets'),'trim|0|1000|1');
assert.equal(u.searchParams.has('year'),false,'all available model years contribute');
assert.equal(catalogUrl('model','Audi','A4').searchParams.has('model'),false,'model suggestions must not be restricted by the old model');
let calls=0;
const result=await fetchCatalog('test-only','trim','Audi','A4',async(url,init)=>{
 assert.equal(init?.redirect,'manual');const u=new URL(String(url));assert.equal(u.hostname,'api.marketcheck.com');assert.equal(u.searchParams.get('api_key'),'test-only');
 const terms=calls++===0?Array.from({length:1000},(_,i)=>({item:'Fixture '+i,count:1})):[{item:'Premium Plus',count:12},{item:'Prestige',count:8},{item:'premium plus',count:1},{item:'No inventory',count:0}];
 return Response.json({facets:{trim:terms}});
});
assert.equal(calls,2,'catalogue reads beyond the first page');assert.equal(result.complete,true);assert.equal(result.values.length,1002);assert(!result.values.includes('No inventory'));
assert.equal(resolveCatalogName('premiumplus',['Premium Plus','Prestige']),'Premium Plus');assert.equal(resolveCatalogName('RS 6',['RS6','RS7']),'RS6');assert.equal(resolveCatalogName('Rare Edition',['Premium']),'Rare Edition');
await assert.rejects(()=>fetchCatalog('test','model','Audi','',async()=>new Response(null,{status:403})),/unavailable/);
await assert.rejects(()=>fetchCatalog('test','trim','Audi','A4',async()=>Response.json({facets:{trim:[{result:'Error'}]}})),/unavailable/);
console.log('PASS: make/model/trim scope, pagination, canonical spelling, rare names and provider failures');
