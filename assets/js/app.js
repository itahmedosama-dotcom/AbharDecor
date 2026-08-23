const cfg=window.ABHAR_CONFIG||{};
const fallbackProjects=[
  {id:'sample1',title:'مشروع ديكور داخلي',category:'ديكور متكامل',description:'نموذج توضيحي لمعرض الأعمال. أضف صورك من لوحة الإدارة.',image:'assets/images/logo.jpeg'},
  {id:'sample2',title:'تشطيبات وكسوات',category:'بديل الرخام',description:'يمكن ربط المعرض مباشرة مع Google Drive عبر Apps Script المرفق.',image:'assets/images/logo.jpeg'},
  {id:'sample3',title:'أعمال داخلية',category:'أعمال خشبية',description:'الصورة الحالية مؤقتة حتى رفع صور المشاريع الفعلية.',image:'assets/images/logo.jpeg'}
];
let projects=[];let filtered=[];let currentIndex=0;
const gallery=document.getElementById('gallery'),filters=document.getElementById('filters');
const escapeHtml=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
function driveImage(url){if(!url)return'';const m=String(url).match(/\/d\/([\w-]+)/)||String(url).match(/[?&]id=([\w-]+)/);return m?`https://drive.google.com/thumbnail?id=${m[1]}&sz=w1600`:url}
async function loadProjects(){
  if(cfg.API_URL){try{const r=await fetch(cfg.API_URL+'?action=list',{cache:'no-store'});const j=await r.json();if(j.ok&&Array.isArray(j.projects))projects=j.projects}catch(e){console.warn('API unavailable',e)}}
  if(!projects.length){const local=JSON.parse(localStorage.getItem('abhar_projects')||'[]');projects=local.length?local:fallbackProjects}
  buildFilters();render('الكل');
}
function buildFilters(){const cats=[...new Set(projects.map(x=>x.category).filter(Boolean))];filters.innerHTML='<button class="filter active" data-cat="الكل">الكل</button>'+cats.map(c=>`<button class="filter" data-cat="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join('');filters.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>{filters.querySelectorAll('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');render(b.dataset.cat)}))}
function render(cat){filtered=cat==='الكل'?projects:projects.filter(x=>x.category===cat);gallery.innerHTML=filtered.length?filtered.map((p,i)=>`<article class="gallery-item" data-i="${i}"><img src="${driveImage(p.image)}" alt="${escapeHtml(p.title)}" loading="lazy"><div class="gallery-overlay"><b>${escapeHtml(p.title)}</b><br><small>${escapeHtml(p.category||'')}</small></div></article>`).join(''):'<div class="empty">لا توجد أعمال في هذا التصنيف حتى الآن.</div>';gallery.querySelectorAll('.gallery-item').forEach(el=>el.addEventListener('click',()=>openLightbox(+el.dataset.i)))}
const lightbox=document.getElementById('lightbox');function openLightbox(i){currentIndex=i;const p=filtered[i];document.getElementById('lightboxImg').src=driveImage(p.image);document.getElementById('lightboxTitle').textContent=p.title||'';document.getElementById('lightboxCategory').textContent=p.category||'';document.getElementById('lightboxDescription').textContent=p.description||'';lightbox.showModal()}
document.getElementById('lightboxClose').onclick=()=>lightbox.close();document.getElementById('prevImg').onclick=()=>openLightbox((currentIndex-1+filtered.length)%filtered.length);document.getElementById('nextImg').onclick=()=>openLightbox((currentIndex+1)%filtered.length);lightbox.addEventListener('click',e=>{if(e.target===lightbox)lightbox.close()});
const menuBtn=document.getElementById('menuBtn'),navLinks=document.getElementById('navLinks');menuBtn.onclick=()=>navLinks.classList.toggle('open');navLinks.querySelectorAll('a').forEach(a=>a.onclick=()=>navLinks.classList.remove('open'));
const toTop=document.getElementById('toTop');window.addEventListener('scroll',()=>toTop.classList.toggle('show',scrollY>500));toTop.onclick=()=>scrollTo({top:0,behavior:'smooth'});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});document.querySelectorAll('.reveal').forEach(x=>io.observe(x));
const waNumber=String(cfg.WHATSAPP||'966503888992').replace(/\D/g,'');
const defaultWaMessage=cfg.WHATSAPP_MESSAGE||'السلام عليكم، أتواصل معكم من خلال الموقع الإلكتروني لشركة إبهار الإعمار وأرغب في الاستفسار عن خدماتكم.';
const waUrl=text=>`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
document.getElementById('quoteForm').addEventListener('submit',e=>{e.preventDefault();const name=document.getElementById('qName').value,phone=document.getElementById('qPhone').value,service=document.getElementById('qService').value,details=document.getElementById('qDetails').value;const text=`السلام عليكم، أتواصل معكم من خلال الموقع الإلكتروني لشركة إبهار الإعمار وأرغب في طلب عرض سعر.\n\nالاسم: ${name}\nرقم التواصل: ${phone}\nنوع العمل: ${service}\nالتفاصيل: ${details}`;window.open(waUrl(text),'_blank','noopener')});
const waButton=document.getElementById('waButton');waButton.href=waUrl(defaultWaMessage);const footerWhatsapp=document.getElementById('footerWhatsapp');if(footerWhatsapp)footerWhatsapp.href=waUrl(defaultWaMessage);
loadProjects();
