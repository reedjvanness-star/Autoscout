import {rank,type Listing,type Source,type SearchCursor,type Filters} from './domain';

export const AUTO_SEARCH_PAGES=20;
export const AUTO_SEARCH_MATCHES=2500;
const slots=['dealer','private','auction','autodev','autotrader','retailers'] as const;
export function healthyCursor(cursor:SearchCursor|null|undefined,sources:Source[]):SearchCursor|null{
 if(!cursor)return null;
 const next={...cursor};
 slots.forEach((slot,i)=>{if(sources[i]?.status==='error')next[slot]=null});
 return Object.values(next).some(v=>v!==null)?next:null;
}
export function mergeSearch(previous:Listing[],incoming:Listing[],filters:Filters){
 // Updated offers replace earlier copies; different source offers remain available.
 const rows=new Map(previous.map(r=>[r.id,r]));
 incoming.forEach(r=>rows.set(r.id,r));
 const combined=[...rows.values()];
 return rank(combined,combined,filters,combined.length);
}
export function mergeSources(previous:Source[],incoming:Source[]):Source[]{
 return incoming.map(source=>{
  const old=previous.find(s=>s.name===source.name);
  if(!old)return source;
  if(old.status==='error'&&source.status==='searched'&&source.inspected===undefined)return old;
  if(source.inspected===undefined&&old.inspected!==undefined&&source.status==='searched')return {...old,hasMore:false};
  return {...source,total:source.total??old.total,count:(old.count??0)+(source.count??0),inspected:(old.inspected??0)+(source.inspected??0)};
 });
}
