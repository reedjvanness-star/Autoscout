import assert from 'node:assert/strict';
import {schedulerAuthorized,schedulerConfigured} from '../lib/scheduler-auth';
const now=Date.now(),seconds=Math.floor(now/1000);
const pair=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
const publicKey={...await crypto.subtle.exportKey('jwk',pair.publicKey),kid:'fixture',alg:'RS256',use:'sig'};
const settings={SCHEDULER_GITHUB_REPOSITORY:'owner/repo',SCHEDULER_GITHUB_REPOSITORY_ID:'123',SCHEDULER_GITHUB_OWNER_ID:'456',SCHEDULER_AUDIENCE:'https://example.test/api/jobs/alerts'};
const claims={iss:'https://token.actions.githubusercontent.com',aud:settings.SCHEDULER_AUDIENCE,repository:'owner/repo',repository_id:'123',repository_owner_id:'456',ref:'refs/heads/main',workflow_ref:'owner/repo/.github/workflows/saved-search-alerts.yml@refs/heads/main',event_name:'schedule',iat:seconds,nbf:seconds,exp:seconds+300};
const encode=(value:unknown)=>Buffer.from(JSON.stringify(value)).toString('base64url');
async function token(overrides={},header={}){const payload=encode({alg:'RS256',typ:'JWT',kid:'fixture',...header})+'.'+encode({...claims,...overrides});const signature=await crypto.subtle.sign('RSASSA-PKCS1-v1_5',pair.privateKey,new TextEncoder().encode(payload));return payload+'.'+Buffer.from(signature).toString('base64url')}
const request=(value:string)=>new Request(settings.SCHEDULER_AUDIENCE,{method:'POST',headers:{Authorization:'Bearer '+value}});
let fetches=0;
const fetchKeys:typeof fetch=async url=>{fetches++;assert.equal(url,'https://token.actions.githubusercontent.com/.well-known/jwks');return Response.json({keys:[publicKey]})};
const valid=await token();assert(await schedulerAuthorized(request(valid),settings,fetchKeys,now));
assert(await schedulerAuthorized(request(await token({event_name:'workflow_dispatch'})),settings,fetchKeys,now));
for(const override of [{repository:'attacker/repo'},{repository_id:'999'},{repository_owner_id:'999'},{aud:'https://other.test'},{iss:'https://attacker.test'},{ref:'refs/heads/evil'},{workflow_ref:'owner/repo/.github/workflows/other.yml@refs/heads/main'},{event_name:'pull_request'},{exp:seconds-1},{iat:seconds-700},{nbf:seconds+100},{exp:seconds+10000},{exp:'9999999999'}]){
 const before=fetches;assert.equal(await schedulerAuthorized(request(await token(override)),settings,fetchKeys,now),false);assert.equal(fetches,before,'invalid claims rejected before fetching keys');
}
assert.equal(await schedulerAuthorized(request(await token({}, {alg:'none'})),settings,fetchKeys,now),false);
const parts=valid.split('.');parts[1]=encode({...claims,exp:seconds+200});assert.equal(await schedulerAuthorized(request(parts.join('.')),settings,fetchKeys,now),false,'tampered signature rejected');
assert.equal(await schedulerAuthorized(request('garbage'),settings,fetchKeys,now),false);
assert.equal(await schedulerAuthorized(request(valid),{},fetchKeys,now),false);
assert.equal(await schedulerAuthorized(request(valid),settings,async()=>Response.json({keys:[]}),now),false);
assert.equal(await schedulerAuthorized(request(valid),settings,async()=>{throw Error('offline')},now),false);
assert(schedulerConfigured(settings));assert(!schedulerConfigured({SCHEDULER_GITHUB_REPOSITORY:'owner/repo'}));
assert(await schedulerAuthorized(request('local-fixture-secret'),{SCHEDULER_SECRET:'local-fixture-secret'},fetchKeys,now));
console.log('PASS: scheduler signatures, scope, expiry, malformed input and fail-closed key retrieval');
