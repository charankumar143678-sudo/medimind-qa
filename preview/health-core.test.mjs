import test from 'node:test';
import assert from 'node:assert/strict';
import {validateObservation,filterObservations,summarizeObservations,bmi} from './health-core.mjs';
const now=Date.parse('2026-10-17T09:00:00.000Z');
const sample=[{metric:'pulse',value:72,time:'2026-10-17T08:30:00.000Z'},
 {metric:'pulse',value:78,time:'2026-10-14T08:30:00.000Z'},
 {metric:'glucose',value:5,time:'2026-10-17T08:30:00.000Z'},
 {metric:'pulse',value:68,time:'2025-10-17T08:30:00.000Z'}];
test('validates numeric values and units without coercion',()=>{
 assert.equal(validateObservation({metric:'pulse',value:'72',time:sample[0].time}),null);
 assert.equal(validateObservation({metric:'pulse',value:999,time:sample[0].time}),null);
 assert.equal(validateObservation({metric:'__proto__',value:1,time:sample[0].time}),null);
 assert.equal(validateObservation(sample[0],now).unit,'bpm');
});
test('rejects malformed or future timestamps',()=>{
 assert.equal(validateObservation({metric:'pulse',value:72,time:'2026-02-30T00:00:00.000Z'},now),null);
 assert.equal(validateObservation({metric:'pulse',value:72,time:'2999-01-01T00:00:00.000Z'},now),null);
});
test('filters only explicit measurements',()=>{
 assert.equal(filterObservations(sample,'pulse','day',now).length,1);
 assert.equal(filterObservations(sample,'pulse','week',now).length,2);
 assert.equal(filterObservations(sample,'pulse','year',now).length,2);
 assert.equal(filterObservations(sample,'glucose','day',now).length,1);
});
test('summarizes measurements without fabricated points',()=>{
 const s=summarizeObservations(sample,'pulse','week',now);
 assert.equal(s.count,2);assert.equal(s.mean,75);assert.equal(s.latest.value,72);
 assert.equal(summarizeObservations([], 'pulse','day',now).mean,null);
});
test('computes BMI using kg/m² and rejects invalid inputs',()=>{
 assert.equal(bmi(80,2),20);assert.equal(bmi(80,0),null);assert.equal(bmi(NaN,1.8),null);
});

test('uses injected clock at boundary and excludes future observation in filter',()=>{
 assert.equal(validateObservation({metric:'pulse',value:72,time:new Date(now+60000).toISOString()},now)?.value,72);
 assert.equal(validateObservation({metric:'pulse',value:72,time:new Date(now+60001).toISOString()},now),null);
 assert.equal(filterObservations([{metric:'pulse',value:72,time:new Date(now+1).toISOString()}],'pulse','day',now).length,0);
});
test('rolling 24h and 30d boundaries are inclusive',()=>{
 const pts=[{metric:'pulse',value:70,time:new Date(now-86400000).toISOString()}, {metric:'pulse',value:71,time:new Date(now-86400001).toISOString()}, {metric:'pulse',value:73,time:new Date(now-30*86400000).toISOString()}];
 assert.equal(filterObservations(pts,'pulse','day',now).length,1);
 assert.equal(filterObservations(pts,'pulse','month',now).length,3);
});
