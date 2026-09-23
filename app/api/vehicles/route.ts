import {identity} from '@/lib/server';
import {vehicles} from '@/lib/vehicle-options';
import {catalogNameKey} from '@/lib/vehicle-catalog';
import {vehicleCatalog} from '@/lib/catalog-server';
export const dynamic='force-dynamic';
export async function GET(req:Request){
 let id:string;try{id=identity(req)}catch{return Response.json({error:'Sign in to load vehicle suggestions.'},{status:401})}
 const u=new URL(req.url),field=u.searchParams.get('field'),make=u.searchParams.get('make')?.trim()??'',model=u.searchParams.get('model')?.trim()??'';
 if(!['make','model','trim'].includes(field??'')||make.length>40||model.length>60||(field!=='make'&&!make)||(field==='trim'&&!model))return Response.json({error:'Choose a make and model before loading trims.'},{status:400});
 try{return Response.json({...await vehicleCatalog(id,field as 'make'|'model'|'trim',make,model),source:'Connected US inventory'},{headers:{'Cache-Control':'private, no-store'}})}catch{
  const knownMake=Object.keys(vehicles).find(v=>catalogNameKey(v)===catalogNameKey(make))??make;
  const models=vehicles[knownMake]??{};
  const knownModel=Object.keys(models).find(v=>catalogNameKey(v)===catalogNameKey(model))??model;
  const values=field==='make'?Object.keys(vehicles):field==='model'?Object.keys(models):models[knownModel]??[];
  return Response.json({values:values.sort((a,b)=>a.localeCompare(b)),complete:false,source:'Built-in vehicle suggestions',fallback:true},{headers:{'Cache-Control':'private, no-store'}});
 }
}
