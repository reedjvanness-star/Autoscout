import type {Listing} from './domain';
export const DISCOUNT_PRICE_WARNING='This dealer page presents savings separately from the vehicle price. The full asking price must be verified before this amount can be displayed or used for your budget.';
export function freshPriceCheck(checkedAt:string,now=Date.now()){
 const age=now-Date.parse(checkedAt);
 return Number.isFinite(age)&&age>=0&&age<86400000;
}
export function discountRisk(row:Pick<Listing,'url'|'price'|'year'|'miles'>){
 // This dealer-page template is a confirmed upstream failure: the feed has
 // repeatedly taken its first SAVINGS/DIFFERENCE amount as the asking price.
 const path=new URL(row.url).pathname;
 return /^\/(?:used|certified|new)-[^/]+-[A-HJ-NPR-Z0-9]{17}\/?$/i.test(path)||
  (row.year!==null&&row.year>=2015&&row.miles!==null&&row.miles<50000&&row.price<10000);
}
export function checkedFullPrice(row:Listing,now=Date.now()){
 const r=row.priceReview;
 return !!r&&freshPriceCheck(r.checkedAt,now)&&['matched','corrected'].includes(r.status)&&r.sourcePrice!==undefined&&r.sourcePrice===row.price&&!row.priceWarning;
}
