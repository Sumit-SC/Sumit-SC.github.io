const DATA_PATH = '/data/projects.json';
const REPO_FULL = 'Sumit-SC/Sumit-SC.github.io';
const REPO_ID = '742705089'; // numeric repo id auto-filled
const GISCUS_CATEGORY = 'Project Comments';
const GISCUS_CATEGORY_ID_PLACEHOLDER = 'CATEGORY_ID_PLACEHOLDER';

async function loadJSON(){
  try{
    const res = await fetch(DATA_PATH, {cache: 'no-store'});
    if(!res.ok) throw new Error('Fetch failed');
    return await res.json();
  }catch(e){
    const el = document.getElementById('projects-json-fallback');
    if(el){
      try{return JSON.parse(el.textContent);
      }catch(err){console.error('Fallback JSON parse error', err)}
    }
    console.error('Could not load projects.json', e);
    return [];
  }
}

function slugify(text){
  return text.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
}

function makeCard(project){
  const div = document.createElement('div');
  div.className = 'card';
  const title = document.createElement('h3'); title.textContent = project.title;
  const p = document.createElement('p'); p.textContent = project.short_description;
  const tags = document.createElement('div'); tags.className = 'tags';
  (project.tools||[]).slice(0,5).forEach(t=>{const sp=document.createElement('span');sp.className='tag';sp.textContent=t;tags.appendChild(sp)});
  const btn = document.createElement('a'); btn.className='view-btn'; btn.textContent='View Project';
  btn.href = '/project.html?id=' + encodeURIComponent(project.id || slugify(project.title));
  div.appendChild(title); div.appendChild(p); div.appendChild(tags); div.appendChild(btn);
  return div;
}

async function renderFeatured(){
  const data = await loadJSON();
  const target = document.getElementById('featured'); if(!target) return;
  const featured = data.filter(p=>p.featured).slice(0,4);
  if(!featured.length) featured.push(...data.slice(0,4));
  featured.forEach(p=>target.appendChild(makeCard(p)));
}

async function renderProjectsGrid(){
  const data = await loadJSON();
  const target = document.getElementById('projects-grid'); if(!target) return;

  // simple tag filter UI
  const allTags = new Set(); data.forEach(p => (p.tools||[]).forEach(t=>allTags.add(t)));
  if(allTags.size){
    const filterRow = document.createElement('div'); filterRow.style.marginBottom='12px';
    const search = document.createElement('input'); search.type='search'; search.placeholder='Search projects'; search.style.padding='8px'; search.style.marginRight='8px';
    filterRow.appendChild(search);
    Array.from(allTags).slice(0,12).forEach(t=>{const b=document.createElement('button');b.className='tag';b.textContent=t; b.style.border='1px solid rgba(15,23,42,0.04)'; b.style.background='transparent'; b.style.cursor='pointer'; b.onclick=()=>{const q=search.value.trim().toLowerCase(); search.value = (q? q + ' ' + t : t); renderFiltered();}; filterRow.appendChild(b)});
    target.parentNode.insertBefore(filterRow, target);

    search.addEventListener('input', () => renderFiltered());

    function renderFiltered(){
      const q = search.value.trim().toLowerCase();
      target.innerHTML = '';
      data.filter(p => {
        if(!q) return true;
        return (p.title + ' ' + p.short_description + ' ' + (p.tools||[]).join(' ')).toLowerCase().includes(q);
      }).forEach(p=> target.appendChild(makeCard(p)));
    }
  }

  data.forEach(p=>{
    const c = makeCard(p);
    target.appendChild(c);
  })
}

function removeExistingGiscus(){
  const container = document.getElementById('giscus-container');
  if(!container) return;
  container.innerHTML = '';
}

function injectGiscus(projectId){
  const container = document.getElementById('giscus-container');
  if(!container) return;
  removeExistingGiscus();
  const script = document.createElement('script');
  script.src = 'https://giscus.app/client.js';
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.setAttribute('data-repo', REPO_FULL);
  script.setAttribute('data-repo-id', REPO_ID);
  script.setAttribute('data-category', GISCUS_CATEGORY);
  script.setAttribute('data-category-id', GISCUS_CATEGORY_ID_PLACEHOLDER);
  script.setAttribute('data-mapping', 'specific');
  script.setAttribute('data-term', projectId);
  script.setAttribute('data-reactions-enabled', '1');
  script.setAttribute('data-emit-metadata', '0');
  script.setAttribute('data-theme', 'light');
  container.appendChild(script);
}

function renderAnonForm(projectId){
  const container = document.getElementById('anon-container');
  if(!container) return;
  container.innerHTML = '';
  const form = document.createElement('form'); form.id = 'anon-form'; form.className='card';
  form.innerHTML = `
    <label style="display:block;margin-bottom:8px">Name (optional)</label>
    <input name="name" type="text" placeholder="Your name" style="width:100%;padding:8px;margin-bottom:8px" />
    <label style="display:block;margin-bottom:8px">Comment</label>
    <textarea name="comment" rows="4" placeholder="Write your feedback..." style="width:100%;padding:8px"></textarea>
    <div style="margin-top:8px;display:flex;gap:8px;align-items:center">
      <button type="submit" class="btn">Post anonymously</button>
      <button type="button" id="anon-clear" class="btn btn-outline">Clear local</button>
    </div>
    <div id="anon-result" style="margin-top:8px"></div>
    <div style="margin-top:12px"><strong>Local comments</strong></div>
    <div id="anon-comments-list" style="margin-top:8px"></div>
  `;

  container.appendChild(form);

  const key = 'anon_comments_' + projectId;
  const listEl = form.querySelector('#anon-comments-list');

  function loadLocal(){
    const raw = localStorage.getItem(key);
    if(!raw) return [];
    try{return JSON.parse(raw)||[];}catch(e){return []}
  }
  function saveLocal(arr){ localStorage.setItem(key, JSON.stringify(arr)); }
  function renderList(){
    const arr = loadLocal();
    listEl.innerHTML='';
    if(!arr.length){ listEl.innerHTML = '<div class="small-muted">No local anonymous posts yet.</div>'; return; }
    arr.slice().reverse().forEach(c=>{
      const d = document.createElement('div'); d.className='card'; d.style.marginBottom='8px'; d.innerHTML = `<div style="font-weight:600">${escapeHtml(c.name||'Anonymous')}</div><div class="small-muted" style="margin-top:6px">${escapeHtml(c.text)}</div><div class="small-muted" style="margin-top:6px;font-size:12px">${new Date(c.date).toLocaleString()}</div>`;
      listEl.appendChild(d);
    });
  }

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const fm = new FormData(form);
    const name = fm.get('name');
    const comment = fm.get('comment');
    if(!comment || comment.toString().trim().length < 3){
      form.querySelector('#anon-result').textContent = 'Please write a longer comment.'; return;
    }
    const arr = loadLocal();
    arr.push({name:name||'Anonymous', text:comment, date: new Date().toISOString()});
    saveLocal(arr);
    renderList();
    form.querySelector('#anon-result').textContent = 'Saved locally. To receive these by email, set the FormSubmit address in the contact page.';
    form.reset();
  });

  form.querySelector('#anon-clear').addEventListener('click', ()=>{ if(confirm('Clear local anonymous posts for this project?')){ localStorage.removeItem(key); renderList(); }});

  renderList();
}

function escapeHtml(unsafe) {
  return (unsafe||'').toString().replace(/[&<"'`=\/]/g, function (s) {
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;",'`':'&#96;','=':'&#61;','/':'&#47;'})[s];
  });
}

function renderCommentToggle(projectId){
  const root = document.getElementById('comment-toggle-root'); if(!root) return;
  root.innerHTML = '';
  const toggleGroup = document.createElement('div'); toggleGroup.style.display='flex'; toggleGroup.style.gap='8px';
  const gbtn = document.createElement('button'); gbtn.className='btn'; gbtn.textContent='GitHub (Giscus)';
  const abtn = document.createElement('button'); abtn.className='btn btn-outline'; abtn.textContent='Post anonymously';
  const bbtn = document.createElement('button'); bbtn.className='btn btn-outline'; bbtn.textContent='Show both';
  toggleGroup.appendChild(gbtn); toggleGroup.appendChild(abtn); toggleGroup.appendChild(bbtn);
  root.appendChild(toggleGroup);

  gbtn.addEventListener('click', ()=>{ document.getElementById('giscus-container').style.display='block'; document.getElementById('anon-container').style.display='none'; document.getElementById('anon-note').style.display='none'; });
  abtn.addEventListener('click', ()=>{ document.getElementById('giscus-container').style.display='none'; document.getElementById('anon-container').style.display='block'; document.getElementById('anon-note').style.display='block'; });
  bbtn.addEventListener('click', ()=>{ document.getElementById('giscus-container').style.display='block'; document.getElementById('anon-container').style.display='block'; document.getElementById('anon-note').style.display='block'; });

  // default to Giscus first
  injectGiscus(projectId);
  document.getElementById('giscus-container').style.display='block';
  renderAnonForm(projectId);
}

async function renderProjectDetail(){
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const data = await loadJSON();
  const root = document.getElementById('project-root'); if(!root) return;
  const project = data.find(p => p.id === id) || data.find(p => (p.slug && p.slug===id) ) || data[0];
  if(!project){ root.innerHTML = '<p>Project not found.</p>'; return; }
  document.title = project.title + ' — Sumit';
  const header = document.createElement('div'); header.className='card';
  const h = document.createElement('h1'); h.textContent = project.title; const sub = document.createElement('div'); sub.className='small-muted'; sub.textContent = project.short_description;
  header.appendChild(h); header.appendChild(sub);
  const overview = document.createElement('div'); overview.className='card'; overview.innerHTML = `<h3>Overview</h3><p>${project.full_description}</p>`;
  const problem = document.createElement('div'); problem.className='card'; problem.innerHTML = `<h3>Problem statement</h3><p>${project.problem_statement || '—'}</p>`;
  const approach = document.createElement('div'); approach.className='card'; approach.innerHTML = `<h3>Approach & methodology</h3><p>${project.approach || '—'}</p>`;
  const outcomes = document.createElement('div'); outcomes.className='card'; outcomes.innerHTML = `<h3>Key insights & outcomes</h3><p>${project.outcomes || '—'}</p>`;
  const tools = document.createElement('div'); tools.className='card'; tools.innerHTML = `<h3>Tools & stack</h3>`;
  (project.tools||[]).forEach(t=>{const s=document.createElement('span');s.className='tag';s.textContent=t;tools.appendChild(s)});

  root.appendChild(header);
  const mediaWrap = document.createElement('div'); mediaWrap.className='project-media';
  const left = document.createElement('div'); const right = document.createElement('div');
  left.appendChild(overview); left.appendChild(problem); left.appendChild(approach); left.appendChild(outcomes); left.appendChild(tools);
  embedMedia(right, project);
  mediaWrap.appendChild(left); mediaWrap.appendChild(right);
  root.appendChild(mediaWrap);

  // links
  const links = document.createElement('div'); links.className='card'; links.innerHTML = '<h3>Links</h3>';
  if(project.github_repo_link){ const a=document.createElement('a'); a.href=project.github_repo_link; a.target='_blank'; a.rel='noopener'; a.textContent='View code on GitHub'; a.className='view-btn'; links.appendChild(a) }
  root.appendChild(links);

  // initialize comment area
  const projectId = project.id || slugify(project.title);
  renderCommentToggle(projectId);
}

function embedMedia(container, project){
  if(project.images && project.images.length){
    const gallery = document.createElement('div'); gallery.className='card';
    project.images.forEach(src=>{
      const img = document.createElement('img'); img.src = src; img.alt='Project image'; img.style.width='100%'; img.style.marginBottom='8px'; img.style.borderRadius='8px';
      gallery.appendChild(img);
    });
    container.appendChild(gallery);
  }
  if(project.video_url){
    const vcard = document.createElement('div'); vcard.className='card';
    if(project.video_url.includes('youtube')){
      const iframe = document.createElement('iframe'); iframe.src = project.video_url.replace('watch?v=','embed/'); iframe.width='100%'; iframe.height='360'; iframe.style.border='0'; iframe.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'; iframe.allowFullscreen=true; vcard.appendChild(iframe);
    }else{
      const video = document.createElement('video'); video.controls=true; video.src=project.video_url; video.style.width='100%'; vcard.appendChild(video);
    }
    container.appendChild(vcard);
  }
  if(project.streamlit_url){
    const card = document.createElement('div'); card.className='card';
    const iframe = document.createElement('iframe'); iframe.src = project.streamlit_url + (project.streamlit_url.includes('?')? '&':'?') + 'embed=true'; iframe.width='100%'; iframe.height='600'; iframe.style.border='0'; card.appendChild(iframe); container.appendChild(card);
  }
  if(project.powerbi_embed_url){
    const card = document.createElement('div'); card.className='card';
    const iframe = document.createElement('iframe'); iframe.src = project.powerbi_embed_url; iframe.width='100%'; iframe.height='600'; iframe.style.border='0'; card.appendChild(iframe); container.appendChild(card);
  }else if(project.pbix_download_path){
    const dl = document.createElement('a'); dl.className='btn'; dl.href=project.pbix_download_path; dl.textContent='Download PBIX'; dl.style.marginTop='12px'; container.appendChild(dl);
  }
  if(project.slide_pdf_path){
    const card = document.createElement('div'); card.className='card';
    const iframe = document.createElement('iframe'); iframe.src = project.slide_pdf_path; iframe.width='100%'; iframe.height='500'; iframe.style.border='0'; card.appendChild(iframe); container.appendChild(card);
  }
}

// Auto-run on pages
if(typeof document !== 'undefined'){
  document.addEventListener('DOMContentLoaded', ()=>{
    if(document.getElementById('featured')) renderFeatured();
    if(document.getElementById('projects-grid')) renderProjectsGrid();
    if(document.getElementById('project-root')) renderProjectDetail();
  });
}

export {};
