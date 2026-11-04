const SITE_BASE=(()=>{try{return new URL('.',document.currentScript.src).pathname}catch(e){return '/'}})();
const KEY = 'experthub-event-demo-v1';
const FIRST_VISIT=(()=>{try{return localStorage.getItem(KEY)===null}catch{return false}})();
let seedDone=false;
async function applySeed(){if(!FIRST_VISIT||seedDone)return;seedDone=true;try{const r=await fetch(SITE_BASE+'seed.json',{cache:'no-cache'});if(!r.ok)return;const seed=await r.json();if(!seed||!seed.root)return;for(const [id,m] of Object.entries(seed.media||{})){const blob=await (await fetch(m.data)).blob();await storeMedia(id,new File([blob],m.name||id,{type:m.type||blob.type}))}root=normalizeRoot(seed.root);pickEvent(root.currentId);save();if(seed.library){library=normalizeLibrary(seed.library);saveLibrary()}}catch{}}
const DEFAULT_EVENT = {
  name:'AI × Design 工作坊', tagline:'讓交流，成為下一個靈感。',
  intro:'從產品、設計與技術的真實工作情境出發，一起探索新的協作方法。',
  date:'2026-11-20', start:'14:00', end:'17:00', venue:'台北交流空間', mode:'實體＋線上',
  audience:'PM、Designer、Developer', capacity:100, deadline:'2026-11-19T18:00',
  registrationOpen:true,tags:'AI,設計,工作坊',regStart:'',statusOverride:'auto', department:true, company:true, phone:true,
  bannerMode:'default',bannerId:'',bannerName:'',bannerShowText:false,bannerAlt:'',
  industryOptions:['資訊科技／軟體服務','電子製造／半導體','零售／電商','金融／保險','醫療／生技','教育／研究','政府／公部門','專業服務','其他'],
  agenda:'14:00｜開場與分享\n14:30｜情境示範\n15:15｜分組實作\n16:30｜成果交流'
};
const REGISTRATION_FIELDS = [
  {id:'name',input:'regName',label:'報名姓名',type:'text',max:80,locked:true},
  {id:'company',input:'regCompany',label:'公司名稱',type:'text',max:150},
  {id:'email',input:'regEmail',label:'Email',type:'email',max:200,locked:true},
  {id:'phone',input:'regPhone',label:'聯絡電話',type:'tel',max:40},
  {id:'industry',input:'regIndustry',label:'產業類別',type:'select',max:150},
  {id:'jobTitle',input:'regJobTitle',label:'職稱',type:'text',max:100},
  {id:'department',input:'regDepartment',label:'部門',type:'text',max:100}
];
function registrationConfig(event=state.event){const stored=event.registrationFields||{};return Object.fromEntries(REGISTRATION_FIELDS.map(f=>{const enabled=f.locked||stored[f.id]?.enabled!==false;const required=!!(f.locked||(enabled&&(stored[f.id]?.required??['company','phone'].includes(f.id))));return [f.id,{enabled,required}]}))}
const QUESTION_BANK = [
  {id:'satisfaction',type:'rating',title:'你對這次活動的整體滿意度？',required:true,options:[]},
  {id:'takeaway',type:'single',title:'這次活動最有收穫的部分是？',required:true,options:['主題分享','實作體驗','跨團隊交流']},
  {id:'recommend',type:'rating',title:'你會推薦同事參與類似活動嗎？',required:true,options:[]},
  {id:'topics',type:'multi',title:'未來希望參與哪些主題？',required:false,options:['AI 應用','設計方法','產品策略','技術實作']},
  {id:'feedback',type:'text',title:'對活動有什麼建議或想法？',required:false,options:[]},
  {id:'apply',type:'text',title:'你打算如何將今天的收穫應用在工作上？',required:false,options:[]}
];
const copy = value => JSON.parse(JSON.stringify(value));
const PHASE_LABEL={ended:'已結束',open:'報名中',soon:'Coming soon'};
function newEventState(over={}){const base={registered:false,registrations:[],responses:[],event:copy(DEFAULT_EVENT),questions:copy([QUESTION_BANK[0],QUESTION_BANK[1],QUESTION_BANK[4]]),surveyOpen:true,surveyMode:'form',surveyVersion:1,status:'draft',title:'AI × Design：活動精彩回顧',summary:'記錄這場交流的重點、現場片段與分享內容。',assets:[],coverId:'',theme:'editorial',comment:'',synced:false,publishedRecap:null,reviewRecap:null};return {...base,...over,event:{...DEFAULT_EVENT,...(over.event||{})}}}
function normalizeEventState(s){if(!['form','chat'].includes(s.surveyMode))s.surveyMode='form';s.event={...DEFAULT_EVENT,...s.event};s.event.registrationFields=registrationConfig(s.event);if(!Array.isArray(s.registrations))s.registrations=[];if(!Array.isArray(s.responses))s.responses=[];if(!Array.isArray(s.assets))s.assets=[];if(s.status==='published'&&!s.publishedRecap)s.publishedRecap={title:s.title,summary:s.summary,assets:copy(s.assets),coverId:s.assets.find(a=>a.type?.startsWith('image/'))?.id||'',theme:'editorial',event:copy(s.event)};if(['review','approved'].includes(s.status)&&!s.reviewRecap)s.status='draft';if(!s.id)s.id=newEventId();return s}
function newEventId(){return 'evt-'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function sampleEvents(){const all={time:true,venue:true,attendees:true,responses:true};
 const ended=newEventState({id:'evt-product-strategy',event:{name:'Product Strategy Meetup',tagline:'把策略，變成可執行的下一步。',intro:'與產品團隊一起拆解策略、優先順序與落地方法，分享各團隊的實戰經驗。',date:'2026-09-18',start:'14:00',end:'17:00',venue:'台北交流空間',mode:'實體',audience:'PM、Product Owner',capacity:80,deadline:'2026-09-17T18:00',agenda:'14:00｜開場\n14:30｜策略拆解分享\n15:30｜案例工作坊\n16:30｜交流',tags:'產品策略,Meetup,PM'},title:'Product Strategy Meetup：活動精彩回顧',summary:'從策略拆解到落地方法，現場夥伴交流各團隊的優先順序判斷與實戰經驗，並整理成可延續使用的共識。',status:'published',synced:true});
 ended.publishedRecap={title:ended.title,summary:ended.summary,assets:[],coverId:'',theme:'editorial',event:copy(ended.event),facts:{show:all,attendees:56,responses:38},publishedAt:'2026/09/20 10:00:00'};
 const soon=newEventState({id:'evt-design-systems',event:{name:'Design Systems Open Day',tagline:'一起把設計語言，變成團隊共識。',intro:'分享設計系統的建置、治理與跨團隊協作，並開放現場交流。',date:'2026-12-12',start:'13:30',end:'16:30',venue:'線上＋台北交流空間',mode:'實體＋線上',audience:'Designer、Frontend、PM',capacity:120,deadline:'2026-12-10T18:00',regStart:'2026-11-16T10:00',agenda:'13:30｜開場\n14:00｜設計系統治理\n15:00｜案例分享\n16:00｜交流',tags:'Design System,設計,公開日'}});
 return [soon,ended].map(normalizeEventState)}
const SEED_CARDS={'evt-ai-design':'banners/banner_1_ai-design-workshop.png','evt-product-strategy':'banners/banner_2_product-strategy-meetup.png','evt-design-systems':'banners/banner_3_design-systems-open-day.png'};
function seedCard(s){const p=SEED_CARDS[s.id];if(p&&s.event&&!s.event.cardImageId){s.event.cardImageId='static:'+p;s.event.cardImageName=p.split('/').pop();if(s.publishedRecap?.event){s.publishedRecap.event.cardImageId=s.event.cardImageId;s.publishedRecap.event.cardImageName=s.event.cardImageName}}return s}
function normalizeRoot(stored){let r;if(stored&&stored.v===2&&Array.isArray(stored.events)&&stored.events.length)r=stored;else{const legacy=normalizeEventState(newEventState(stored&&typeof stored==='object'?stored:{}));legacy.id='evt-ai-design';r={v:2,currentId:legacy.id,events:[legacy,...sampleEvents()].map(seedCard)}}r.events=r.events.map(normalizeEventState);if(!r.events.some(e=>e.id===r.currentId))r.currentId=r.events[0].id;return r}
let root;try{root=normalizeRoot(JSON.parse(localStorage.getItem(KEY)||'null'))}catch{root=normalizeRoot(null)}
let state,activeId;
function pickEvent(id){state=root.events.find(e=>e.id===id)||root.events[0];activeId=state.id}
pickEvent(new URLSearchParams(location.search).get('e')||root.currentId);
function eventPhase(s=state){const e=s.event,ov=e.statusOverride;if(['ended','open','soon'].includes(ov))return ov;const now=Date.now(),end=Date.parse(`${e.date}T${e.end||'23:59'}:00+08:00`);if(!Number.isNaN(end)&&now>end)return 'ended';if(e.regStart){const t=Date.parse(e.regStart+':00+08:00');if(!Number.isNaN(t)&&now<t)return 'soon'}return 'open'}
let tab='intro', adminTab='overview', surveyTab='builder', timer, uploads=[];
const $ = id => document.getElementById(id);
const esc = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function save(){try{localStorage.setItem(KEY,JSON.stringify(root));return true}catch{toast('儲存空間不足，這次變更尚未儲存。');return false}}
function toast(message){$('toast').textContent=message;$('toast').classList.remove('hidden');clearTimeout(timer);timer=setTimeout(()=>$('toast').classList.add('hidden'),4000)}
function statusText(){return {draft:'成果草稿',review:'待 MKT Review',changes:'待調整',approved:'審核通過',published:'已發布'}[state.status]||'成果草稿'}
function dateLabel(date=state.event.date){if(!date)return '時間待公布';const d=new Date(date+'T12:00:00+08:00');return Number.isNaN(d.getTime())?'時間待公布':d.toLocaleDateString('zh-TW',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit',weekday:'short'})}
function timestamp(){return new Date().toLocaleString('zh-TW',{timeZone:'Asia/Taipei'})}
function field(label,name,value,type='text',extra=''){return `<div class="form-field"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${esc(value)}" ${extra}></div>`}
function registrationFieldsHTML(event=state.event){const config=registrationConfig(event);return `<div class="registration-fields">${REGISTRATION_FIELDS.filter(f=>config[f.id].enabled).map(f=>{const label=f.label+(config[f.id].required?' *':'（選填）'),required=config[f.id].required?'required':'';if(f.type==='select')return `<div class="form-field"><label for="${f.input}">${label}</label><select id="${f.input}" name="${f.input}" ${required}><option value="">請選擇產業類別</option>${event.industryOptions.map(option=>`<option value="${esc(option)}">${esc(option)}</option>`).join('')}</select></div>`;return field(label,f.input,'',f.type,`${required} maxlength="${f.max}"${f.id==='jobTitle'?' placeholder="例如：Product Manager"':''}`)}).join('')}</div>`}
function hero(event=state.event){const text=`<span class="tag">EXPERTHUB SESSIONS　/　示範活動</span><h2>${esc(event.name)}</h2><p>${esc(event.tagline)}</p><footer>${esc(dateLabel(event.date))}　/　${esc(event.mode)}</footer>`;const image=event.bannerMode==='image'&&event.bannerId&&mediaURL(event.bannerId);if(image)return `<div class="hero hero-uploaded ${event.bannerShowText?'has-copy':'image-only'}"><img class="event-banner-image" src="${image}" alt="${esc(event.bannerAlt||event.name)}">${event.bannerShowText?`<div class="event-banner-copy">${text}</div>`:''}</div>`;return `<div class="hero">${text}</div>`}
function registrationReason(s=state){const e=s.event,ph=eventPhase(s);if(ph==='ended')return '活動已結束';if(ph==='soon')return '即將開放報名';if(!e.registrationOpen)return '報名尚未開放';if(e.deadline&&Date.now()>Date.parse(e.deadline+':00+08:00'))return '報名已截止';if(s.registrations.length>=Number(e.capacity))return '報名名額已滿';return ''}
function questionInput(q,index,preview=false){const name='q_'+q.id,required=q.required?'required':'';let control='';
  if(q.type==='rating')control=`<div class="rating">${[1,2,3,4,5].map(v=>`<label><input type="radio" name="${name}" value="${v}" ${required}> ${v} 分</label>`).join('')}</div>`;
  if(q.type==='single'||q.type==='multi')control=`<div class="answer-options">${q.options.map(o=>`<label><input type="${q.type==='single'?'radio':'checkbox'}" name="${name}" value="${esc(o)}" ${q.type==='single'?required:''}> ${esc(o)}</label>`).join('')}</div>`;
  if(q.type==='text')control=`<textarea id="answer_${q.id}" name="${name}" aria-label="${esc(q.title)}" maxlength="2000" ${required} placeholder="分享你的想法"></textarea>`;
  return `<fieldset class="survey-question"><legend>${index+1}. ${esc(q.title)} ${q.required?'<span class="required">*</span>':'<small class="fine">選填</small>'}</legend>${control}</fieldset>`;
}
function surveyForm(questions=state.questions,preview=false){return `<form onsubmit="${preview?'event.preventDefault()':'submitSurvey(event)'}">${questions.map((q,i)=>questionInput(q,i,preview)).join('')}<div class="actions"><button class="primary" ${preview?'type="button" disabled':''}>${preview?'問卷預覽，不會送出':'送出問卷'}</button></div></form>`}


const LIB_KEY='experthub-survey-library-v1';
const ISV_COLORS=['#17624e','#b45309','#1d4ed8','#9333ea'];
function defaultLibrary(){const A='isv-a',B='isv-b',C='isv-c',D='isv-d',all=[A,B,C,D];const q=(id,title,type,options,isvIds,required=false)=>({id,title,type,options,isvIds,required});
 return {v:1,isvs:[{id:A,name:'ISV A'},{id:B,name:'ISV B'},{id:C,name:'ISV C'},{id:D,name:'ISV D'}],questions:[
 q('lib-satisfaction','你對這次活動的整體滿意度？','rating',[],all,true),
 q('lib-recommend','你會推薦同事參與類似活動嗎？','rating',[],all,true),
 q('lib-contact','是否同意 ISV 後續與你聯繫？','single',['同意','不同意'],all,true),
 q('lib-feedback','對活動有什麼建議或想法？','text',[],all),
 q('lib-takeaway','這次活動最有收穫的部分是？','single',['主題分享','實作體驗','跨團隊交流'],[A,B]),
 q('lib-timeline','預計何時導入相關解決方案？','single',['3 個月內','6 個月內','一年內','僅了解'],[A,C]),
 q('lib-platform','目前主要使用的雲端平台？','single',['AWS','Azure','GCP','地端自建','尚未導入'],[A]),
 q('lib-budget','相關專案的預算範圍？','single',['50 萬以下','50–200 萬','200–500 萬','500 萬以上','尚未規劃'],[B,D]),
 q('lib-modules','感興趣的產品模組？','multi',['資料分析','AI 應用','資安','雲端遷移'],[C]),
 q('lib-teamsize','所屬公司規模？','single',['50 人以下','50–200 人','200–1000 人','1000 人以上'],[D])]}}
function normalizeLibrary(l){const d=defaultLibrary();if(!l||!Array.isArray(l.isvs)||l.isvs.length===0||!Array.isArray(l.questions))return d;l.isvs=l.isvs.map((v,i)=>({id:v.id||'isv-'+i,name:String(v.name||'ISV '+(i+1))}));const ids=l.isvs.map(v=>v.id);l.questions=l.questions.filter(q=>q&&q.id&&q.title).map(q=>({id:q.id,title:String(q.title),type:['rating','single','multi','text'].includes(q.type)?q.type:'text',options:Array.isArray(q.options)?q.options:[],required:!!q.required,isvIds:(q.isvIds||[]).filter(x=>ids.includes(x))}));return l}
let library;try{library=normalizeLibrary(JSON.parse(localStorage.getItem(LIB_KEY)||'null'))}catch{library=normalizeLibrary(null)}
function saveLibrary(){try{localStorage.setItem(LIB_KEY,JSON.stringify(library));return true}catch{toast('儲存空間不足，題庫變更尚未儲存。');return false}}
function isvName(id){return library.isvs.find(v=>v.id===id)?.name||id}
function isvColor(id){const i=library.isvs.findIndex(v=>v.id===id);return ISV_COLORS[(i<0?0:i)%ISV_COLORS.length]}
function isvChips(ids){return (ids||[]).map(id=>`<span class="isv-chip" style="--c:${isvColor(id)}">${esc(isvName(id))}</span>`).join('')}
function isvScope(ids){const n=(ids||[]).length,t=library.isvs.length;if(!n)return '<span class="scope scope-none">未指定 ISV</span>';if(n===t)return `<span class="scope scope-all">${t} 家 ISV 共同</span>`;if(n===1)return `<span class="scope scope-one">僅 ${esc(isvName(ids[0]))}</span>`;return `<span class="scope scope-some">${n} 家 ISV</span>`}
function qIsvIds(q){const l=library.questions.find(x=>x.id===q.libId);return l?l.isvIds:(q.isvIds||[])}
const CHATS={};
function chatNew(questions,preview){const c={q:questions,preview,idx:0,log:[],sel:[],answers:[],done:false};c.log.push({f:'bot',t:'嗨，我是 AIA。花不到一分鐘，聊聊你對「'+(state.event.name||'這場活動')+'」的感受。'});chatAsk(c);return c}
function chatAsk(c){const q=c.q[c.idx];if(!q){c.done=true;c.log.push({f:'bot',t:'目前沒有題目。'});return}c.sel=[];c.log.push({f:'bot',t:`(${c.idx+1}/${c.q.length}) ${q.title}${q.required?'':'（可略過）'}`})}
function chatSurvey(questions=state.questions,preview=false){const k=preview?'preview':state.id+'@'+state.surveyVersion;if(preview||!CHATS[k])CHATS[k]=chatNew(copy(questions),preview);return `<div class="aia-chat" id="aiaChat" data-k="${esc(k)}">${chatInner(k)}</div>`}
function chatInner(k){const c=CHATS[k],q=c.q[c.idx];const kk=esc(k);let ctl='';
 if(c.done)ctl=`<div class="aia-actions"><button type="button" onclick="chatRestart('${kk}')">${c.preview?'重新預覽':'再填寫一次'}</button></div>`;
 else if(q){if(q.type==='rating')ctl=`<div class="aia-chips">${[1,2,3,4,5].map(v=>`<button type="button" onclick="chatAnswer('${kk}','${v}')">${v} 分</button>`).join('')}</div>`;
  else if(q.type==='single')ctl=`<div class="aia-chips">${q.options.map((o,i)=>`<button type="button" onclick="chatAnswer('${kk}',${i})">${esc(o)}</button>`).join('')}</div>`;
  else if(q.type==='multi')ctl=`<div class="aia-chips">${q.options.map((o,i)=>`<button type="button" aria-pressed="${c.sel.includes(i)}" class="${c.sel.includes(i)?'on':''}" onclick="chatToggle('${kk}',${i})">${esc(o)}</button>`).join('')}</div><div class="aia-actions"><button type="button" class="primary" onclick="chatAnswer('${kk}')">確認選擇</button></div>`;
  else ctl=`<div class="aia-text"><textarea id="aiaText" maxlength="2000" aria-label="${esc(q.title)}" placeholder="輸入你的想法"></textarea><button type="button" class="primary" onclick="chatAnswer('${kk}')">送出</button></div>`;
  if(!q.required)ctl+=`<div class="aia-actions"><button type="button" class="aia-skip" onclick="chatAnswer('${kk}',null,true)">略過這題</button></div>`}
 return `<div class="aia-head"><span class="aia-avatar" aria-hidden="true">A</span><div><b>AIA</b><small>現場問卷助理${c.preview?' · 預覽，不會送出':''}</small></div></div><div class="aia-log" role="log" aria-live="polite">${c.log.map(m=>`<div class="aia-msg ${m.f}">${esc(m.t)}</div>`).join('')}</div><div class="aia-input">${ctl}</div>`}
function chatPaint(k){const box=document.getElementById('aiaChat');if(!box||!CHATS[k])return;box.innerHTML=chatInner(k);const l=box.querySelector('.aia-log');if(l)l.scrollTop=l.scrollHeight}
function chatToggle(k,i){const c=CHATS[k];if(!c)return;const p=c.sel.indexOf(i);p<0?c.sel.push(i):c.sel.splice(p,1);chatPaint(k)}
function chatRestart(k){const c=CHATS[k];if(!c)return;CHATS[k]=chatNew(c.q,c.preview);chatPaint(k)}
function chatAnswer(k,arg,skip=false){const c=CHATS[k];if(!c||c.done)return;const q=c.q[c.idx];if(!q)return;if(!c.preview&&!state.surveyOpen){toast('問卷已停止填答');return}
 let value,shown;
 if(skip){value=q.type==='multi'?[]:'';shown='略過'}
 else if(q.type==='rating'){value=String(arg);shown=value+' 分'}
 else if(q.type==='single'){value=q.options[arg];shown=value}
 else if(q.type==='multi'){value=c.sel.slice().sort((a,b)=>a-b).map(i=>q.options[i]);shown=value.join('、')}
 else{value=(document.getElementById('aiaText')?.value||'').trim();shown=value}
 if(!skip&&q.required&&(!value||(Array.isArray(value)&&!value.length))){toast('這題為必填');return}
 if(!skip&&!value)shown='（未填寫）';
 c.log.push({f:'user',t:shown||'（未填寫）'});c.answers.push({id:q.id,title:q.title,type:q.type,value,isvIds:q.isvIds||[]});c.idx++;
 if(c.idx<c.q.length)chatAsk(c);
 else{c.done=true;if(c.preview)c.log.push({f:'bot',t:'以上就是全部題目。預覽模式不會儲存回覆。'});else{state.responses.push({date:timestamp(),version:state.surveyVersion,mode:'chat',answers:c.answers});if(save())c.log.push({f:'bot',t:'謝謝你的回饋，已收到你的回覆。'});else c.log.push({f:'bot',t:'儲存失敗，請稍後再試。'})}}
 chatPaint(k)}
function surveyView(questions=state.questions,preview=false){return state.surveyMode==='chat'?chatSurvey(questions,preview):surveyForm(questions,preview)}
function csvDownload(rows,name){const cell=value=>'"'+String(value??'').replace(/^[=+@\-\t\r]/,"'$&").replace(/"/g,'""')+'"';const blob=new Blob(['\uFEFF'+rows.map(row=>row.map(cell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
let mediaDB;
function getMediaDB(){return mediaDB||=new Promise((resolve,reject)=>{const r=indexedDB.open('experthub-event-media',1);r.onupgradeneeded=()=>r.result.createObjectStore('files');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function storeMedia(id,file){const db=await getMediaDB();return new Promise((resolve,reject)=>{const tx=db.transaction('files','readwrite');tx.objectStore('files').put(file,id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
async function hydrateMedia(){try{await applySeed();const db=await getMediaDB();const banners=[],assets=[];for(const s of root.events){for(const e of [s.event,s.publishedRecap?.event,s.reviewRecap?.event]){if(e?.bannerId)banners.push({id:e.bannerId,name:e.bannerName});if(e?.cardImageId)banners.push({id:e.cardImageId,name:e.cardImageName})};assets.push(...s.assets,...(s.publishedRecap?.assets||[]),...(s.reviewRecap?.assets||[]))}for(const a of [...banners,...assets]){if(uploads.some(u=>u.id===a.id))continue;const file=await new Promise((resolve,reject)=>{const r=db.transaction('files').objectStore('files').get(a.id);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});if(file)uploads.push({...a,file,url:URL.createObjectURL(file)})}}catch{}}
function mediaURL(id){if(typeof id==='string'&&id.startsWith('static:'))return SITE_BASE+id.slice(7);return uploads.find(u=>u.id===id)?.url||''}
const RECAP_FACTS=[['time','活動時間'],['venue','活動地點'],['attendees','參與人數'],['responses','問卷蒐集數']];
function recapFactsShow(){return Object.assign({time:true,venue:true,attendees:true,responses:true},state.recapFacts||{})}
function recapFactsHTML(recap,event){const facts=recap.facts||{show:recapFactsShow(),attendees:state.registrations.length,responses:state.responses.length},show=Object.assign({time:true,venue:true,attendees:true,responses:true},facts.show||{});const value={time:`${dateLabel(event.date)}${event.start?'<br><small>'+esc(event.start)+' – '+esc(event.end)+' · Asia/Taipei</small>':''}`,venue:`${esc(event.venue)}<br><small>${esc(event.mode)}</small>`,attendees:`${esc(facts.attendees)}<small> 人</small>`,responses:`${esc(facts.responses)}<small> 份</small>`};const items=RECAP_FACTS.filter(([k])=>show[k]);return items.length?`<section class="recap-facts">${items.map(([k,l])=>`<div><span>${l}</span><b>${value[k]}</b></div>`).join('')}</section>`:''}
function snapshotDraft(){return {facts:{show:copy(recapFactsShow()),attendees:state.registrations.length,responses:state.responses.length},title:state.title,summary:state.summary,assets:copy(state.assets),coverId:state.coverId||state.assets.find(a=>a.type?.startsWith('image/'))?.id||'',theme:state.theme,event:copy(state.event)}}
function landingHTML(recap,{preview=false}={}){
  const photos=recap.assets.filter(a=>a.type?.startsWith('image/')),cover=photos.find(a=>a.id===recap.coverId)||photos[0],coverURL=cover&&mediaURL(cover.id),event=recap.event||state.event;
  const videos=recap.assets.filter(a=>a.type?.startsWith('video/')),slides=recap.assets.filter(a=>!a.type?.startsWith('image/')&&!a.type?.startsWith('video/'));
  return `<article class="recap-page ${recap.theme==='gallery'?'recap-gallery-theme':''}"><div class="recap-hero ${coverURL?'has-cover':''}">${coverURL?`<img class="recap-cover" src="${coverURL}" alt="${esc(cover.caption||event.name)}">`:''}<div class="recap-hero-text"><span class="recap-kicker">EXPERTHUB / EVENT RECAP${preview?' · 草稿預覽':''}</span><h1>${esc(recap.title)}</h1><p>${esc(event.name)} · ${esc(dateLabel(event.date))}</p><div class="recap-line"></div>${(recap.facts?.show||recapFactsShow()).venue!==false?`<span>${esc(event.venue)}　/　${esc(event.mode)}</span>`:''}</div></div>${recapFactsHTML(recap,event)}<section class="recap-intro"><div class="eyebrow">THE MOMENTS THAT MATTER</div><h2>把這次交流，留給下一個靈感。</h2><p>${esc(recap.summary)}</p></section>${photos.length?`<section class="recap-gallery"><div class="sectiontitle"><div><div class="eyebrow">IN THE MOMENT</div><h2>現場精彩片段</h2></div><span class="fine">${photos.length} PHOTOS</span></div><div class="photo-grid">${photos.map((a,i)=>{const url=mediaURL(a.id);return `<figure class="photo-tile ${i===0?'featured':''}">${url?`<img src="${url}" alt="${esc(a.caption||a.name)}" loading="lazy">`:`<div class="missing-media">此瀏覽器尚未載入這張照片<br>${esc(a.name)}</div>`}<figcaption><span>${String(i+1).padStart(2,'0')}</span>${esc(a.caption||a.name)}</figcaption></figure>`}).join('')}</div></section>`:''}${videos.length?`<section class="recap-resources"><div class="eyebrow">WATCH IT AGAIN</div><h2>再看一次，讓交流延續。</h2>${videos.map(a=>`<div class="recap-video"><h3>${esc(a.caption||a.name)}</h3>${mediaURL(a.id)?`<video controls preload="metadata" src="${mediaURL(a.id)}"></video>`:'<p class="fine">影片保存在上傳者的瀏覽器，請使用同一瀏覽器查看。</p>'}</div>`).join('')}</section>`:''}${slides.length?`<section class="recap-resources"><div class="eyebrow">TAKE IT WITH YOU</div><h2>活動簡報與延伸資料</h2>${slides.map(a=>`<div class="download-row"><div><b>${esc(a.caption||a.name)}</b><p class="fine">${esc(a.name)}</p></div>${mediaURL(a.id)?`<a class="download-link" href="${mediaURL(a.id)}" download="${esc(a.name)}">下載簡報 ↓</a>`:'<span class="fine">此瀏覽器無檔案</span>'}</div>`).join('')}</section>`:''}<footer class="recap-footer"><span>EXPERTHUB<br><small>CONNECTING EXPERTISE</small></span><p>從一次相聚，到持續累積的團隊知識。</p></footer></article>`;
}
function showDialog(title,html,wide=false){const d=document.createElement('dialog');d.className=wide?'landing-dialog':'';d.innerHTML=`<div class="dialog-bar"><b>${esc(title)}</b><button type="button" onclick="this.closest('dialog').close()">關閉</button></div>${html}`;document.body.append(d);d.addEventListener('close',()=>d.remove());d.showModal();return d}
function assetList(){return state.assets.length?state.assets.map(a=>`<div class="asset"><span>${esc(a.name)}</span><span class="fine">${(a.size/1024/1024).toFixed(1)} MB</span></div>`).join(''):'<div class="empty">尚未加入素材。</div>'}
window.addEventListener('storage',async e=>{if(e.key!==KEY)return;try{const next=JSON.parse(e.newValue);if(!next)return;root=normalizeRoot(next);pickEvent(activeId);await hydrateMedia();render()}catch{}});
