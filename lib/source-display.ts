import type {Source} from './domain';
const marketplaceNames=['Cars.com','CarGurus','TrueCar','Facebook Marketplace','Craigslist'];
export function sourceDisplay(source:Source,marketplacesConnected:boolean,state:string){
 const regional=['Facebook Marketplace','Craigslist'].includes(source.name);
 if(marketplacesConnected&&marketplaceNames.includes(source.name)&&source.status==='unavailable'){
  if(regional&&state&&state!=='CO')return {label:'Outside current coverage',detail:'This connection searches Denver-area listings only. Your selected state is outside that coverage.'};
  return {label:'Connected · not checked yet',detail:`Available through your marketplace provider${regional?' for Denver-area listings':''}. Use “Check more marketplaces” to check this search. Coverage is partial.`};
 }
 const limited=/quota|rate.*limit|allowance|429/i.test(source.detail);
 return {label:source.status==='error'?(limited?'Provider limit reached':'Could not complete check'):source.status==='searched'?((source.count??0)>0?'Listings returned':'Checked · no listings returned'):source.status==='ready'?'Ready to search':'Not connected',detail:source.detail};
}
