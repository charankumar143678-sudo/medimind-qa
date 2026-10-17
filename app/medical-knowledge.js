/* Phase 3: limited, source-linked educational metadata, not clinician-reviewed condition articles. */
const MEDIMIND_KNOWLEDGE=(()=>{
 const verifiedOn='2026-10-17';
 const source=(url)=>({publisher:'MedlinePlus (U.S. National Library of Medicine)',url,verifiedOn,clinicalReviewDate:null,licenseStatus:'Outbound link only; no source text reproduced'});
 const records=[
 {id:'asthma',type:'condition',en:'Asthma',ar:'الربو',syn:['wheezing','airway disease','صفير','ضيق النفس'],specialty:'Pulmonology',summary:'A long-term condition affecting the airways; symptoms and treatment need clinical assessment.',symptoms:['wheezing','cough','shortness of breath'],tests:['lung function assessment'],management:'Clinicians may recommend inhaled medicines and an individualized action plan.',emergency:'Severe breathing difficulty needs emergency care.',source:source('https://medlineplus.gov/asthma.html')},
 {id:'diabetes',type:'condition',en:'Diabetes',ar:'السكري',syn:['high blood sugar','hyperglycemia','سكر الدم'],specialty:'Endocrinology',summary:'A group of conditions involving high blood glucose that require diagnosis and ongoing care.',symptoms:['thirst','frequent urination','fatigue'],tests:['blood glucose','HbA1c'],management:'Care may involve nutrition, activity, monitoring and clinician-directed medication.',emergency:'Severe illness with confusion or altered consciousness requires emergency assessment.',source:source('https://medlineplus.gov/diabetes.html')},
 {id:'hypertension',type:'condition',en:'High blood pressure',ar:'ارتفاع ضغط الدم',syn:['hypertension','elevated BP','ضغط مرتفع'],specialty:'Cardiology',summary:'Persistently elevated blood pressure is assessed using repeated, correctly taken measurements.',symptoms:['often no noticeable symptoms'],tests:['blood pressure measurements'],management:'Care may involve lifestyle changes and prescribed medication following clinical assessment.',emergency:'Chest pain, stroke signs or severe breathing difficulty require emergency care.',source:source('https://medlineplus.gov/highbloodpressure.html')},
 {id:'uti',type:'condition',en:'Urinary tract infection',ar:'عدوى المسالك البولية',syn:['UTI','bladder infection','burning urination','التهاب المسالك'],specialty:'General medicine',summary:'An infection involving part of the urinary system; testing and treatment depend on clinical context.',symptoms:['burning urination','frequent urination','lower abdominal discomfort'],tests:['urine testing'],management:'A clinician may assess the need for antimicrobial treatment.',emergency:'Severe illness or confusion requires immediate medical assessment.',source:source('https://medlineplus.gov/urinarytractinfections.html')},
 {id:'anemia',type:'condition',en:'Anemia',ar:'فقر الدم',syn:['anaemia','low hemoglobin','low Hb','أنيميا'],specialty:'Hematology',summary:'Anemia describes reduced red-cell oxygen-carrying capacity and has different possible causes.',symptoms:['fatigue','weakness','dizziness'],tests:['complete blood count','hemoglobin'],management:'Treatment depends on the cause identified by a clinician.',emergency:'Fainting, severe chest pain or severe breathlessness requires emergency care.',source:source('https://medlineplus.gov/anemia.html')},
 {id:'migraine',type:'condition',en:'Migraine',ar:'الشقيقة',syn:['migraine headache','صداع نصفي','الشقيقة'],specialty:'Neurology',summary:'A neurological headache condition that may include nausea or sensitivity to light.',symptoms:['headache','nausea','light sensitivity'],tests:['clinical history and examination'],management:'Management can involve trigger planning and clinician-recommended therapies.',emergency:'Sudden worst-ever headache, new weakness or confusion needs emergency care.',source:source('https://medlineplus.gov/migraine.html')}
 ];
 const tests=[
 {id:'cbc',type:'test',en:'Complete blood count',ar:'تعداد الدم الكامل',syn:['CBC','full blood count','صورة الدم'],specialty:'Laboratory medicine',summary:'Measures blood-cell counts and related parameters; results require laboratory reference intervals and clinical context.',source:source('https://medlineplus.gov/lab-tests/complete-blood-count-cbc/')},
 {id:'hba1c',type:'test',en:'Hemoglobin A1c',ar:'الهيموغلوبين السكري',syn:['HbA1c','A1C','السكر التراكمي'],specialty:'Laboratory medicine',summary:'Estimates average blood glucose over roughly two to three months; conditions affecting red blood cells may affect accuracy.',source:source('https://medlineplus.gov/lab-tests/hemoglobin-a1c-hba1c-test/')},
 {id:'urinalysis',type:'test',en:'Urinalysis',ar:'تحليل البول',syn:['urine test','UA','فحص البول'],specialty:'Laboratory medicine',summary:'Examines urine properties and substances to help assess urinary or other conditions.',source:source('https://medlineplus.gov/urinalysis.html')}
 ];
 const valid=r=>r&&typeof r.id==='string'&&/^[a-z0-9-]+$/.test(r.id)&&['condition','test'].includes(r.type)&&typeof r.en==='string'&&r.en.length>1&&typeof r.ar==='string'&&r.ar.length>1&&Array.isArray(r.syn)&&typeof r.specialty==='string'&&typeof r.summary==='string'&&r.summary.length>10&&r.source&&r.source.publisher.includes('MedlinePlus')&&/^https:\/\/medlineplus\.gov\/[a-z0-9/.-]+\/?$/.test(r.source.url)&&/^\d{4}-\d\d-\d\d$/.test(r.source.verifiedOn);
 const validateCatalog=(items)=>{
  if(!Array.isArray(items))return {ok:false,errors:['Catalog is not an array']};
  const ids=new Set(),errors=[];
  items.forEach((r,i)=>{if(!valid(r))errors.push('Invalid record at '+i);else if(ids.has(r.id))errors.push('Duplicate id '+r.id);else ids.add(r.id);});
  return {ok:errors.length===0,errors};
 };
 const all=[...records,...tests];
 if(!validateCatalog(all).ok)throw Error('Invalid medical knowledge index');
 const normalize=s=>String(s||'').normalize('NFKC').toLocaleLowerCase().replace(/[\u064b-\u065f\u0670]/g,'').replace(/\s+/g,' ').trim();
 const search=(query='',{type='all',specialty='all',limit=50}={})=>{
  const q=normalize(query),words=q.split(' ').filter(Boolean);
  return all.filter(r=>(type==='all'||r.type===type)&&(specialty==='all'||r.specialty===specialty)&&(!words.length||words.every(w=>normalize([r.en,r.ar,...r.syn,r.specialty,...(r.symptoms||[])].join(' ')).includes(w)))).slice(0,Math.min(100,Math.max(0,limit)));
 };
 const get=id=>all.find(r=>r.id===id)||null;
 return {records:all,validateCatalog,search,get,normalize};
})();