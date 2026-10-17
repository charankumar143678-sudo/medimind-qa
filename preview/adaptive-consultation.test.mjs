import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const ctx={Date};
for(const path of ['consultation-engine.js','adaptive-consultation.js']){
 const code=readFileSync(new URL('../app/'+path,import.meta.url),'utf8');
 vm.runInNewContext(code,ctx);
}
vm.runInNewContext('globalThis.engine=MediMindConsultation;globalThis.adaptive=MediMindAdaptive;',ctx);
const {engine,adaptive}=ctx;
test('profile data is opt-in and bounded without storing any consultation',()=>{
 const a=adaptive.createContext({profile:{age:'32',meds:'A'.repeat(500),allergies:'penicillin'}});
 assert.equal(a.profile.age,32);assert.equal(a.profile.meds.length,240);
 assert.equal(adaptive.createContext({}).profile.age,null);
 assert.equal(adaptive.normalizeProfile({age:'bad'}).age,null);
});
test('profile context adds relevant questions without diagnosis',()=>{
 engine.reset();
 const r=adaptive.assess({message:'headache for 2 days',context:{profile:{age:40,meds:'example medicine',allergies:'pollen',conditions:'asthma'},language:'en'},engine});
 assert.equal(r.provider,'deterministic-local-v1');assert.equal(r.urgency,'unknown');
 assert.ok(r.questions.some(x=>x.includes('medicines')));
 assert.ok(r.guidance.some(x=>x.includes('clinician')));
 assert.ok(r.lines.join(' ').includes('not a medical diagnosis'));
});
test('emergency flags override adaptive questions and profile guidance',()=>{
 for(const symptom of ['severe chest pain','cannot breathe','ألم الصدر']){
  engine.reset();
  const r=adaptive.assess({message:symptom,context:{language:symptom==='ألم الصدر'?'ar':'en',profile:{conditions:'asthma',meds:'test'}},engine});
  assert.equal(r.urgency,'emergency');assert.equal(r.questions.length,0);
  assert.ok(r.guidance.join(' ').includes('998'));
 }
});
test('language, severity and child context affect guidance without prescribing',()=>{
 engine.reset();
 const r=adaptive.assess({message:'صداع',context:{language:'ar',severity:'severe',profile:{age:16}},engine});
 assert.equal(r.context.language,'ar');assert.ok(r.guidance.join(' ').includes('18'));
 assert.equal(r.questions.length>0,true);
});
test('future model adapter contract has versioned safe output',()=>{
 assert.equal(adaptive.contract.schemaVersion,'medimind-consultation-v1');
 assert.ok(adaptive.contract.required.includes('urgency'));
 assert.throws(()=>adaptive.assess({message:'headache'}),/safety engine required/);
});
