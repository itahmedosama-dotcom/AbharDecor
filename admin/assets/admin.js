const cfg=window.ABHAR_CONFIG||{};let projects=[];let credentials=null;let settings={};
const $=s=>document.querySelector(s);const status=$('#status'),list=$('#list');
const apiUrl=(action)=>cfg.API_URL?`${cfg.API_URL}?action=${encodeURIComponent(action)}&_=${Date.now()}`:'';
const defaults={whatsapp:cfg.WHATSAPP||'966503888992',whatsappDisplay:cfg.WHATSAPP_DISPLAY||'0503888992',whatsappMessage:cfg.WHATSAPP_MESSAGE||'',email:cfg.EMAIL||'info@abhar-decor.com',address:cfg.ADDRESS||'Ash Shulah, Dammam 7962',instagram:cfg.INSTAGRAM||'',facebook:cfg.FACEBOOK||'',tiktok:cfg.TIKTOK||'',snapchat:cfg.SNAPCHAT||'',x:cfg.X||'',googleMaps:cfg.GOOGLE_MAPS||''};
function driveImage(url){if(!url)return'';const m=String(url).match(/\/d\/([\w-]+)/)||String(url).match(/[?&]id=([\w-]+)/);return m?`https://drive.google.com/thumbnail?id=${m[1]}&sz=w400`:url}
function esc(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]))}
function showAdmin(){ $('#loginScreen').hidden=true;$('#adminShell').hidden=false;refresh() }
function showLogin(){ $('#adminShell').hidden=true;$('#loginScreen').hidden=false;$('#loginPassword').value='';$('#loginUsername').focus() }
async function verifyLogin(username,password){if(cfg.API_URL){const r=await fetch(cfg.API_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'login',username,password})});const j=await r.json();if(!j.ok)throw new Error(j.error||'بيانات الدخول غير صحيحة');return true}return username===(cfg.DEMO_ADMIN_USERNAME||'admin')&&password===(cfg.DEMO_ADMIN_PASSWORD||'Abhar@2026')}
$('#loginForm').onsubmit=async e=>{e.preventDefault();const username=$('#loginUsername').value.trim(),password=$('#loginPassword').value;$('#loginMsg').textContent='جاري التحقق...';try{if(!await verifyLogin(username,password))throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');credentials={username,password};sessionStorage.setItem('abhar_admin_session',JSON.stringify(credentials));$('#loginMsg').textContent='';showAdmin()}catch(err){$('#loginMsg').textContent=err.message}}
$('#logoutBtn').onclick=()=>{credentials=null;sessionStorage.removeItem('abhar_admin_session');showLogin()}
async function refresh(){
  projects=[];settings={...defaults};
  if(cfg.API_URL){
    try{
      const [rp,rs]=await Promise.all([fetch(apiUrl('list'),{cache:'no-store'}),fetch(apiUrl('settings'),{cache:'no-store'})]);
      const jp=await rp.json(),js=await rs.json();
      if(!jp.ok)throw new Error(jp.error||'تعذر تحميل المشاريع');
      if(!js.ok)throw new Error(js.error||'تعذر تحميل الإعدادات');
      projects=Array.isArray(jp.projects)?jp.projects:[];
      settings={...settings,...(js.settings||{})};
      $('#storageMode').textContent='Google Sheets';
      if(status){status.hidden=true;status.textContent='';}
    }catch(e){
      $('#storageMode').textContent='غير متصل';
      if(status){status.hidden=false;status.textContent='تعذر الاتصال بالخادم: '+e.message;}
    }
  }else{
    $('#storageMode').textContent='غير مربوط';
    if(status){status.hidden=false;status.textContent='يلزم إضافة رابط Google Apps Script داخل assets/js/config.js لحفظ التعديلات بشكل دائم.';}
  }
  draw();fillSettings();
}
function draw(){$('#projectCount').textContent=projects.length;const cats=[...new Set(projects.map(x=>x.category).filter(Boolean))];$('#categoryCount').textContent=cats.length;$('#catList').innerHTML=cats.map(c=>`<option value="${esc(c)}">`).join('');list.innerHTML=projects.length?projects.map((p,i)=>`<div class="project-row"><img src="${driveImage(p.image)}" alt=""><div><b>${esc(p.title)}</b><small>${esc(p.category)}</small><span>${esc(p.description||'')}</span></div><button class="delete" data-id="${esc(p.id||i)}">حذف</button></div>`).join(''):'<div class="empty">لا توجد مشاريع حتى الآن.</div>';list.querySelectorAll('.delete').forEach(b=>b.onclick=()=>removeProject(b.dataset.id))}
function fillSettings(){const map={setWhatsapp:'whatsapp',setWhatsappDisplay:'whatsappDisplay',setWhatsappMessage:'whatsappMessage',setEmail:'email',setAddress:'address',setInstagram:'instagram',setTiktok:'tiktok',setSnapchat:'snapchat',setFacebook:'facebook',setX:'x',setGoogleMaps:'googleMaps'};Object.entries(map).forEach(([id,key])=>{const el=$('#'+id);if(el)el.value=settings[key]||''})}
$('#projectForm').onsubmit=async e=>{e.preventDefault();if(!credentials)return showLogin();const title=$('#title').value.trim(),category=$('#category').value.trim(),description=$('#description').value.trim(),imageUrl=$('#imageUrl').value.trim();if(!imageUrl)return alert('ضع رابط الصورة المباشر');$('#progress').textContent='جاري الحفظ...';if(!cfg.API_URL){$('#progress').textContent='لا يمكن الحفظ الدائم قبل ربط Google Apps Script.';return}try{const payload={action:'add',...credentials,title,category,description,imageUrl};const r=await fetch(cfg.API_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)}),j=await r.json();if(!j.ok)throw new Error(j.error||'فشل الحفظ');e.target.reset();$('#progress').textContent='تم الحفظ على الخادم بنجاح.';await refresh()}catch(err){$('#progress').textContent='خطأ: '+err.message}}
$('#settingsForm').onsubmit=async e=>{e.preventDefault();if(!credentials)return showLogin();const data={whatsapp:$('#setWhatsapp').value.trim(),whatsappDisplay:$('#setWhatsappDisplay').value.trim(),whatsappMessage:$('#setWhatsappMessage').value.trim(),email:$('#setEmail').value.trim(),address:$('#setAddress').value.trim(),instagram:$('#setInstagram').value.trim(),tiktok:$('#setTiktok').value.trim(),snapchat:$('#setSnapchat').value.trim(),facebook:$('#setFacebook').value.trim(),x:$('#setX').value.trim(),googleMaps:$('#setGoogleMaps').value.trim()};$('#settingsProgress').textContent='جاري الحفظ...';if(!cfg.API_URL){$('#settingsProgress').textContent='لا يمكن الحفظ الدائم قبل ربط Google Apps Script.';return}try{const r=await fetch(cfg.API_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'saveSettings',...credentials,settings:data})}),j=await r.json();if(!j.ok)throw new Error(j.error||'فشل الحفظ');settings={...settings,...data};$('#settingsProgress').textContent='تم حفظ إعدادات الموقع على الخادم بنجاح.'}catch(err){$('#settingsProgress').textContent='خطأ: '+err.message}}
async function removeProject(id){if(!confirm('حذف هذا المشروع؟'))return;if(!credentials)return showLogin();if(!cfg.API_URL){alert('لا يمكن الحذف الدائم قبل ربط Google Apps Script.');return}try{const r=await fetch(cfg.API_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'delete',...credentials,id})}),j=await r.json();if(!j.ok)throw new Error(j.error||'تعذر الحذف');await refresh()}catch(e){alert(e.message)}}
$('#passwordForm').onsubmit=async e=>{
  e.preventDefault();
  if(!credentials)return showLogin();
  const current=$('#currentPassword').value,newPassword=$('#newPassword').value,confirmPassword=$('#confirmPassword').value;
  const out=$('#passwordProgress');
  if(current!==credentials.password){out.textContent='كلمة المرور الحالية غير صحيحة.';return}
  if(newPassword.length<8){out.textContent='كلمة المرور الجديدة يجب ألا تقل عن 8 أحرف.';return}
  if(newPassword!==confirmPassword){out.textContent='تأكيد كلمة المرور غير مطابق.';return}
  if(!cfg.API_URL){out.textContent='يلزم ربط Google Apps Script لتغيير كلمة المرور بشكل دائم.';return}
  out.textContent='جاري تغيير كلمة المرور...';
  try{
    const r=await fetch(cfg.API_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'changePassword',...credentials,newPassword})});
    const j=await r.json();
    if(!j.ok)throw new Error(j.error||'تعذر تغيير كلمة المرور');
    credentials={...credentials,password:newPassword};
    sessionStorage.setItem('abhar_admin_session',JSON.stringify(credentials));
    e.target.reset();out.textContent='تم تغيير كلمة المرور بنجاح.';
  }catch(err){out.textContent='خطأ: '+err.message}
};
$('#refresh').onclick=refresh;
try{const saved=JSON.parse(sessionStorage.getItem('abhar_admin_session')||'null');if(saved&&saved.username&&saved.password){credentials=saved;verifyLogin(saved.username,saved.password).then(ok=>ok?showAdmin():showLogin()).catch(()=>showLogin())}else showLogin()}catch(e){showLogin()}
