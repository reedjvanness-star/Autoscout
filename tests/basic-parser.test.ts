import assert from 'node:assert/strict';
import {basic} from '../lib/basic-parser';
import {initialFilters,filterSchema,matches,type Listing} from '../lib/domain';
const b=basic('BMW M340i under $35,000 with fewer than 40,000 miles in Colorado',initialFilters);
assert.equal(b.filters.make,'BMW');assert.equal(b.filters.model,'3 Series');assert.equal(b.filters.trim,'M340i');assert.equal(b.filters.maxPrice,35000);assert.equal(b.filters.maxMiles,40000);assert.equal(b.filters.state,'CO');assert.equal(b.question,'');
const s=basic('Subaru Crosstrek under $25.5k with fewer than 60k miles in California',initialFilters);
assert.equal(s.filters.make,'Subaru');assert.equal(s.filters.model,'Crosstrek');assert.equal(s.filters.maxPrice,25500);assert.equal(s.filters.maxMiles,60000);assert.equal(s.filters.state,'CA');
const follow=basic('lower mileage',b.filters);assert.equal(follow.filters.maxMiles,30000);assert.equal(follow.filters.maxPrice,35000);assert.equal(follow.filters.trim,'M340i');
assert.equal(basic('only AWD',b.filters).filters.awd,true);assert.equal(basic('top three',b.filters).filters.limit,3);
assert.equal(basic('find a red one',b.filters).filters.exteriorColor,'red');assert.equal(basic('find a red one',b.filters).question,'');assert.equal(basic('show these again',b.filters).filters.maxPrice,35000);
assert.equal(basic('Ford F150 under $30,000',initialFilters).filters.model,'F-150');
console.log('PASS: make/model parsing, decimal budgets, location, follow-ups, and unsupported requirements');

for(const query of ['rs7','Audi RS7','find an RS 7 under $60,000','RS-7']){
 const parsed=basic(query,b.filters);
 assert.equal(parsed.question,'',query);assert.equal(parsed.filters.make,'Audi',query);assert.equal(parsed.filters.model,'RS7',query);
 assert.equal(parsed.filters.trim,'');assert.equal(parsed.filters.maxMiles,null,'new model drops previous mileage requirement');
}
const rs=basic('Audi RS7 under $60,000',initialFilters).filters;
assert.equal(rs.maxPrice,60000);
for(const model of ['A7','S7','RS6','Q7'])assert.equal(matches({make:'Audi',model,trim:'',price:50000} as Listing,rs),false,'reject unrelated '+model);
assert.equal(matches({make:'Audi',model:'RS 7',trim:'',price:50000} as Listing,rs),true,'accept equivalent provider spacing');
const unknown=basic('Audi RS99 under $60,000',initialFilters);assert.match(unknown.question,/could not identify/,'unknown model must not become all Audis under budget');
assert.equal(filterSchema.parse({model:'RS 7'}).make,'Audi','manual model-only search infers exact make');
console.log('PASS: RS7 aliases, fresh-model filters, strict result identity and unknown-code clarification');
