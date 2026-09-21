import assert from 'node:assert/strict';
import {marketplaceRegions,marketplaceRegionBatch,craigslistHost} from '../lib/marketplace-regions';
import regions from '../lib/craigslist-regions.json';
assert.equal(Object.keys(regions).length,51);
const all=marketplaceRegions('automotive');assert.equal(all.length,413);
const planned:string[]=[];
for(let batch=0;;batch++){const p=marketplaceRegionBatch('automotive','',batch);planned.push(...p.regions);assert(p.regions.length<=20);if(!p.hasMore)break;}
assert.deepEqual(planned,all);
assert.equal(new Set(planned).size,413);
for(const state of Object.keys(regions))assert(marketplaceRegions('automotive',state).length>0);
assert.deepEqual(marketplaceRegions('automotive','CA'),regions.CA);
assert(!marketplaceRegionBatch('automotive','CO').hasMore);
assert.deepEqual(marketplaceRegions('facebook','CA'),['sanfrancisco']);
assert.deepEqual(marketplaceRegions('facebook','TX'),[]);
assert(craigslistHost('sfbay.craigslist.org'));assert(!craigslistHost('craigslist.org.evil.test'));
console.log('PASS: regional search coverage, batching and host validation');
