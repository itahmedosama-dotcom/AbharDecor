const cfg=window.ABHAR_CONFIG||{};
const defaultSettings={
  whatsapp:cfg.WHATSAPP||'966503888992',whatsappDisplay:cfg.WHATSAPP_DISPLAY||'0503888992',
  whatsappMessage:cfg.WHATSAPP_MESSAGE||'السلام عليكم، أتواصل معكم من خلال الموقع الإلكتروني لشركة إبهار الإعمار وأرغب في الاستفسار عن خدماتكم.',
  email:cfg.EMAIL||'info@abhar-decor.com',address:cfg.ADDRESS||'Ash Shulah, Dammam 7962',
  googleMaps:cfg.GOOGLE_MAPS||'https://www.google.com/maps?q=26.3445835,50.0911806&z=17&hl=ar',
  instagram:cfg.INSTAGRAM||'',facebook:cfg.FACEBOOK||'',tiktok:cfg.TIKTOK||'',snapchat:cfg.SNAPCHAT||'',x:cfg.X||'',
  metaPixelId:'',tiktokPixelId:'',snapPixelId:'',googleTagId:'',linkedinPartnerId:'',pinterestTagId:'',xPixelId:'',customHeadScript:'',customBodyScript:''
};
let siteSettings={...defaultSettings},projects=[],categories=[],serviceTypes=[],filtered=[],currentIndex=0,currentCategory='الكل',visibleCount=6;
const gallery=document.getElementById('gallery'),filters=document.getElementById('filters'),loadMore=document.getElementById('loadMore'),backCategories=document.getElementById('backCategories'),activeCategoryTitle=document.getElementById('activeCategoryTitle'),projectResults=document.getElementById('projectResults');
const escapeHtml=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
function driveImage(url){if(!url)return'';const m=String(url).match(/\/d\/([\w-]+)/)||String(url).match(/[?&]id=([\w-]+)/);return m?`https://drive.google.com/thumbnail?id=${m[1]}&sz=w1600`:url}
async function loadData(){
  if(cfg.API_URL){
    try{
      const stamp=Date.now();
      const [rp,rc,rs,rst]=await Promise.all([
        fetch(`${cfg.API_URL}?action=list&_=${stamp}`,{cache:'no-store'}),
        fetch(`${cfg.API_URL}?action=categories&_=${stamp}`,{cache:'no-store'}),
        fetch(`${cfg.API_URL}?action=settings&_=${stamp}`,{cache:'no-store'}),
        fetch(`${cfg.API_URL}?action=serviceTypes&_=${stamp}`,{cache:'no-store'})
      ]);
      const jp=await rp.json(),jc=await rc.json(),js=await rs.json(),jst=await rst.json();
      if(!jp.ok)throw new Error(jp.error||'Projects API error'); if(!jc.ok)throw new Error(jc.error||'Categories API error'); if(!js.ok)throw new Error(js.error||'Settings API error'); if(!jst.ok)throw new Error(jst.error||'Service types API error');
      projects=Array.isArray(jp.projects)?jp.projects:[]; categories=Array.isArray(jc.categories)?jc.categories:[]; serviceTypes=Array.isArray(jst.serviceTypes)?jst.serviceTypes:[]; siteSettings={...siteSettings,...(js.settings||{})};
    }catch(e){console.warn('Abhar API unavailable',e);projects=[];categories=[]}
  }
  buildCategoryCards();hideProjectResults();applySettings();renderServiceTypes();renderSocial();installTracking();
}

function renderServiceTypes(){const select=document.getElementById('qService');if(!select)return;const items=serviceTypes.filter(x=>x&&x.name);if(items.length)select.innerHTML=items.map(x=>`<option value="${escapeHtml(x.name)}">${escapeHtml(x.name)}</option>`).join('');}

function categoryCover(cat){const own=driveImage(cat.image||'');if(own)return own;const p=projects.find(x=>x.category===cat.name && x.image);return p?driveImage(p.image):'assets/images/logo.jpeg'}
function categoryCount(name){return projects.filter(x=>x.category===name).length}
function buildCategoryCards(){
  const usable=categories.filter(c=>c && c.name);
  const orphanNames=[...new Set(projects.map(p=>p.category).filter(Boolean))].filter(n=>!usable.some(c=>c.name===n));
  const allCats=[...usable,...orphanNames.map(name=>({id:'legacy-'+name,name,description:'',image:''}))];
  if(!allCats.length && !projects.length){filters.innerHTML='<div class="empty">لا توجد تصنيفات أو مشاريع حتى الآن.</div>';return}
  const allCard=projects.length?`<button class="category-card category-all" data-cat="الكل" aria-label="عرض كل الأعمال"><span class="category-card-icon">✦</span><div><b>كل الأعمال</b><small>${projects.length} مشروع</small></div></button>`:'';
  const categoryCards=allCats.map(c=>`<button class="category-card" data-cat="${escapeHtml(c.name)}"><img src="${categoryCover(c)}" alt="${escapeHtml(c.name)}"><span class="category-card-shade"></span><div class="category-card-copy"><b>${escapeHtml(c.name)}</b><small>${categoryCount(c.name)} مشروع</small></div></button>`).join('');
  filters.innerHTML=allCard+categoryCards;
  filters.querySelectorAll('.category-card').forEach(b=>b.addEventListener('click',()=>selectCategory(b.dataset.cat)));
}
function hideProjectResults(){
  currentCategory=''; filtered=[]; visibleCount=6;
  if(projectResults) projectResults.hidden=true;
  if(gallery) gallery.innerHTML='';
  if(loadMore) loadMore.hidden=true;
  filters.querySelectorAll('.category-card').forEach(x=>x.classList.remove('active'));
}
function categoryOrderMap(){const m={};categories.forEach((c,i)=>m[c.name]=Number(c.sortOrder||i+1));return m}
function projectOrder(p){return Number(p.sortOrder||9999)}
function selectCategory(cat){
  currentCategory=cat;visibleCount=6;
  filters.querySelectorAll('.category-card').forEach(x=>x.classList.toggle('active',x.dataset.cat===cat));
  const cm=categoryOrderMap();
  filtered=(cat==='الكل'?[...projects]:projects.filter(x=>x.category===cat)).sort((a,b)=>cat==='الكل'?((cm[a.category]??9999)-(cm[b.category]??9999)||projectOrder(a)-projectOrder(b)):projectOrder(a)-projectOrder(b));
  const meta=categories.find(c=>c.name===cat);
  const title=cat==='الكل'?'كل الأعمال':cat;
  const description=cat==='الكل'?`استعرض جميع مشاريعنا (${filtered.length})`:((meta&&meta.description)||`${filtered.length} مشروع في هذا التصنيف`);
  activeCategoryTitle.innerHTML=`<b>${escapeHtml(title)}</b><span>${escapeHtml(description)}</span>`;
  backCategories.hidden=false;
  if(projectResults) projectResults.hidden=false;
  renderGallery();
  setTimeout(()=>projectResults&&projectResults.scrollIntoView({behavior:'smooth',block:'start'}),60);
}
function renderGallery(){
  const show=filtered.slice(0,visibleCount);
  gallery.innerHTML=show.length?show.map((p,i)=>`<article class="gallery-item" data-i="${i}"><div class="gallery-image"><img src="${driveImage(p.image)}" alt="${escapeHtml(p.title)}" loading="lazy"></div><div class="gallery-card-body"><span class="gallery-category">${escapeHtml(p.category||'مشروع')}</span><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.description||'')}</p><button type="button" class="gallery-view">عرض المشروع</button></div></article>`).join(''):'<div class="empty">لا توجد أعمال في هذا التصنيف حتى الآن.</div>';
  gallery.querySelectorAll('.gallery-item').forEach(el=>el.addEventListener('click',()=>openLightbox(+el.dataset.i)));
  loadMore.hidden=visibleCount>=filtered.length;
}
loadMore.onclick=()=>{visibleCount+=6;renderGallery()};
backCategories.onclick=()=>{hideProjectResults();filters.scrollIntoView({behavior:'smooth',block:'center'})};
const lightbox=document.getElementById('lightbox');function openLightbox(i){currentIndex=i;const p=filtered[i];if(!p)return;document.getElementById('lightboxImg').src=driveImage(p.image);document.getElementById('lightboxTitle').textContent=p.title||'';document.getElementById('lightboxCategory').textContent=p.category||'';document.getElementById('lightboxDescription').textContent=p.description||'';lightbox.showModal()}
document.getElementById('lightboxClose').onclick=()=>lightbox.close();document.getElementById('prevImg').onclick=()=>openLightbox((currentIndex-1+filtered.length)%filtered.length);document.getElementById('nextImg').onclick=()=>openLightbox((currentIndex+1)%filtered.length);lightbox.addEventListener('click',e=>{if(e.target===lightbox)lightbox.close()});
const menuBtn=document.getElementById('menuBtn'),navLinks=document.getElementById('navLinks');menuBtn.onclick=()=>navLinks.classList.toggle('open');navLinks.querySelectorAll('a').forEach(a=>a.onclick=()=>navLinks.classList.remove('open'));
const toTop=document.getElementById('toTop');window.addEventListener('scroll',()=>toTop.classList.toggle('show',scrollY>500));toTop.onclick=()=>scrollTo({top:0,behavior:'smooth'});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});document.querySelectorAll('.reveal').forEach(x=>io.observe(x));
function waNumber(){return String(siteSettings.whatsapp||defaultSettings.whatsapp).replace(/\D/g,'')} function waUrl(text){return`https://wa.me/${waNumber()}?text=${encodeURIComponent(text)}`}
function applySettings(){const msg=siteSettings.whatsappMessage||defaultSettings.whatsappMessage;const waButton=document.getElementById('waButton');if(waButton)waButton.href=waUrl(msg);const footerWhatsapp=document.getElementById('footerWhatsapp');if(footerWhatsapp){footerWhatsapp.href=waUrl(msg);footerWhatsapp.textContent=siteSettings.whatsappDisplay||siteSettings.whatsapp||'0503888992'}const email=document.getElementById('footerEmail');if(email){email.href='mailto:'+(siteSettings.email||defaultSettings.email);email.textContent=siteSettings.email||defaultSettings.email}const address=document.getElementById('footerAddress');if(address)address.textContent=siteSettings.address||defaultSettings.address}
const socialIcons={instagram:'<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle class="fill" cx="17.4" cy="6.7" r="1.1"/></svg>',facebook:'<svg viewBox="0 0 24 24"><path class="fill" d="M13.6 22v-9h3l.5-3.5h-3.5V7.3c0-1 .3-1.7 1.8-1.7h1.9V2.5c-.3 0-1.5-.1-2.8-.1-2.8 0-4.8 1.7-4.8 4.9v2.2H6.5V13h3.2v9h3.9z"/></svg>',tiktok:'<svg viewBox="0 0 24 24"><path class="fill" d="M15.7 2c.3 2.3 1.6 3.7 3.8 3.9v3.2c-1.3.1-2.5-.3-3.7-1v6.5c0 4.1-4.5 6.6-8 4.5-3.8-2.3-3-8.5 1.4-9.4.8-.2 1.5-.1 2.3 0v3.4c-.4-.1-.8-.2-1.2-.1-1.7.2-2.5 2.2-1.5 3.5 1.3 1.7 3.8.8 3.8-1.3V2h3.1z"/></svg>',snapchat:'<svg viewBox="0 0 24 24"><path class="fill" d="M12 3.1c-2.6 0-4.3 2-4.3 4.7 0 .7.1 1.5 0 2.2-.2.5-1 .8-1.6 1-.7.3-1 .6-.9 1 .1.5.8.8 1.8 1.1.2.1.3.2.3.4.2.6-.9 1.6-1.3 2.1-.3.4-.3.8.1 1 .4.2 1.1.3 1.8.5.4.1.6.5.8.9.3.5.7.7 1.2.5.7-.3 1.4-.5 2.1-.5s1.4.2 2.1.5c.5.2.9 0 1.2-.5.2-.4.4-.8.8-.9.7-.2 1.4-.3 1.8-.5.4-.2.4-.6.1-1-.4-.5-1.5-1.5-1.3-2.1.1-.2.2-.3.3-.4 1-.3 1.7-.6 1.8-1.1.1-.4-.2-.7-.9-1-.6-.2-1.4-.5-1.6-1-.1-.7 0-1.5 0-2.2 0-2.7-1.7-4.7-4.3-4.7z"/></svg>',x:'<svg viewBox="0 0 24 24"><path class="fill" d="M18.6 2H22l-7.4 8.5L23.3 22h-6.8l-5.3-7-6.1 7H1.7l7.9-9.1L1.3 2h7l4.8 6.4L18.6 2zm-1.2 18h1.9L7.3 3.9h-2L17.4 20z"/></svg>',googleMaps:'<svg viewBox="0 0 24 24"><path class="fill" d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/></svg>'};
function renderSocial(){const grid=document.getElementById('socialGrid');if(!grid)return;const items=[['instagram','Instagram','زيارة الحساب',siteSettings.instagram],['tiktok','TikTok','زيارة الحساب',siteSettings.tiktok],['snapchat','Snapchat','زيارة الحساب',siteSettings.snapchat],['facebook','Facebook','زيارة الصفحة',siteSettings.facebook],['x','X / Twitter','زيارة الحساب',siteSettings.x],['googleMaps','Google Maps','زيارة الموقع',siteSettings.googleMaps]].filter(x=>x[3]);grid.innerHTML=items.map(([key,name,caption,url])=>`<a class="social-card social-${key}" href="${escapeHtml(url)}" target="_blank" rel="noopener"><span class="social-icon">${socialIcons[key]}</span><strong>${name}</strong><span>${caption}</span></a>`).join('');if(!items.length)document.getElementById('social').style.display='none'}
document.getElementById('quoteForm').addEventListener('submit',e=>{e.preventDefault();const name=document.getElementById('qName').value,phone=document.getElementById('qPhone').value,service=document.getElementById('qService').value,details=document.getElementById('qDetails').value;const text=`السلام عليكم، أتواصل معكم من خلال الموقع الإلكتروني لشركة إبهار الإعمار وأرغب في طلب عرض سعر.\n\nالاسم: ${name}\nرقم التواصل: ${phone}\nنوع العمل: ${service}\nالتفاصيل: ${details}`;window.open(waUrl(text),'_blank','noopener')});
loadData();


let trackingInstalled=false;
function addExternalScript(src,attrs={}){if(!src)return;const key='abhar-track-'+btoa(unescape(encodeURIComponent(src))).replace(/[^a-z0-9]/gi,'').slice(0,24);if(document.getElementById(key))return;const el=document.createElement('script');el.id=key;el.async=true;el.src=src;Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));document.head.appendChild(el)}
function addInlineScript(code,target=document.head){if(!code||!String(code).trim())return;const el=document.createElement('script');el.text=String(code);target.appendChild(el)}
function executeSnippet(snippet,target){if(!snippet||!String(snippet).trim())return;const tpl=document.createElement('template');tpl.innerHTML=String(snippet).trim();[...tpl.content.childNodes].forEach(node=>{if(node.nodeType===1&&node.tagName==='SCRIPT'){const s=document.createElement('script');[...node.attributes].forEach(a=>s.setAttribute(a.name,a.value));if(node.src)s.src=node.src;else s.text=node.textContent||'';target.appendChild(s)}else target.appendChild(node.cloneNode(true))})}
function installTracking(){if(trackingInstalled)return;trackingInstalled=true;const st=siteSettings||{};
  const meta=String(st.metaPixelId||'').trim();if(meta){!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',meta);fbq('track','PageView')}
  const tt=String(st.tiktokPixelId||'').trim();if(tt){!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie','holdConsent','revokeConsent','grantConsent'];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat([].slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var r='https://analytics.tiktok.com/i18n/pixel/events.js';ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement('script');o.type='text/javascript';o.async=!0;o.src=r+'?sdkid='+e+'&lib='+t;var a=document.getElementsByTagName('script')[0];a.parentNode.insertBefore(o,a)};ttq.load(tt);ttq.page()}(window,document,'ttq')}
  const snap=String(st.snapPixelId||'').trim();if(snap){(function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function(){a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};a.queue=[];var s='script',r=t.createElement(s);r.async=!0;r.src=n;var u=t.getElementsByTagName(s)[0];u.parentNode.insertBefore(r,u)})(window,document,'https://sc-static.net/scevent.min.js');snaptr('init',snap,{});snaptr('track','PAGE_VIEW')}
  const g=String(st.googleTagId||'').trim();if(g){addExternalScript('https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(g));window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config',g)}
  const li=String(st.linkedinPartnerId||'').trim();if(li){window._linkedin_partner_id=li;window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];window._linkedin_data_partner_ids.push(li);addInlineScript("(function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};window.lintrk.q=[]}var s=document.getElementsByTagName('script')[0];var b=document.createElement('script');b.type='text/javascript';b.async=true;b.src='https://snap.licdn.com/li.lms-analytics/insight.min.js';s.parentNode.insertBefore(b,s);})(window.lintrk);")}
  const pin=String(st.pinterestTagId||'').trim();if(pin){!function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var n=window.pintrk;n.queue=[];n.version='3.0';var t=document.createElement('script');t.async=!0;t.src=e;var r=document.getElementsByTagName('script')[0];r.parentNode.insertBefore(t,r)}}('https://s.pinimg.com/ct/core.js');pintrk('load',pin);pintrk('page')}
  const xp=String(st.xPixelId||'').trim();if(xp){!function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments)},s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');twq('config',xp)}
  executeSnippet(st.customHeadScript,document.head);executeSnippet(st.customBodyScript,document.body)
}

