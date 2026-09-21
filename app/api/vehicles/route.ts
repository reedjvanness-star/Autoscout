import {identity} from '@/lib/server';
import {vehicleCatalog} from '@/lib/catalog-server';
export const dynamic='force-dynamic';
export async function GET(req:Request){
 let id:string;try{id=identity(req)}catch{return Response.json({error:'Sign in to load vehicle suggestions.'},{status:401})}
 const u=new URL(req.url),field=u.searchParams.get('field'),make=u.searchParams.get('make')?.trim()??'',model=u.searchParams.get('model')?.trim()??'';
 if(!['make','model','trim'].includes(field??'')||make.length>40||model.length>60||(field!=='make'&&!make)||(field==='trim'&&!model))return Response.json({error:'Choose a make and model before loading trims.'},{status:400});
 try{return Response.json({...await vehicleCatalog(id,field as 'make'|'model'|'trim',make,model),source:'Connected US inventory'},{headers:{'Cache-Control':'private, no-store'}})}catch{return Response.json({error:'Live suggestions are unavailable. You can still type any make, model or trim.'},{status:503})}
}
