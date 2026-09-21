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
 try{
  if(f.make){const makes=await vehicleCatalog(id,'make');f.make=resolveCatalogName(f.make,makes.values);}
  if(f.make&&f.model){const models=await vehicleCatalog(id,'model',f.make);f.model=resolveCatalogName(f.model,models.values);}
  if(f.make&&f.model&&f.trim){const trims=await vehicleCatalog(id,'trim',f.make,f.model);f.trim=resolveCatalogName(f.trim,trims.values);}
 }catch{/* The catalogue improves spelling, but never blocks freeform searches. */}
 return f;
}
