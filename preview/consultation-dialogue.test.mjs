import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const ctx={};vm.runInNewContext(readFileSync(new URL('../app/consultation-dialogue.js',import.meta.url),'utf8')+';globalThis.dialogue=MediMindDialogue;',ctx);
const d=ctx.dialogue;
test('one or two questions per turn, no repeated asked questions',()=>{
 d.reset();const base={urgency:'unknown'};
 const first=d.step({message:'I have a headache',base});
 assert.ok(first.questions.length>0&&first.questions.length<=2);
 const second=d.step({message:'yesterday',base});
 assert.ok(second.questions.length<=2);
 assert.notEqual(first.questions[0].id,second.questions[0]?.id);
});
test('patient can correct an earlier answer',()=>{
 d.reset();d.step({message:'headache',base:{urgency:'unknown'}});
 assert.equal(d.answer('severity','6'),true);
 assert.equal(d.correct('severity','4'),true);
 assert.equal(d.getState().answers.severity,'4');
});
test('emergency interrupts all subsequent questioning',()=>{
 d.reset();d.step({message:'headache',base:{urgency:'unknown'}});
 const emergency=d.step({message:'severe chest pain',base:{urgency:'emergency'}});
 assert.equal(emergency.questions.length,0);
 assert.equal(d.step({message:'better now',base:{urgency:'unknown'}}).emergency,true);
});
test('missing values and malformed corrections do not create answers',()=>{
 d.reset();assert.equal(d.answer('severity',''),false);
 assert.equal(d.correct('unknown','3'),false);
 assert.equal(d.step({base:{urgency:'unknown'},language:'ar'}).questions[0].text.includes('متى'),true);
});
test('contextual duration and severity reduce unanswered questions',()=>{
 d.reset();const x=d.step({message:'headache',base:{urgency:'unknown'},context:{duration:'3 days',severity:'moderate'}});
 assert.equal(x.answers.onset,'3 days');assert.equal(x.answers.severity,'moderate');
 assert.ok(x.questions.every(q=>!['onset','severity'].includes(q.id)));
});
