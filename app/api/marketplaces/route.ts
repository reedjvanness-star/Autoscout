import {identity,db,readWorkspace,writeWorkspace,boundedJson,failure} from '@/lib/server';
import {providerKey} from '@/lib/connections';
import {apifyRequest,marketplaceInput,normalizeMarketplace,marketplaceSources,MARKETPLACE_RUN_CAP,ACTOR,FACEBOOK_ACTOR,facebookInput,normalizeFacebook} from '@/lib/apify';
import {startBudgetedMarketplaceRun} from '@/lib/marketplace-budget';
import {mergeSearch} from '@/lib/search-session';
import type {Listing,Source} from '@/lib/domain';
export const dynamic='force-dynamic';
type Job={searchId:string;runId?:string;state:string;startedAt:number};
const terminal=(state:string)=>['SUCCEEDED','FAILED','TIMED-OUT','ABORTED','IMPORTED'].includes(state);
export async function POST(req:Request){try{
 const id=identity(req),a=await boundedJson(req),key=await providerKey(id,'apify');if(!key)throw Error('Connect your free marketplace account in Sources first.');
 const w=await readWorkspace(id);if(!w.searchId||a.searchId!==w.searchId)throw Error('Your search changed. Use the latest results.');
 const facebook=a.provider==='facebook';
 if(facebook&&w.filters.state&&w.filters.state!=='CO')return Response.json({done:true,state:'OUTSIDE_COVERAGE'});
 const actor=facebook?FACEBOOK_ACTOR:ACTOR;
 const jobId=id+(facebook?':facebook-job':':marketplace-job');
 const stored=await db().prepare('SELECT payload FROM workspaces WHERE user_id=?').bind(jobId).first<{payload:string}>();
 let job:Job|undefined=stored?JSON.parse(stored.payload):undefined;
 if(a.action==='start'){
  if(job?.searchId===w.searchId&&!(job.state==='FAILED'&&!job.runId))return Response.json({done:terminal(job.state),state:job.state});
  if(job?.runId&&!terminal(job.state)){try{await apifyRequest(key,'actor-runs/'+encodeURIComponent(job.runId)+'/abort',{method:'POST'})}catch{throw Error('Previous marketplace search could not be stopped. Retry before starting another.')}}
  const next:Job={searchId:w.searchId,state:'STARTING',startedAt:Date.now()};
  const locked=await db().prepare("INSERT INTO workspaces(user_id,payload,updated_at) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at WHERE json_extract(workspaces.payload,'$.searchId') != ? OR (json_extract(workspaces.payload,'$.state')='FAILED' AND json_extract(workspaces.payload,'$.runId') IS NULL) RETURNING user_id").bind(jobId,JSON.stringify(next),Date.now(),w.searchId).first();
  if(!locked)return Response.json({done:false,state:'STARTING'});
  try{
   const data=await startBudgetedMarketplaceRun(db(),key,actor,facebook?facebookInput(w.filters):marketplaceInput(w.filters),facebook?1:MARKETPLACE_RUN_CAP);
   next.runId=data.id;next.state=data.status;
  }catch(e){next.state='FAILED';await db().prepare('UPDATE workspaces SET payload=?,updated_at=? WHERE user_id=? AND payload=?').bind(JSON.stringify(next),Date.now(),jobId,JSON.stringify({searchId:w.searchId,state:'STARTING',startedAt:next.startedAt})).run();throw e;}
  await db().prepare("UPDATE workspaces SET payload=?,updated_at=? WHERE user_id=? AND json_extract(payload,'$.searchId')=?").bind(JSON.stringify(next),Date.now(),jobId,w.searchId).run();
  return Response.json({done:false,state:next.state});
 }
 if(a.action!=='poll')throw Error('Unknown marketplace action.');
 if(job?.searchId===w.searchId&&job.state==='IMPORTED')return Response.json({done:true,state:'IMPORTED'});
 if(!job||job.searchId!==w.searchId||!job.runId)return Response.json({done:job?.state==='FAILED',state:job?.state??'NOT_STARTED'});
 const {data}=await apifyRequest(key,'actor-runs/'+encodeURIComponent(job.runId));
 if(data?.actId!==actor)throw Error('Unexpected marketplace job.');
 const done=terminal(data.status);
 const raw=data.defaultDatasetId?await apifyRequest(key,`datasets/${encodeURIComponent(data.defaultDatasetId)}/items?format=json&clean=true&limit=100`):[];
 if(!Array.isArray(raw))throw Error('Invalid marketplace inventory response.');
 const rows=raw.map(facebook?normalizeFacebook:normalizeMarketplace).filter((r:Listing|null):r is Listing=>r!==null);
 const latest=await readWorkspace(id);if(latest.searchId!==w.searchId)throw Error('Your search changed while marketplaces were loading.');
 latest.listings=mergeSearch(latest.listings,rows,latest.filters);
 const sources:Source[]=facebook?[{name:'Facebook Marketplace',status:rows.length?'searched':done?'error':'ready',count:rows.length,inspected:rows.length,detail:`Denver-area public listings only. ${rows.length} usable vehicles returned. Your exact filters are applied before display.`}]:marketplaceSources(rows,done,latest.filters.state);latest.sources=[...latest.sources.filter(s=>!sources.some(n=>n.name===s.name)),...sources];
 if(done){const n=latest.listings.length;latest.messages.push({role:'assistant',at:Date.now(),text:`Marketplace search finished. ${n} cars match your current requirements.${n<5?' Fewer than five exact matches were found in the inventory checked; your specifications have not been relaxed.':''}`,ids:latest.listings.slice(0,12).map(r=>r.id)});}
 // Repeated completed polls must not duplicate messages.
 if(job.state!== 'IMPORTED')await writeWorkspace(id,latest);
 job={...job,state:done?'IMPORTED':data.status};
 await db().prepare("UPDATE workspaces SET payload=?,updated_at=? WHERE user_id=? AND json_extract(payload,'$.searchId')=?").bind(JSON.stringify(job),Date.now(),jobId,w.searchId).run();
 return Response.json({done,state:data.status,count:rows.length});
}catch(e){return failure(e)}}
