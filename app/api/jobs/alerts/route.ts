import {config,db} from '@/lib/server';
import {checkAlert,deliverAlertEmails} from '@/lib/alerts';
export async function POST(req:Request){
 const secret=config().SCHEDULER_SECRET;
 if(!secret||req.headers.get('authorization')!==`Bearer ${secret}`)return Response.json({error:'Unauthorized'},{status:401});
 const now=Date.now();
 await db().prepare("INSERT INTO workspaces(user_id,payload,updated_at) VALUES('__scheduler__','{}',?) ON CONFLICT(user_id) DO UPDATE SET updated_at=excluded.updated_at").bind(now).run();
 const rows=await db().prepare('SELECT id FROM alerts WHERE enabled=1 AND next_run<=? ORDER BY next_run LIMIT 3').bind(now).all<{id:string}>();
 const results=[];for(const row of rows.results)results.push(await checkAlert(row.id));
 return Response.json({checked:results.filter(r=>r.checked).length,...await deliverAlertEmails()});
}
