import assert from 'node:assert/strict';
import {vehicles,curatedVehicles} from '../lib/vehicle-options';
import {basic} from '../lib/basic-parser';
import {initialFilters} from '../lib/domain';
assert.ok(Object.keys(vehicles).length>=400);
for(const [make,models] of Object.entries({Audi:['RS3','RS7','RS Q8','R8','TT RS'],Toyota:['Land Cruiser','Supra','Sequoia'],BMW:['M2','M5','M8','X7'],Honda:['S2000','Ridgeline'],Ford:['Maverick'],Chevrolet:['Suburban'],Porsche:['Panamera'],Lamborghini:['Urus'],Ferrari:['F430']})){
 for(const model of models)assert.ok(Object.keys(vehicles[make]).some(value=>value.toLowerCase()===model.toLowerCase()),make+' '+model);
}
assert.deepEqual(vehicles.BMW['3 Series'],curatedVehicles.BMW['3 Series'],'preserve model/trim relationships');
assert.ok(!('R 1250 GS' in vehicles.BMW),'omit BMW motorcycles');
assert.ok(!('CBR600RR' in vehicles.Honda),'omit Honda motorcycles');
for(const text of ['Audi RS7','Toyota Land Cruiser','Lamborghini Urus','Honda S2000']){
 const result=basic(text,initialFilters);assert.equal(result.question,'',text);assert.ok(result.filters.model,text);
}
assert.doesNotMatch(basic('help me choose something',initialFilters).question,/connect.*AI/i);
console.log('PASS: expanded multi-brand models, performance Audis, preserved trims, motorcycle exclusion, no-key basic search');
