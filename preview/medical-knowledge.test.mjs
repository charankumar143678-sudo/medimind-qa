import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const script=readFileSync(new URL('../app/medical-knowledge.js',import.meta.url),'utf8');
const ctx={};vm.runInNewContext(script+';globalThis.catalog=MEDIMIND_KNOWLEDGE;',ctx);
const kb=ctx.catalog;
test('exact counts, unique IDs and complete source provenance',()=>{
 assert.equal(kb.records.length,9);
 assert.equal(kb.records.filter(x=>x.type==='condition').length,6);
 assert.equal(kb.records.filter(x=>x.type==='test').length,3);
 assert.equal(kb.validateCatalog(kb.records).ok,true);
 for(const x of kb.records){assert.ok(x.source.url.startsWith('https://medlineplus.gov/'));assert.ok(x.source.verifiedOn);}
});
test('Arabic and English search, synonyms and specialty filters',()=>{
 assert.equal(kb.search('الربو')[0].id,'asthma');
 assert.equal(kb.search('anaemia')[0].id,'anemia');
 assert.equal(kb.search('blood sugar').some(x=>x.id==='diabetes'),true);
 assert.equal(kb.search('',{specialty:'Cardiology'}).length,1);
 assert.equal(kb.search('A1C',{type:'test'})[0].id,'hba1c');
});
test('rejects malformed records and duplicate identifiers',()=>{
 assert.equal(kb.validateCatalog([{},kb.records[0]]).ok,false);
 assert.equal(kb.validateCatalog([kb.records[0],kb.records[0]]).ok,false);
 assert.equal(kb.validateCatalog([{...kb.records[0],source:{url:'javascript:alert(1)',publisher:'MedlinePlus',verifiedOn:'2026-10-17'}}]).ok,false);
});
test('missing records and unknown terms are safe',()=>{
 assert.equal(kb.get('not-a-record'),null);
 assert.equal(kb.search('a nonexistent condition').length,0);
});
