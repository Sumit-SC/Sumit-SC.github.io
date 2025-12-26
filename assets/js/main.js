const DATA_PATH = '/data/projects.json';

async function loadJSON(){
  try{
    const res = await fetch(DATA_PATH, {cache: 'no-store'});
    if(!res.ok) throw new Error('Fetch failed');
    return await res.json();
  }catch(e){
    // If fetch fails (e.g. file://), attempt to load a fallback embedded JSON element
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
  const featured = data.slice(0,4);
  featured.forEach(p=>target.appendChild(makeCard(p)));
}

async function renderProjectsGrid(){
  const data = await loadJSON();
  const target = document.getElementById('projects-grid'); if(!target) return;
  data.forEach(p=>{
    const c = makeCard(p);
    target.appendChild(c);
  })
}

function embedMedia(container, project){
  // images gallery
  if(project.images && project.images.length){
    const gallery = document.createElement('div');
    gallery.className='card';
    project.images.forEach(src=>{
      const img = document.createElement('img'); img.src = src; img.alt='Project image'; img.style.width='100%'; img.style.marginBottom='8px'; img.style.borderRadius='8px';
      gallery.appendChild(img);
    });
    container.appendChild(gallery);
  }
  // video
  if(project.video_url){
    const vcard = document.createElement('div'); vcard.className='card';
    if(project.video_url.includes('youtube')){
      const iframe = document.createElement('iframe'); iframe.src = project.video_url.replace('watch?v=','embed/'); iframe.width='100%'; iframe.height='360'; iframe.style.border='0'; iframe.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'; iframe.allowFullscreen=true; vcard.appendChild(iframe);
    }else{
      const video = document.createElement('video'); video.controls=true; video.src=project.video_url; video.style.width='100%'; vcard.appendChild(video);
    }
    container.appendChild(vcard);
  }
  // streamlit
  if(project.streamlit_url){
    const card = document.createElement('div'); card.className='card';
    const iframe = document.createElement('iframe'); iframe.src = project.streamlit_url + (project.streamlit_url.includes('?')? '&':'?') + 'embed=true'; iframe.width='100%'; iframe.height='600'; iframe.style.border='0'; card.appendChild(iframe); container.appendChild(card);
  }
  // powerbi
  if(project.powerbi_embed_url){
    const card = document.createElement('div'); card.className='card';
    const iframe = document.createElement('iframe'); iframe.src = project.powerbi_embed_url; iframe.width='100%'; iframe.height='600'; iframe.style.border='0'; card.appendChild(iframe); container.appendChild(card);
  }else if(project.pbix_download_path){
    const dl = document.createElement('a'); dl.className='btn'; dl.href=project.pbix_download_path; dl.textContent='Download PBIX'; dl.style.marginTop='12px'; container.appendChild(dl);
  }
  // slides
  if(project.slide_pdf_path){
    const card = document.createElement('div'); card.className='card';
    const iframe = document.createElement('iframe'); iframe.src = project.slide_pdf_path; iframe.width='100%'; iframe.height='500'; iframe.style.border='0'; card.appendChild(iframe); container.appendChild(card);
  }
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
}

// Auto-run on pages
document.addEventListener('DOMContentLoaded', ()=>{
  if(document.getElementById('featured')) renderFeatured();
  if(document.getElementById('projects-grid')) renderProjectsGrid();
  if(document.getElementById('project-root')) renderProjectDetail();
});

export {};
