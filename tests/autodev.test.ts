import assert from 'node:assert/strict';
import {autoDevUrl,normalizeAutoDev} from '../lib/autodev';
import {initialFilters,rank} from '../lib/domain';
// Synthetic fixtures only; never included in production inventory.
const fixture={vehicle:{vin:'TESTVIN00000000001',year:2022,make:'BMW',model:'3 Series',trim:'M340i',drivetrain:'AWD'},retailListing:{used:true,price:34000,miles:39000,state:'CO',city:'Test city',vdp:'https://example.com/test-car',primaryImage:'https://example.com/test.jpg'}};
const car=normalizeAutoDev(fixture)!;
assert(car);assert.equal(car.titleStatus,'unknown');assert.equal(car.fees,null);
for(const patch of [{price:null},{price:0},{used:false},{vdp:'javascript:alert(1)'}])assert.equal(normalizeAutoDev({...fixture,retailListing:{...fixture.retailListing,...patch}}),null);
assert.equal(normalizeAutoDev({...fixture,retailListing:{...fixture.retailListing,miles:null}})?.miles,null);
const f={...initialFilters,make:'BMW',maxPrice:35000,maxMiles:40000,state:'CO',awd:true};
assert.equal(rank([car,{...car,id:'other-feed'}],[car],f).length,1);
assert.equal(rank([car],[car],{...f,cleanTitle:true}).length,0);
assert.equal(rank([car],[car],{...f,seller:'private'}).length,0);
assert.equal(rank([car],[car],{...f,shippingAllowance:1500}).length,0);
assert.equal(rank([car],[car],f)[0].median,null);
const url=autoDevUrl(f);assert.equal(url.searchParams.get('retailListing.price'),'1-35000');assert.equal(url.searchParams.get('retailListing.used'),'true');assert.equal(url.searchParams.get('limit'),'20');
console.log('Auto.dev normalization, duplicate removal, and hard-filter checks passed.');
