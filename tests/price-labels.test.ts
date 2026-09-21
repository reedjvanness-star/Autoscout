import assert from 'node:assert/strict';
import {labeledNonPurchaseAmount} from '../lib/price-safety';
import {normalizeAutoDev} from '../lib/autodev';
import {applyPriceReview} from '../lib/price-review';
import {initialFilters,rank} from '../lib/domain';

for(const text of ['Difference: $7,500','Savings: $7,500','Savings $7,500. Full price $25,000.','$7,500 savings','Dealer discount $7,500','Optional Accessories $7,500','Down payment: $7,500','$7,500 down','$7,500/month','Deposit $7,500.00'])assert(labeledNonPurchaseAmount(text,7500),text);
for(const text of ['Asking price $7,500. Savings $1,000.','No down payment needed. Price $7,500.','Asking price $7,500.00','Savings $7,500.50','Savings $75,000'])assert(!labeledNonPurchaseAmount(text,7500),text);
const car=normalizeAutoDev({vehicle:{year:2010,make:'Toyota',model:'Tacoma'},retailListing:{used:true,price:7500,miles:150000,vdp:'https://unseen-dealer.example/vehicle/123',description:'Internet price $22,500. Savings: $7,500'}})!;
const reviewed=applyPriceReview(car);
assert(reviewed.priceWarning,'detect a mislabeled amount without a known dealer or low-mileage heuristic');
assert.equal(rank([reviewed],[],{...initialFilters,maxPrice:10000}).length,0);
assert.equal(reviewed.median,null);
const valid=applyPriceReview({...car,price:22500});
assert(!valid.priceWarning,'a different discount amount does not invalidate the actual asking price');
console.log('PASS: feed description labels, exact amount matching and budget exclusion');
