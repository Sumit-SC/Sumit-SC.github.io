// Theme switching (dark / light) and palette selector
(function(){
  const html = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const paletteSelect = document.getElementById('palette-select');

  const LS_KEY = 'sumit_theme';
  const LS_PALETTE = 'sumit_palette';

  function setDark(isDark){
    if(isDark) html.classList.add('dark'); else html.classList.remove('dark');
    localStorage.setItem(LS_KEY, isDark ? 'dark' : 'light');
  }

  function setPalette(p){
    html.setAttribute('data-theme', p);
    localStorage.setItem(LS_PALETTE, p);
  }

  // Init from localStorage or prefer system
  const saved = localStorage.getItem(LS_KEY);
  if(saved === 'dark') setDark(true);
  else if(saved === 'light') setDark(false);
  else setDark(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const savedPal = localStorage.getItem(LS_PALETTE) || 'indigo';
  if(paletteSelect) paletteSelect.value = savedPal;
  setPalette(savedPal);

  if(themeToggle){
    themeToggle.addEventListener('click', ()=>{
      const isDark = html.classList.contains('dark');
      setDark(!isDark);
      themeToggle.textContent = (!isDark) ? 'Light' : 'Dark';
    });
  }

  if(paletteSelect){
    paletteSelect.addEventListener('change', (e)=> setPalette(e.target.value));
  }
})();
