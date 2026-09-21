import assert from 'node:assert/strict';
import {canonicalVehicle,trimMatches} from '../lib/vehicle-identity';
import {basic} from '../lib/basic-parser';
import {initialFilters} from '../lib/domain';
for(const model of ['E55','E55 AMG','e55mg','AMG E55']){
 const f=canonicalVehicle({make:'Benz',model,trim:''});
 assert.deepEqual(f,{make:'Mercedes-Benz',model:'E-Class',trim:'E 55 AMG'});
 assert(trimMatches(model,'E 55 AMG'));
 const result=basic('Find me a '+model,initialFilters);
 assert.equal(result.filters.model,'E-Class');
 assert.equal(result.filters.trim,'E 55 AMG');
}
assert(!trimMatches('E 550','E 55 AMG'));
assert(!trimMatches('E 63 AMG','E 55 AMG'));
assert.equal(canonicalVehicle({make:'BMW',model:'E55',trim:''}).make,'BMW');
console.log('PASS: Mercedes E55 aliases, typo, basic chat and distinct trims');
