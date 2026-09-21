import assert from 'node:assert/strict';
import {initialFilters,firstCursor,rank} from '../lib/domain';
import {autotraderMarketcheckUrl,normalizeAutotraderMarketcheck} from '../lib/marketcheck';
import {searchInventory} from '../lib/inventory';
import {healthyCursor} from '../lib/search-session';

// Fields observed in the successful AutoTrader source query on September 19.
const raw={id:'at-785916410',vdp_url:'https://www.autotrader.com/cars-for-sale/vehicle/785916410',heading:'Used 1998 BMW M3 Convertible',price:17900,miles:63000,inventory_type:'used',exterior_color:'Green',base_ext_color:'Green',build:{year:1998,make:'BMW',model:'M3',body_type:'Convertible'},car_location:{city:'Chapel Hill',state:'NC'},mc_dealership:{mc_category:'FSBO'},last_seen_at_date:'2026-09-18T10:27:51.000Z'};
const f={...initialFilters,make:'BMW',model:'M3',exteriorColor:'green'};
const car=normalizeAutotraderMarketcheck(raw)!;
assert.equal(car.source,'AutoTrader');assert.equal(car.price,17900);assert.equal(car.miles,63000);assert.equal(car.seller,'private');assert.equal(car.state,'NC');
assert.equal(rank([car],[car],f).length,1);
for(const filters of [{...f,exteriorColor:'black'},{...f,state:'CO'},{...f,maxPrice:15000},{...f,features:['heated seats' as const]},{...f,seller:'dealer' as const}])assert.equal(rank([car],[car],filters).length,0);
assert.equal(normalizeAutotraderMarketcheck({...raw,mc_dealership:{}})!.seller,'unknown');
for(const patch of [{vdp_url:'https://autotrader.com.evil.test/cars-for-sale/vehicle/785916410'},{vdp_url:'https://www.autotrader.com/cars-for-sale/all-cars'},{inventory_type:'new'},{price:null}])assert.equal(normalizeAutotraderMarketcheck({...raw,...patch}),null);
const u=autotraderMarketcheckUrl({...f,maxMiles:70000,features:['heated seats'],cleanTitle:true},10);
assert.equal(u.pathname,'/v2/dealerships/inventory');assert.equal(u.searchParams.get('source'),'autotrader.com');assert.equal(u.searchParams.get('rows'),'10');assert.equal(u.searchParams.get('start'),'10');assert.equal(u.searchParams.get('base_ext_color'),'green');assert.equal(u.searchParams.get('miles_range'),'0-70000');assert(!u.searchParams.has('high_value_features'));assert(!u.searchParams.has('carfax_clean_title'));
let calls=0;
const mock:typeof fetch=async(input,options)=>{const url=new URL(String(input));assert.equal(url.origin,'https://api.marketcheck.com');assert.equal(options?.redirect,'manual');assert.equal(url.searchParams.get('api_key'),'test');if(url.pathname!=='/v2/dealerships/inventory'||url.searchParams.get('source')!=='autotrader.com')return Response.json({listings:[],num_found:0});calls++;const offset=Number(url.searchParams.get('start'));return Response.json({listings:offset===0?[raw]:[{...raw,id:'second',vdp_url:'https://www.autotrader.com/cars-for-sale/vehicle/766098915',price:19000,miles:211250}],num_found:2});};
const first=await searchInventory(f,{marketcheck:'test'},firstCursor(),mock);assert.equal(first.listings.length,1);assert.equal(first.nextCursor?.autotrader,1);assert.equal(first.sources[4].count,1);
const second=await searchInventory(f,{marketcheck:'test'},first.nextCursor!,mock);assert.equal(second.listings[0].price,19000);assert.equal(second.nextCursor,null);assert.equal(calls,2);
const failed=await searchInventory(f,{marketcheck:'test'},firstCursor(),async()=>new Response(null,{status:403}));assert.equal(failed.sources[4].status,'error');assert.equal(healthyCursor(failed.nextCursor,failed.sources),null);
console.log('PASS: verified AutoTrader schema, exact filters, seller evidence, paging and provider errors');
