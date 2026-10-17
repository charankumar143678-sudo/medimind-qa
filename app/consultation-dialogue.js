/* Phase 4 multi-turn adaptive questionnaire. Educational only, not triage. */
const MediMindDialogue=(()=>{
 const definitions=[
 {id:'onset',en:'When did the symptom begin?',ar:'متى بدأت الأعراض؟',kind:'text',detect:/\b(today|yesterday|last night|ago|days?|weeks?|months?)\b|اليوم|أمس|منذ|أسبوع|شهر/i},
 {id:'severity',en:'How severe is it on a scale of 1–10?',ar:'ما شدة الأعراض من ١ إلى ١٠؟',kind:'scale',detect:/\b(?:pain|severity)\s*(?:is|:)?\s*(?:[1-9]|10)\b|شدة\s*[١-٩]|شديد|خفيف/i},
 {id:'onsetStyle',en:'Did it begin suddenly or gradually?',ar:'هل بدأت فجأة أم تدريجياً؟',kind:'choice',options:[['Suddenly','فجأة'],['Gradually','تدريجياً'],['Not sure','لست متأكداً']]},
 {id:'location',en:'Where is the symptom located?',ar:'أين يقع العرض؟',kind:'text'},
 {id:'associated',en:'Are there other symptoms you want to mention?',ar:'هل توجد أعراض أخرى تريد ذكرها؟',kind:'text'},
 {id:'impact',en:'How does this affect your normal activities?',ar:'كيف تؤثر الأعراض على نشاطك المعتاد؟',kind:'text'},
 {id:'progress',en:'Are symptoms improving, worsening or unchanged?',ar:'هل الأعراض تتحسن أم تسوء أم ثابتة؟',kind:'choice',options:[['Improving','تتحسن'],['Worsening','تسوء'],['Unchanged','ثابتة']]},
 ];
 const empty=()=>({answers:{},asked:[],current:[],messages:[],notes:[],emergency:false});
 let state=empty();
 const text=x=>typeof x==='string'?x.trim().slice(0,600):'';
 const copy=()=>JSON.parse(JSON.stringify(state));
 const questions=(lang='en')=>state.current.map(id=>{const d=definitions.find(x=>x.id===id);return {id,text:lang==='ar'?d.ar:d.en,kind:d.kind,options:(d.options||[]).map(o=>lang==='ar'?o[1]:o[0])};});
 const capture=(message)=>{
  const v=text(message);
  if(!v)return;
  for(const d of definitions){if(d.detect?.test(v)&&!state.answers[d.id])state.answers[d.id]=v;}
  for(const id of state.current){if(!state.answers[id]){state.answers[id]=v;break;}}
 };
 const step=({message='',base,context={},language='en'}={})=>{
  if(!base)throw Error('Independent safety result required');
  const v=text(message);
  if(v){state.messages.push(v);capture(v);}
  if(base.urgency==='emergency'){state.emergency=true;state.current=[];return {questions:[],progress:state.asked.length,complete:false,emergency:true,answers:{...state.answers},notes:[...state.notes]};}
  if(state.emergency){return {questions:[],progress:state.asked.length,complete:false,emergency:true,answers:{...state.answers},notes:[...state.notes]};}
  if(context.duration&&!state.answers.onset)state.answers.onset=text(context.duration);
  if(context.severity&&!state.answers.severity)state.answers.severity=text(context.severity);
  const severity=state.answers.severity;
  if(severity&&/\b(?:[8-9]|10)\b/.test(severity)&&!state.notes.includes('high-severity'))state.notes.push('high-severity');
  state.current=definitions.filter(d=>!state.answers[d.id]&&!state.asked.includes(d.id)).slice(0,2).map(d=>d.id);
  state.asked.push(...state.current);
  return {questions:questions(language),progress:Object.keys(state.answers).length,total:definitions.length,complete:state.current.length===0,emergency:false,answers:{...state.answers},notes:[...state.notes]};
 };
 const answer=(id,value)=>{
  if(!definitions.some(d=>d.id===id))return false;
  const v=text(value);if(!v)return false;
  state.answers[id]=v;state.current=state.current.filter(x=>x!==id);return true;
 };
 const correct=(id,value)=>{if(!definitions.some(d=>d.id===id))return false;const v=text(value);if(!v)return false;state.answers[id]=v;state.notes.push('corrected-'+id);return true;};
 const reset=()=>{state=empty();return copy();};
 return {step,answer,correct,reset,getState:copy,definitions};
})();