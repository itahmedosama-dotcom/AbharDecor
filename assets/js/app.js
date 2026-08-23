const cfg=window.ABHAR_CONFIG||{};
const fallbackProjects=[
  {id:'sample1',title:'ديكورات داخلية كاملة',category:'ديكور متكامل',description:'حلول متكاملة لتجديد منزلك أو مكتبك بأفضل الخامات.',image:'assets/images/logo.jpeg'},
  {id:'sample2',title:'بديل خشب للجدران',category:'بديل الخشب',description:'تصميم عصري مقاوم للرطوبة وسهل التركيب ومناسب للمجالس والغرف.',image:'assets/images/logo.jpeg'},
  {id:'sample3',title:'عزل الصوت',category:'عزل وتشطيبات',description:'توفير راحة وهدوء داخل المجالس والغرف مع تصميم أنيق وعصري.',image:'assets/images/logo.jpeg'}
];
const defaultSettings={
  whatsapp:cfg.WHATSAPP||'966503888992',
  whatsappDisplay:cfg.WHATSAPP_DISPLAY||'0503888992',
  whatsappMessage:cfg.WHATSAPP_MESSAGE||'السلام عليكم، أتواصل معكم من خلال الموقع الإلكتروني لشركة إبهار الإعمار وأرغب في الاستفسار عن خدماتكم.',
  email:cfg.EMAIL||'info@abhar-decor.com',
  address:cfg.ADDRESS||'Ash Shulah, Dammam 7962',
  googleMaps:cfg.GOOGLE_MAPS||'https://www.google.com/maps?q=26.3445835,50.0911806&z=17&hl=ar',
  instagram:cfg.INSTAGRAM||'',facebook:cfg.FACEBOOK||'',tiktok:cfg.TIKTOK||'',snapchat:cfg.SNAPCHAT||'',x:cfg.X||''
};
let siteSettings={...defaultSettings};
let projects=[];let filtered=[];let currentIndex=0;
const gallery=document.getElementById('gallery'),filters=document.getElementById('filters');
const escapeHtml=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
function driveImage(url){if(!url)return'';const m=String(url).match(/\/d\/([\w-]+)/)||String(url).match(/[?&]id=([\w-]+)/);return m?`https://drive.google.com/thumbnail?id=${m[1]}&sz=w1600`:url}
async function loadData(){
  let apiLoaded=false;
  if(cfg.API_URL){
    try{
      const stamp=Date.now();
      const [rp,rs]=await Promise.all([
        fetch(`${cfg.API_URL}?action=list&_=${stamp}`,{cache:'no-store'}),
        fetch(`${cfg.API_URL}?action=settings&_=${stamp}`,{cache:'no-store'})
      ]);
      const jp=await rp.json(),js=await rs.json();
      if(!jp.ok)throw new Error(jp.error||'Projects API error');
      if(!js.ok)throw new Error(js.error||'Settings API error');
      projects=Array.isArray(jp.projects)?jp.projects:[];
      siteSettings={...siteSettings,...(js.settings||{})};
      apiLoaded=true;
    }catch(e){console.warn('Abhar API unavailable',e)}
  }
  if(!cfg.API_URL){projects=fallbackProjects;}
  else if(!apiLoaded){projects=[];}
  buildFilters();render('الكل');applySettings();renderSocial();
}
function buildFilters(){const cats=[...new Set(projects.map(x=>x.category).filter(Boolean))];filters.innerHTML='<button class="filter active" data-cat="الكل">الكل</button>'+cats.map(c=>`<button class="filter" data-cat="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join('');filters.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>{filters.querySelectorAll('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');render(b.dataset.cat)}))}
function render(cat){filtered=cat==='الكل'?projects:projects.filter(x=>x.category===cat);gallery.innerHTML=filtered.length?filtered.map((p,i)=>`<article class="gallery-item" data-i="${i}"><div class="gallery-image"><img src="${driveImage(p.image)}" alt="${escapeHtml(p.title)}" loading="lazy"></div><div class="gallery-card-body"><span class="gallery-category">${escapeHtml(p.category||'مشروع')}</span><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.description||'')}</p><button type="button" class="gallery-view">عرض المشروع</button></div></article>`).join(''):'<div class="empty">لا توجد أعمال في هذا التصنيف حتى الآن.</div>';gallery.querySelectorAll('.gallery-item').forEach(el=>el.addEventListener('click',()=>openLightbox(+el.dataset.i)))}
const lightbox=document.getElementById('lightbox');function openLightbox(i){currentIndex=i;const p=filtered[i];document.getElementById('lightboxImg').src=driveImage(p.image);document.getElementById('lightboxTitle').textContent=p.title||'';document.getElementById('lightboxCategory').textContent=p.category||'';document.getElementById('lightboxDescription').textContent=p.description||'';lightbox.showModal()}
document.getElementById('lightboxClose').onclick=()=>lightbox.close();document.getElementById('prevImg').onclick=()=>openLightbox((currentIndex-1+filtered.length)%filtered.length);document.getElementById('nextImg').onclick=()=>openLightbox((currentIndex+1)%filtered.length);lightbox.addEventListener('click',e=>{if(e.target===lightbox)lightbox.close()});
const menuBtn=document.getElementById('menuBtn'),navLinks=document.getElementById('navLinks');menuBtn.onclick=()=>navLinks.classList.toggle('open');navLinks.querySelectorAll('a').forEach(a=>a.onclick=()=>navLinks.classList.remove('open'));
const toTop=document.getElementById('toTop');window.addEventListener('scroll',()=>toTop.classList.toggle('show',scrollY>500));toTop.onclick=()=>scrollTo({top:0,behavior:'smooth'});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});document.querySelectorAll('.reveal').forEach(x=>io.observe(x));
function waNumber(){return String(siteSettings.whatsapp||defaultSettings.whatsapp).replace(/\D/g,'')}
function waUrl(text){return`https://wa.me/${waNumber()}?text=${encodeURIComponent(text)}`}
function applySettings(){
  const msg=siteSettings.whatsappMessage||defaultSettings.whatsappMessage;
  const waButton=document.getElementById('waButton');if(waButton)waButton.href=waUrl(msg);
  const footerWhatsapp=document.getElementById('footerWhatsapp');if(footerWhatsapp){footerWhatsapp.href=waUrl(msg);footerWhatsapp.textContent=siteSettings.whatsappDisplay||siteSettings.whatsapp||'0503888992'}
  const email=document.getElementById('footerEmail');if(email){email.href='mailto:'+(siteSettings.email||defaultSettings.email);email.textContent=siteSettings.email||defaultSettings.email}
  const address=document.getElementById('footerAddress');if(address)address.textContent=siteSettings.address||defaultSettings.address;
}
const socialIcons={
  instagram:'<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle class="fill" cx="17.4" cy="6.7" r="1.1"/></svg>',
  facebook:'<svg viewBox="0 0 24 24"><path class="fill" d="M13.6 22v-9h3l.5-3.5h-3.5V7.3c0-1 .3-1.7 1.8-1.7h1.9V2.5c-.3 0-1.5-.1-2.8-.1-2.8 0-4.8 1.7-4.8 4.9v2.2H6.5V13h3.2v9h3.9z"/></svg>',
  tiktok:'<svg viewBox="0 0 24 24"><path class="fill" d="M15.7 2c.3 2.3 1.6 3.7 3.8 3.9v3.2c-1.3.1-2.5-.3-3.7-1v6.5c0 4.1-4.5 6.6-8 4.5-3.8-2.3-3-8.5 1.4-9.4.8-.2 1.5-.1 2.3 0v3.4c-.4-.1-.8-.2-1.2-.1-1.7.2-2.5 2.2-1.5 3.5 1.3 1.7 3.8.8 3.8-1.3V2h3.1z"/></svg>',
  snapchat:'<svg viewBox="0 0 24 24"><path class="fill" d="M12 3.1c-2.6 0-4.3 2-4.3 4.7 0 .7.1 1.5 0 2.2-.2.5-1 .8-1.6 1-.7.3-1 .6-.9 1 .1.5.8.8 1.8 1.1.2.1.3.2.3.4.2.6-.9 1.6-1.3 2.1-.3.4-.3.8.1 1 .4.2 1.1.3 1.8.5.4.1.6.5.8.9.3.5.7.7 1.2.5.7-.3 1.4-.5 2.1-.5s1.4.2 2.1.5c.5.2.9 0 1.2-.5.2-.4.4-.8.8-.9.7-.2 1.4-.3 1.8-.5.4-.2.4-.6.1-1-.4-.5-1.5-1.5-1.3-2.1.1-.2.2-.3.3-.4 1-.3 1.7-.6 1.8-1.1.1-.4-.2-.7-.9-1-.6-.2-1.4-.5-1.6-1-.1-.7 0-1.5 0-2.2 0-2.7-1.7-4.7-4.3-4.7z"/></svg>',
  x:'<svg viewBox="0 0 24 24"><path class="fill" d="M18.6 2H22l-7.4 8.5L23.3 22h-6.8l-5.3-7-6.1 7H1.7l7.9-9.1L1.3 2h7l4.8 6.4L18.6 2zm-1.2 18h1.9L7.3 3.9h-2L17.4 20z"/></svg>',
  googleMaps:'<svg viewBox="0 0 24 24"><path class="fill" d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/></svg>'
};
function renderSocial(){
  const grid=document.getElementById('socialGrid');if(!grid)return;
  const items=[
    ['instagram','Instagram','زيارة الحساب',siteSettings.instagram],['tiktok','TikTok','زيارة الحساب',siteSettings.tiktok],['snapchat','Snapchat','زيارة الحساب',siteSettings.snapchat],['facebook','Facebook','زيارة الصفحة',siteSettings.facebook],['x','X / Twitter','زيارة الحساب',siteSettings.x],['googleMaps','Google Maps','زيارة الموقع',siteSettings.googleMaps]
  ].filter(x=>x[3]);
  grid.innerHTML=items.map(([key,name,caption,url])=>`<a class="social-card social-${key}" href="${escapeHtml(url)}" target="_blank" rel="noopener"><span class="social-icon">${socialIcons[key]}</span><strong>${name}</strong><span>${caption}</span></a>`).join('');
  if(!items.length)document.getElementById('social').style.display='none';
}
document.getElementById('quoteForm').addEventListener('submit',e=>{e.preventDefault();const name=document.getElementById('qName').value,phone=document.getElementById('qPhone').value,service=document.getElementById('qService').value,details=document.getElementById('qDetails').value;const text=`السلام عليكم، أتواصل معكم من خلال الموقع الإلكتروني لشركة إبهار الإعمار وأرغب في طلب عرض سعر.\n\nالاسم: ${name}\nرقم التواصل: ${phone}\nنوع العمل: ${service}\nالتفاصيل: ${details}`;window.open(waUrl(text),'_blank','noopener')});
loadData();
