import {db,limitUsage} from './server';
import {marketcheckKey} from './connections';
import {fetchCatalog,resolveCatalogName,type CatalogField,type CatalogResult} from './vehicle-catalog';
import type {Filters} from './domain';

export async function vehicleCatalog(id:string,field:CatalogField,make='',model=''):Promise<CatalogResult>{
 const cacheId=id+':catalog:'+JSON.stringify([field,make.toLowerCase(),model.toLowerCase()]);
 const cached=await db().prepare('SELECT payload,updated_at FROM workspaces WHERE user_id=?').bind(cacheId).first<{payload:string;updated_at:number}>();
 if(cached&&Date.now()-cached.updated_at<86400000)return JSON.parse(cached.payload);
 const key=await marketcheckKey(id);if(!key)throw Error('Connect inventory for live vehicle suggestions. You can still type any vehicle.');
 await limitUsage(id+':catalog',500);
 const result=await fetchCatalog(key,field,make,model);
 await db().prepare('INSERT INTO workspaces(user_id,payload,updated_at) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at').bind(cacheId,JSON.stringify(result),Date.now()).run();
 return result;
}
export async function resolveSearchVehicle(id:string,input:Filters):Promise<Filters>{
 const f={...input};
 // Suggestions are loaded separately by the vehicle picker. Search should use
 // those cached spellings without waiting for up to three catalogue API calls.
 async function cachedName(field:CatalogField,value:string,make='',model=''){
  const cacheId=id+':catalog:'+JSON.stringify([field,make.toLowerCase(),model.toLowerCase()]);
  const cached=await db().prepare('SELECT payload,updated_at FROM workspaces WHERE user_id=?').bind(cacheId).first<{payload:string;updated_at:number}>();
  return cached&&Date.now()-cached.updated_at<86400000?resolveCatalogName(value,(JSON.parse(cached.payload) as CatalogResult).values):value;
 }
 try{
  if(f.make)f.make=await cachedName('make',f.make);
  if(f.make&&f.model)f.model=await cachedName('model',f.model,f.make);
  if(f.make&&f.model&&f.trim)f.trim=await cachedName('trim',f.trim,f.make,f.model);
 }catch{/* The catalogue improves spelling, but never blocks freeform searches. */}
 return f;
}
