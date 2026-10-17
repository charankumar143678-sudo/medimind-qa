import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const code=readFileSync(new URL('../app/consultation-engine.js',import.meta.url),'utf8');
const sandbox={Date,console};
vm.runInNewContext(code+';globalThis.engine=MediMindConsultation;',sandbox);
const engine=sandbox.engine;
test('multiple symptoms and reported duration are captured without invented measurements',()=>{
 engine.reset();const result=engine.assess('Headache fever and body pain for 3 days');
 assert.equal(result.urgency,'unknown');
 assert.equal(engine.getState().duration,'3 days');
 assert.ok(engine.getState().topics.includes('headache'));
 assert.ok(engine.getState().topics.includes('fever'));
 assert.equal(engine.getState().severity,null);
 assert.ok(result.questions.length>0);
});
test('emergency warning signs interrupt routine questions',()=>{
 for(const phrase of ['severe chest pain','face droop and slurred speech','cannot breathe','uncontrolled bleeding','anaphylaxis','unconscious','serious head injury','fever with stiff neck','ألم الصدر','لا أستطيع التنفس','حمى مع تيبس الرقبة']){
  engine.reset();const x=engine.assess(phrase,phrase.match(/[\u0600-\u06FF]/)?'ar':'en');
  assert.equal(x.urgency,'emergency',phrase);
  assert.equal(x.questions.length,0);
 }
});
test('unknown symptoms never receive false reassurance',()=>{
 engine.reset();const x=engine.assess('a strange sensation that I cannot explain');
 assert.equal(x.urgency,'unknown');assert.ok(x.lines.join(' ').includes('not a medical diagnosis'));
});
test('Arabic structured assessment and summary are localized',()=>{
 engine.reset();const x=engine.assess('صداع وحمى منذ ٣ أيام','ar');
 assert.ok(x.questions.some(q=>q.includes('متى')));
 assert.ok(engine.summary('ar').includes('ليس تشخيصاً طبياً'));
});
test('consultation reset clears in-memory history',()=>{
 engine.reset();engine.assess('cough for 2 days');assert.ok(engine.getState().reported.length);
 engine.reset();assert.equal(engine.getState().reported.length,0);
});
