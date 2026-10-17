/* MediMind Phase 4: zero-API-cost adaptive consultation adapter.
   No diagnosis, no network, no automated prescribing; clinician review required. */
const MediMindAdaptive=(()=>{
 const VERSION='medimind-consultation-v1';
 const safeText=(value,max=240)=>typeof value==='string'?value.trim().slice(0,max):'';
 const normalizeProfile=(raw)=>{
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return {age:null,allergies:'',conditions:'',meds:''};
  const age=raw.age===''||raw.age==null?null:Number(raw.age);
  return {age:Number.isInteger(age)&&age>=1&&age<=120?age:null,
   allergies:safeText(raw.allergies),conditions:safeText(raw.conditions),meds:safeText(raw.meds)};
 };
 const createContext=({profile={},duration='',severity='',language='en'}={})=>({
  profile:normalizeProfile(profile),duration:safeText(duration,80),severity:['mild','moderate','severe'].includes(severity)?severity:null,
  language:language==='ar'?'ar':'en'
 });
 const questionSets={
  en:{onset:'When did this start, and has it changed?',impact:'How is this affecting your usual activities?',age:'Is the symptom different from your usual health?',meds:'Have any medicines recently changed? Do not stop prescribed medicines without professional advice.',allergy:'Could there have been an exposure to a known allergy?',conditions:'Has this symptom occurred with your existing health conditions?',duration:'Has it been improving, worsening, or staying the same?',severity:'How would you describe the severity (mild, moderate, or severe)?',follow:'Have any new warning signs appeared since your last message?'},
  ar:{onset:'متى بدأ العرض وهل تغير؟',impact:'كيف يؤثر على أنشطتك المعتادة؟',age:'هل يختلف العرض عن حالتك المعتادة؟',meds:'هل تغير أي دواء مؤخراً؟ لا توقف الدواء الموصوف دون استشارة طبية.',allergy:'هل تعرضت لمادة تعرف أن لديك حساسية منها؟',conditions:'هل حدث هذا العرض مع حالاتك الصحية السابقة؟',duration:'هل تتحسن الأعراض أم تزداد أم تبقى كما هي؟',severity:'كيف تصف الشدة (خفيفة أو متوسطة أو شديدة)؟',follow:'هل ظهرت علامات تحذيرية جديدة منذ رسالتك الأخيرة؟'}
 };
 const buildQuestions=(base,ctx,turn)=>{
  if(base.urgency==='emergency')return [];
  const t=questionSets[ctx.language],items=[...base.questions];
  const add=q=>{if(q&&!items.includes(q)&&items.length<6)items.push(q);};
  if(!ctx.duration)add(t.onset);else add(t.duration);
  if(!ctx.severity)add(t.severity);else add(t.impact);
  if(ctx.profile.meds)add(t.meds);
  if(ctx.profile.age!==null)add(t.age);
  if(ctx.profile.allergies)add(t.allergy);
  if(ctx.profile.conditions)add(t.conditions);
  if(turn>1)add(t.follow);
  return items.slice(0,6);
 };
 const guidance=(base,ctx)=>{
  const ar=ctx.language==='ar';
  const lines=[];
  if(base.urgency==='emergency')return [ar?'تحذير طارئ: اطلب المساعدة فوراً. في الإمارات اتصل بالإسعاف 998؛ خارجها اتصل بالطوارئ المحلية.':'Emergency warning: seek immediate help. In the UAE call 998; elsewhere call local emergency services.'];
  lines.push(ar?'لا يمكن تحديد التشخيص أو استبعاد الطوارئ من هذه المعلومات.':'This information cannot determine a diagnosis or rule out an emergency.');
  if(ctx.profile.meds)lines.push(ar?'اذكر أدويتك الحالية للطبيب، ولا تغير الجرعات بنفسك.':'Tell your clinician about current medicines; do not change doses on your own.');
  if(ctx.profile.allergies)lines.push(ar?'أخبر الطبيب عن الحساسية المسجلة، وتجنب افتراض سبب الأعراض.':'Share recorded allergies with a clinician; do not assume they explain symptoms.');
  if(ctx.profile.conditions)lines.push(ar?'ناقش الحالات الصحية السابقة مع الطبيب لتفسير الأعراض في سياقها.':'Discuss existing health conditions with a clinician for appropriate context.');
  if(ctx.profile.age!==null&&ctx.profile.age<18)lines.push(ar?'لمن هم دون 18 عاماً، استعن بولي أمر أو بمختص صحي.':'For people under 18, involve a parent or qualified clinician.');
  if(ctx.severity==='severe')lines.push(ar?'إذا كانت الأعراض شديدة، اطلب تقييماً طبياً حضورياً سريعاً؛ وإذا كانت خطيرة أو تتدهور فاتصل بالطوارئ.':'For severe symptoms, seek prompt in-person assessment; use emergency services for dangerous or worsening symptoms.');
  lines.push(ar?'المعلومات تعليمية فقط، وليست تشخيصاً أو فرزاً طبياً معتمداً.':'Educational guidance only; not a diagnosis or validated triage.');
  return lines;
 };
 const assess=({message,context,engine,turn=1}={})=>{
  if(!engine||typeof engine.assess!=='function')throw Error('Consultation safety engine required');
  const ctx=createContext(context);
  const base=engine.assess(safeText(message,3000),ctx.language);
  const questions=buildQuestions(base,ctx,turn);
  return {schemaVersion:VERSION,urgency:base.urgency,flags:base.flags,questions,
   guidance:guidance(base,ctx),sources:base.sources||[],state:base.state,
   lines:base.lines,context:ctx,provider:'deterministic-local-v1'};
 };
 // Contract for a future model adapter: same output fields, safety always enforced
 // by the independently invoked deterministic engine before displaying results.
 const contract=Object.freeze({schemaVersion:VERSION,required:['urgency','flags','questions','guidance','sources','provider']});
 return {assess,createContext,normalizeProfile,contract};
})();