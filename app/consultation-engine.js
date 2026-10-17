/* MediMind Phase 2 consultation foundation. Deterministic, educational and not clinically validated. */
const MediMindConsultation=(()=>{
 const labels={
 en:{intro:'Understanding your symptoms',questions:'A few important questions',education:'Educational information',next:'Recommended next step',safety:'Safety guidance',emergency:'EMERGENCY — seek immediate help now',urgent:'Prompt in-person medical assessment is advisable',routine:'Arrange a clinician assessment if symptoms persist or concern you',unknown:'There is not enough information to assess urgency safely.',disclaimer:'This is educational guidance, not a medical diagnosis or validated triage assessment. Missing details cannot rule out an emergency.',uae:'In the UAE call ambulance 998. Elsewhere call your local emergency service.',follow:'Please answer only questions you are comfortable with.',report:'You reported',possible:'Possible explanations depend on a clinical examination; this tool cannot confirm a cause.'},
 ar:{intro:'فهم الأعراض',questions:'بعض الأسئلة المهمة',education:'معلومات تثقيفية',next:'الخطوة التالية المقترحة',safety:'إرشادات السلامة',emergency:'حالة طارئة — اطلب المساعدة الطبية فوراً',urgent:'يُنصح بتقييم طبي حضوري سريع',routine:'رتّب تقييماً لدى طبيب إذا استمرت الأعراض أو أقلقتك',unknown:'المعلومات غير كافية لتقييم درجة الاستعجال بأمان.',disclaimer:'هذه معلومات تثقيفية وليست تشخيصاً أو تقييماً سريرياً معتمداً. غياب التفاصيل لا يستبعد الطوارئ.',uae:'في الإمارات اتصل بالإسعاف 998. خارج الإمارات اتصل بخدمات الطوارئ المحلية.',follow:'أجب فقط عن الأسئلة التي ترغب في الإجابة عنها.',report:'لقد ذكرت',possible:'تحتاج الأسباب المحتملة إلى فحص سريري؛ لا تستطيع هذه الأداة تأكيد السبب.'}
 };
 const flags=[
 {id:'stroke',re:/\b(face droop|slurred speech|one.sided weakness|stroke symptoms|sudden weakness)\b|تدلي الوجه|ضعف مفاجئ|تلعثم الكلام|علامات السكتة/i},
 {id:'chest',re:/\b(severe chest pain|crushing chest pain|chest pressure|chest pain)\b|ألم الصدر|الم الصدر|ضغط الصدر/i},
 {id:'breath',re:/\b(can.t breathe|cannot breathe|severe breathing difficulty|struggling to breathe|difficulty breathing)\b|لا أستطيع التنفس|لا استطيع التنفس|صعوبة التنفس|اختناق شديد/i},
 {id:'allergy',re:/\b(anaphylaxis|severe allergic reaction|swollen tongue with breathing trouble)\b|صدمة تحسسية|حساسية شديدة|تورم اللسان مع صعوبة التنفس/i},
 {id:'bleeding',re:/\b(uncontrolled bleeding|heavy bleeding that won't stop)\b|نزيف لا يتوقف|نزيف شديد/i},
 {id:'consciousness',re:/\b(unconscious|unresponsive|loss of consciousness|seizure)\b|فقدان الوعي|فاقد الوعي|تشنج/i},
 {id:'head',re:/\b(serious head injury|severe head injury|head injury with confusion)\b|إصابة خطيرة بالرأس|إصابة الرأس مع تشوش/i},
 {id:'mental',re:/\b(suicidal|suicide attempt|want to kill myself|immediate self harm)\b|أريد الانتحار|محاولة انتحار|أريد إيذاء نفسي/i},
 {id:'meningitis',re:/\b(stiff neck.*fever|fever.*stiff neck|confusion.*fever|fever.*confusion)\b|حمى.*تيبس الرقبة|تيبس الرقبة.*حمى|حمى.*تشوش/i}
 ];
 const topics=[
 {id:'headache',en:'Headache',ar:'صداع',re:/\b(headache|migraine|head pain)\b|صداع|شقيقة/i,q:{en:['When did the headache begin and how severe is it?','Is it sudden, unusually severe, or accompanied by fever, neck stiffness or weakness?'],ar:['متى بدأ الصداع وما شدته؟','هل بدأ فجأة أو كان شديداً على غير المعتاد أو صاحبه حمى أو تيبس رقبة أو ضعف؟']},source:'https://medlineplus.gov/headache.html'},
 {id:'fever',en:'Fever',ar:'حمى',re:/\b(fever|high temperature|febrile)\b|حمى|حرارة مرتفعة/i,q:{en:['What temperature did you measure, if any?','How many days has the fever lasted? Any dehydration, confusion or breathing changes?'],ar:['ما درجة الحرارة المقاسة إن وُجدت؟','منذ كم يوم بدأت الحمى؟ هل يوجد جفاف أو تشوش أو تغير في التنفس؟']},source:'https://medlineplus.gov/fever.html'},
 {id:'cough',en:'Cough',ar:'سعال',re:/\b(cough|coughing)\b|سعال|كحة/i,q:{en:['Is the cough dry or producing mucus?','Any difficulty breathing, chest pain or fever?'],ar:['هل السعال جاف أم مصحوب ببلغم؟','هل توجد صعوبة في التنفس أو ألم صدر أو حمى؟']},source:'https://medlineplus.gov/cough.html'},
 {id:'abdominal',en:'Abdominal pain',ar:'ألم البطن',re:/\b(abdominal pain|stomach pain|belly pain)\b|ألم البطن|وجع البطن/i,q:{en:['Where is the pain and when did it start?','Is it severe, worsening, or accompanied by vomiting or bleeding?'],ar:['أين الألم ومتى بدأ؟','هل هو شديد أو يزداد أو يصاحبه قيء أو نزيف؟']},source:'https://medlineplus.gov/abdominalpain.html'},
 {id:'back',en:'Back pain',ar:'ألم الظهر',re:/\b(back pain|backache)\b|ألم الظهر/i,q:{en:['Did the pain begin after an injury?','Any new weakness, numbness or bladder/bowel changes?'],ar:['هل بدأ الألم بعد إصابة؟','هل يوجد ضعف أو خدر جديد أو تغير في التحكم بالمثانة أو الأمعاء؟']},source:'https://medlineplus.gov/backpain.html'},
 {id:'skin',en:'Skin symptoms',ar:'أعراض الجلد',re:/\b(rash|itchy skin|skin irritation)\b|طفح جلدي|حكة الجلد/i,q:{en:['Where is the skin change and when did it appear?','Any fever, swelling of the face or trouble breathing?'],ar:['أين التغير الجلدي ومتى ظهر؟','هل توجد حمى أو تورم في الوجه أو صعوبة تنفس؟']},source:'https://medlineplus.gov/rashes.html'},
 {id:'fatigue',en:'Fatigue',ar:'إرهاق',re:/\b(fatigue|tired|exhausted)\b|إرهاق|تعب شديد/i,q:{en:['How long have you felt tired?','Any fainting, new weakness, fever or major sleep changes?'],ar:['منذ متى تشعر بالتعب؟','هل يوجد إغماء أو ضعف جديد أو حمى أو تغير كبير في النوم؟']},source:'https://medlineplus.gov/fatigue.html'}
 ];
 const duration=/\b(\d{1,3})\s*(days?|weeks?|months?|hours?)\b|(?:منذ|لمدة)\s*([٠-٩0-9]{1,3})\s*(يوم|أيام|اسبوع|أسبوع|شهر|ساعة)/i;
 const severity=/\b(mild|moderate|severe|worst|intense)\b|خفيف|متوسط|شديد|حاد/i;
 const create=()=>({messages:[],reported:[],duration:null,severity:null,history:null,answers:[],flags:[],topics:[],lastAdvice:null,created:new Date().toISOString()});
 let state=create();
 const assess=(message,lang='en')=>{
  const text=String(message||'').trim().slice(0,3000),l=lang==='ar'?'ar':'en',t=labels[l];
  if(!text)return {state,urgency:'unknown',questions:[],lines:[]};
  state.messages.push({kind:'patient',text});
  state.reported.push(text);
  const d=text.match(duration);if(d)state.duration=d[0];
  const s=text.match(severity);if(s)state.severity=s[0];
  const matches=topics.filter(topic=>topic.re.test(text));
  state.topics=[...new Set([...state.topics,...matches.map(x=>x.id)])];
  const detected=flags.filter(flag=>flag.re.test(text));
  state.flags=[...new Set([...state.flags,...detected.map(x=>x.id)])];
  const emergency=state.flags.length>0;
  const questions=emergency?[]:matches.flatMap(x=>x.q[l]).slice(0,4);
  if(!emergency&&!questions.length)questions.push(l==='ar'?'ما العرض الرئيسي ومتى بدأ وما شدته؟':'What is the main symptom, when did it start, and how severe is it?');
  const urgency=emergency?'emergency':matches.length?'unknown':'unknown';
  const lines=[(l==='ar'&&!emergency?'موضوع التقييم: ':'')+t.intro+': '+t.report+' '+text,
   emergency?t.emergency: t.unknown,
   ...(emergency?[t.uae]:[t.questions+': '+questions.join(' • '),t.possible]),
   t.disclaimer];
  const sources=matches.map(x=>({name:l==='ar'?x.ar:x.en,url:x.source}));
  state.lastAdvice={urgency,questions,sources,lang:l};
  state.messages.push({kind:'assistant',text:lines.join('\n\n')});
  return {state,urgency,questions,lines,sources,flags:[...state.flags]};
 };
 const summary=(lang='en')=>{
  const l=lang==='ar'?'ar':'en',t=labels[l];
  const parts=l==='ar'?['ملخص استشارة أبلغ به المريض — ليس تشخيصاً طبياً','التاريخ','الأعراض التي ذكرها المريض','المدة المذكورة','الشدة المذكورة','علامات التحذير المكتشفة','التوجيه التعليمي','أسئلة للطبيب']:['Patient-Reported Consultation Summary — Not a Medical Diagnosis.','Date','Patient-reported symptoms','Reported duration','Reported severity','Warning signs identified','Educational guidance','Questions for clinician'];
  return [parts[0],parts[1]+': '+state.created,parts[2]+': '+(state.reported.join(' | ')||'—'),parts[3]+': '+(state.duration||'—'),parts[4]+': '+(state.severity||'—'),parts[5]+': '+(state.flags.join(', ')||'—'),parts[6]+': '+(state.lastAdvice?.urgency==='emergency'?t.emergency+'; '+t.uae:t.unknown),parts[7]+': '+(state.lastAdvice?.questions.join(' | ')||'—'),t.disclaimer].join('\n\n');
 };
 return {assess,summary,reset(){state=create();return state;},getState(){return JSON.parse(JSON.stringify(state));},flags,topics};
})();