import type {Source} from './domain';
export function withMarketplaceAccess(sources:Source[],access:{apify:boolean;apifyShared?:boolean}):Source[]{
 if(!access.apify)return sources;
 const available=access.apifyShared?['Cars.com','CarGurus','TrueCar']:['Cars.com','CarGurus','TrueCar','Facebook Marketplace','Craigslist','Carvana'];
 const result=sources.map(source=>available.includes(source.name)&&source.status==='unavailable'?{...source,status:'ready' as const,detail:access.apifyShared?'Available through MotorScout’s shared free beta. This source has not been checked for this search yet.':'Marketplace connection available. This source has not been checked for this search yet.'}:source);
 for(const name of available)if(!result.some(source=>source.name===name))result.push({name,status:'ready',detail:'Marketplace connection available; not checked for this search yet.'});
 return result;
}
