import {apifyRequest,verifyFreeAccount,MarketplaceError} from './apify';

type Reservation={token:string;cap:number;runId?:string};
type Budget={cycle:string;base:number;charged:number;pending:Reservation[];leaseUntil:number;lease:string};
type Database={prepare:(sql:string)=>any};
const finished=(s:string)=>['SUCCEEDED','FAILED','TIMED-OUT','ABORTED'].includes(s);
const amount=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n)&&n>=0;

// Keep a conservative local ledger alongside the provider's real billing-cycle usage.
// Completed runs consume their reported cost, not their maximum reservation.
export async function startBudgetedMarketplaceRun(database:Database,key:string,actor:string,input:unknown,cap:number,request:typeof fetch=fetch){
 const account=await verifyFreeAccount(key,request),id='apify-budget:'+account;
 const lease=crypto.randomUUID(),now=Date.now();
 const empty:Budget={cycle:'',base:0,charged:0,pending:[],leaseUntil:now+120000,lease};
 const claim=await database.prepare("INSERT INTO workspaces(user_id,payload,updated_at) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET payload=json_set(workspaces.payload,'$.lease',?,'$.leaseUntil',?),updated_at=excluded.updated_at WHERE COALESCE(json_extract(workspaces.payload,'$.leaseUntil'),0) < ? RETURNING payload").bind(id,JSON.stringify(empty),now,lease,now+120000,now).first();
 if(!claim)throw new MarketplaceError('Another marketplace search is starting. Try again in a moment.');
 let budget:Budget=JSON.parse(claim.payload);
 const save=async()=>{
  const result=await database.prepare("UPDATE workspaces SET payload=?,updated_at=? WHERE user_id=? AND json_extract(payload,'$.lease')=?").bind(JSON.stringify(budget),Date.now(),id,lease).run();
  if(result.meta?.changes!==1)throw new MarketplaceError('Marketplace allowance check expired. Please retry.');
 };
 try{
  const {data}=await apifyRequest(key,'users/me/limits',{},request);
  const used=data?.current?.monthlyUsageUsd,limit=data?.limits?.maxMonthlyUsageUsd;
  const cycle=data?.monthlyUsageCycle?.startAt,end=Date.parse(data?.monthlyUsageCycle?.endAt);
  if(!amount(used)||!amount(limit)||!Number.isFinite(Date.parse(cycle))||!(end>Date.now())||Date.parse(cycle)>Date.now())throw new MarketplaceError('Could not verify remaining free marketplace credit. Please retry later.');
  if(budget.cycle!==cycle){
   // Never discard reservations while another run could still be charging.
   if(data.current.activeActorJobCount!==0)throw new MarketplaceError('Wait for your running marketplace searches to finish, then retry.');
   budget={...empty,cycle,base:used};
  }
  for(const hold of [...budget.pending]){
   if(!hold.runId)continue; // An ambiguous start keeps its reservation; never assume it was free.
   const {data:run}=await apifyRequest(key,'actor-runs/'+encodeURIComponent(hold.runId),{},request);
   if(finished(run?.status)&&amount(run?.usageTotalUsd)){
    budget.charged+=run.usageTotalUsd;
    budget.pending=budget.pending.filter(p=>p.token!==hold.token);
   }
  }
  const held=budget.pending.reduce((sum,p)=>sum+p.cap,0);
  const available=Math.max(0,Math.min(4,limit)-Math.max(used,budget.base+budget.charged)-held);
  // Leave platform overhead within a small reservation as well as the $1 free-credit cushion.
  const reservation=cap+0.02;
  if(available+1e-9<reservation){
   await save();
   throw new MarketplaceError(`Not enough free marketplace credit for this search ($${available.toFixed(2)} available after reservations). Try again after current searches finish or the provider's billing cycle resets. Other car sources still work.`);
  }
  const hold:Reservation={token:crypto.randomUUID(),cap:reservation};
  budget.pending.push(hold);await save();
  const {data:run}=await apifyRequest(key,`acts/${actor}/runs?maxTotalChargeUsd=${cap}&timeout=240&memory=1024`,{method:'POST',body:JSON.stringify(input)},request);
  if(!run?.id||!run?.status)throw new MarketplaceError('Provider did not return a run identifier.');
  hold.runId=run.id;await save();
  return run;
 }finally{
  await database.prepare("UPDATE workspaces SET payload=json_set(payload,'$.leaseUntil',0),updated_at=? WHERE user_id=? AND json_extract(payload,'$.lease')=?").bind(Date.now(),id,lease).run();
 }
}
