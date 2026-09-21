import craigslist from './craigslist-regions.json';

// Craigslist's public US directory, retrieved 2026-09-21:
// https://www.craigslist.org/about/sites (413 unique regional sites).
// Facebook uses city slugs, each covering only the provider's local radius.
// These search centers are not a claim of complete statewide coverage.
// Additional slugs documented by marketplace scraper developers:
// https://apify.com/curious_coder/facebook-marketplace
// https://apify.com/crowdpull/facebook-marketplace-scraper
const facebook:Record<string,string[]>={CO:['denver'],CA:['sanfrancisco'],NY:['nyc'],IL:['chicago']};
export type MarketplaceProvider='automotive'|'facebook';
export function marketplaceRegions(provider:MarketplaceProvider,state=''){
 const table:Record<string,string[]>=provider==='facebook'?facebook:craigslist;
 if(state)return table[state]??[];
 // Interleave states so early batches cover different parts of the country.
 const groups=Object.values(table),all:string[]=[];
 for(let i=0;i<Math.max(...groups.map(g=>g.length));i++)for(const group of groups)if(group[i])all.push(group[i]);
 return [...new Set(all)];
}
export function marketplaceRegionBatch(provider:MarketplaceProvider,state='',batch=0){
 const all=marketplaceRegions(provider,state),size=provider==='facebook'?8:20;
 const start=batch*size,regions=all.slice(start,start+size);
 return {regions,start,total:all.length,hasMore:start+regions.length<all.length};
}
export function craigslistHost(host:string){
 return host==='craigslist.org'||/^[a-z0-9-]+\.craigslist\.org$/.test(host);
}
