import {deduplicate,listingKey,matches,type Filters,type Listing} from './domain';
export function newAlertMatches(rows:Listing[],filters:Filters,seen:Set<string>){
 return deduplicate(rows.filter(car=>matches(car,filters)&&!car.priceWarning&&car.price>0)).filter(car=>!seen.has(listingKey(car)));
}
export function alertSearchKey(filters:Filters){
 return JSON.stringify(Object.fromEntries(Object.entries(filters).filter(([key])=>key!=='limit').sort(([a],[b])=>a.localeCompare(b)).map(([key,value])=>[key,Array.isArray(value)?[...value].sort():value])));
}
export function alertEmailText(cars:Listing[],url:string){
 return `${cars.length} new ${cars.length===1?'match':'matches'} for your MotorScout search.\n\n${cars.slice(0,10).map(car=>`${car.title} — $${car.price.toLocaleString('en-US')} · ${car.miles===null?'Mileage unknown':car.miles.toLocaleString('en-US')+' miles'} · ${[car.city,car.state].filter(Boolean).join(', ')}`).join('\n')}\n\nView your matches: ${url}/?tab=alerts\n\nThese are newly found listings, not a guarantee they were just posted. Asking prices and availability need seller confirmation. Manage or pause this search in MotorScout.`;
}
