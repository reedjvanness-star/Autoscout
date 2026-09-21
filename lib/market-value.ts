import {deduplicate,listingKey,priceWarning,type Listing} from './domain';
import {bodyType,driveType,fuelType,transmissionType} from './vehicle-requirements';

const key=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
const known=(s:string|undefined)=>!!s&&!/^(unknown|not provided)$/i.test(s);
const specNormalizers:Record<string,(value:unknown)=>string>={drive:driveType,transmission:transmissionType,bodyType,fuel:fuelType};
const specKey=(field:string,value:string)=>specNormalizers[field]?.(value)||key(value);
const percentile=(prices:number[],q:number)=>{const p=(prices.length-1)*q,a=Math.floor(p);return prices[a]+(prices[Math.ceil(p)]-prices[a])*(p-a)};
export function highlightedDeals(rows:Listing[],pool:Listing[]){
 const rated=rows.map((car,index)=>({car,index,value:marketValue(car,pool)}));
 return rated.sort((a,b)=>{
  const group=(v:ReturnType<typeof marketValue>)=>!v.available?3:v.rating==='below'?0:v.rating==='within'?1:2;
  const difference=group(a.value)-group(b.value);
  if(difference)return difference;
  if(a.value.available&&b.value.available)return a.value.percent-b.value.percent||a.index-b.index;
  return a.index-b.index;
 }).map(item=>item.car);
}
export function marketValue(car:Listing,pool:Listing[],now=Date.now()){
 const unavailable=(reason:string)=>({available:false as const,reason});
 const eligible=(r:Listing)=>{
  const timestamp=Date.parse(r.sourceUpdatedAt||r.checkedAt),age=now-timestamp;
  return !r.priceWarning&&!priceWarning(r.price,r.year)&&r.priceReview?.status!=='unavailable'&&Number.isFinite(r.price)&&r.price>0&&r.condition==='used'&&!/salvage|rebuilt/i.test(r.titleStatus)&&!r.id.startsWith('auction:')&&Number.isFinite(timestamp)&&age>=-86400000&&age<=30*86400000;
 };
 if(!eligible(car))return unavailable('A current, usable asking price is needed before we can compare this car.');
 if(!car.make||!car.model||!car.trim||car.year===null||car.miles===null||car.seller==='unknown')return unavailable('We need the trim, year, mileage and seller type to make a fair comparison.');
 const same=(a:string,b:string)=>key(a)===key(b);
 let comps=deduplicate(pool.filter(eligible)).filter(c=>listingKey(c)!==listingKey(car)&&same(c.make,car.make)&&same(c.model,car.model)&&same(c.trim,car.trim)&&c.year!==null&&Math.abs(c.year-car.year!)<=1&&c.miles!==null&&Math.abs(c.miles-car.miles!)<=20000&&c.seller===car.seller&&['drive','transmission','bodyType','fuel'].every(field=>{const a=car[field as keyof Listing],b=c[field as keyof Listing];return !known(String(a??''))||!known(String(b??''))||specKey(field,String(a))===specKey(field,String(b))}));
 const local=comps.filter(c=>car.state&&same(c.state,car.state));
 const regional=local.length>=5;if(regional)comps=local;
 if(comps.length<5)return unavailable(`Only ${comps.length} comparable ${comps.length===1?'car':'cars'} in this search. At least 5 are needed.`);
 let prices=comps.map(c=>c.price).sort((a,b)=>a-b);
 if(prices.length>=8){const a=percentile(prices,.25),b=percentile(prices,.75),spread=b-a;comps=comps.filter(c=>c.price>=a-1.5*spread&&c.price<=b+1.5*spread);prices=comps.map(c=>c.price).sort((a,b)=>a-b)}
 if(prices.length<5)return unavailable('Too few comparable cars remain after excluding unusual prices.');
 const low=percentile(prices,.25),high=percentile(prices,.75),median=percentile(prices,.5);
 if(high/low>1.6)return unavailable('Comparable prices vary too widely for a useful range.');
 const rating=car.price<low?'below':car.price>high?'above':'within';
 const complete=[car,...comps].every(c=>known(c.drive)&&known(c.transmission)&&known(c.bodyType)&&c.titleStatus==='clean'&&known(c.history));
 const confidence=regional&&comps.length>=10&&complete?'Moderate':'Low';
 return {available:true as const,low,high,median,rating,confidence,regional,count:comps.length,difference:car.price-median,percent:(car.price/median-1)*100,comparables:[...comps].sort((a,b)=>Math.abs(a.miles!-car.miles!)-Math.abs(b.miles!-car.miles!)).slice(0,8)};
}
