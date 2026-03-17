// ── CONSTANTS ────────────────────────────────────────────────
const LANG_C={JavaScript:'#f0c040',TypeScript:'#4a9ef0',Python:'#4a90d0',Go:'#40c8d0',Rust:'#d07040',Ruby:'#d04060',Java:'#d0a040','C++':'#d04080',C:'#8090a0','C#':'#7060d0',PHP:'#8060b0',Swift:'#f07040',Kotlin:'#9060d0',Vue:'#40b080',HTML:'#d06040',CSS:'#4060d0',Shell:'#60b060',default:'#7eb8d4'};
const LC=l=>l&&LANG_C[l]?LANG_C[l]:LANG_C.default;
const SUN_PALETTE=['#f5d080','#f0a060','#a0d8f0','#f07890','#70d0b0','#b090f0','#f0c870','#60c8e0','#f08060','#90e0a0','#d0a0f0','#f0d060'];
const STAR_CHARS=['✦','★','✧','⋆','◎','◉'];
const FILE_ICONS={js:'⬡',ts:'◆',py:'◉',go:'▲',rs:'■',rb:'◇',java:'●',cpp:'▣',c:'○',cs:'◎',php:'△',swift:'◆',kt:'◉',vue:'⬡',html:'▲',css:'◎',md:'□',json:'·',yaml:'·',yml:'·',sh:'▲',txt:'□',png:'◈',jpg:'◈',svg:'◈',default:'·'};
const ficon=(n,isDir)=>getIcon(n,isDir);

// CORS proxies — tried in order, first success wins
const CORS_PROXIES=[
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?url=',
  'https://api.codetabs.com/v1/proxy?quest=',
];

// ── STATE ────────────────────────────────────────────────────
let mode='galaxy';
let galaxySource='main';
let stars=[];
let activeStar=null;
let focusedSun=null;
let contributors=[];
let hovered=null;
let userData=null;
let userRepos=[];
let creatorMode=false;
let goldenThemeUnlocked=localStorage.getItem('stellarmap_golden')==='1';
let paused=false;
let skipTrendingLoad=false;
let tick=0,af;
let creatorParticles=[];
let currentTheme='white';

// ── CAMERAS ──────────────────────────────────────────────────
let rotX=0.35,rotY=0,tRX=0.35,tRY=0;
let galScale=3.2,tGalScale=3.2; // pixels per world unit for galaxy
let _galOffX=0,_galOffY=0; // canvas translate offset when orbiting
let camWX=0,camWY=0,tCamWX=0,tCamWY=0;
let camScale=1,tCamScale=1;
let dragging=false,dragMoved=false,lastMX=0,lastMY=0,lastTouchDist=0;

// ── CANVAS ───────────────────────────────────────────────────
const canvas=document.getElementById('gc');
const ctx=canvas.getContext('2d');
let W=0,H=0;
function resize(){
  W=canvas.offsetWidth;H=canvas.offsetHeight;
  canvas.width=W*devicePixelRatio;canvas.height=H*devicePixelRatio;
  ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
}
resize();
window.addEventListener('resize',resize);

// ── UTILS ────────────────────────────────────────────────────
const $=id=>document.getElementById(id);
const setStatus=t=>$('status').textContent='▸ '+t;
function rot3(x,y,z,rx,ry){
  const cX=Math.cos(rx),sX=Math.sin(rx),cY=Math.cos(ry),sY=Math.sin(ry);
  const y1=y*cX-z*sX,z1=y*sX+z*cX;
  return[x*cY+z1*sY,y1,-x*sY+z1*cY];
}
function projGal(x,y,z){
  const[rx,ry,rz]=rot3(x,y,z,rotX,rotY);
  return{sx:W/2+rx*galScale,sy:H/2+ry*galScale,scale:galScale/6,rz};
}

// Returns screen offset needed to center the orbitTarget
function getOrbitOffset(){
  if(!orbitActive||!orbitTarget) return{ox:0,oy:0};
  const p=projGal(orbitTarget.x,orbitTarget.y,orbitTarget.z);
  return{ox:W/2-p.sx, oy:H/2-p.sy};
}
function w2s(wx,wy){return{sx:W/2+(wx-camWX)*camScale,sy:H/2+(wy-camWY)*camScale};}
function s2w(sx,sy){return{wx:(sx-W/2)/camScale+camWX,wy:(sy-H/2)/camScale+camWY};}
function cssVar(name){return getComputedStyle(document.body).getPropertyValue(name).trim();}

// ── THEME PALETTES ────────────────────────────────────────────
const THEME_PALETTES = {
  cyber: {
    suns:    ['#f5d080','#f0a060','#a0d8f0','#f07890','#70d0b0','#b090f0','#f0c870','#60c8e0','#f08060','#90e0a0','#d0a0f0','#f0d060'],
    planet:  '#7eb8d4', dir:'#5bc8f5', star:'#5bc8f5', trending:'#5bc8f5',
  },
  void: {
    suns:    ['#d0a0f8','#a070e0','#f080c0','#8060d8','#c080f0','#7050c8','#e090d0','#9060e0','#b070c0','#6040b0','#d0a0e8','#8050d0'],
    planet:  '#c0a0e8', dir:'#a078f5', star:'#c8a8f0', trending:'#a078f5',
  },
  ember: {
    suns:    ['#f8d060','#f07030','#f0a040','#e05020','#f8c050','#d04020','#f09040','#e06030','#f8b040','#c03010','#f0a060','#e07040'],
    planet:  '#e8c0a8', dir:'#f58040', star:'#f0a060', trending:'#f58040',
  },
  matrix: {
    suns:    ['#00ff41','#20e050','#40d060','#00c840','#60e020','#10d840','#00f030','#30c850','#20e840','#00d050','#50e030','#10c840'],
    planet:  '#90e8a0', dir:'#00ff41', star:'#40d070', trending:'#00ff41',
  },
  arctic: {
    suns:    ['#a0d8f8','#80b8f0','#c0e0f8','#60a0e8','#a0c8f8','#7090d0','#b0d0f0','#50a0e0','#90c0f0','#6080c8','#c0d8f8','#80a8e0'],
    planet:  '#c0d8f0', dir:'#80c8f8', star:'#a0d0f0', trending:'#80c8f8',
  },
  white: {
    suns:    ['#ff6b6b','#ffa94d','#51cf66','#339af0','#cc5de8','#f06595','#20c997','#f59f00','#4263eb','#94d82d','#e64980','#15aabf'],
    planet:  '#555566',
    dir:     '#339af0',
    star:    '#333344',
    trending:'#4263eb',
  },
  'creator-gold': {
    suns:    ['#ffd700','#ffa020','#ffdd40','#ff8800','#ffe060','#ffb030','#ffc840','#ff9010','#ffd040','#ffa030','#ffcc50','#ff8010'],
    planet:  '#ffe87c', dir:'#ffd700', star:'#ffd060', trending:'#ffd700',
  },
};
function getThemePalette(){
  if(creatorMode) return THEME_PALETTES['creator-gold'];
  const t=document.body.getAttribute('data-theme')||'cyber';
  return THEME_PALETTES[t]||THEME_PALETTES.cyber;
}

// ── ICON PACKS ────────────────────────────────────────────────
const ICON_PACKS = {
  geometric: {js:'⬡',ts:'◆',py:'◉',go:'▲',rs:'■',rb:'◇',java:'●',cpp:'▣',c:'○',cs:'◎',php:'△',swift:'◆',kt:'◉',vue:'⬡',html:'▲',css:'◎',md:'□',json:'·',yaml:'·',yml:'·',sh:'▲',txt:'□',png:'◈',jpg:'◈',svg:'◈',dir:'◈',default:'·'},
  ascii:     {js:'[J]',ts:'[T]',py:'[P]',go:'[G]',rs:'[R]',rb:'[rb]',java:'[J]',cpp:'[C]',c:'[c]',cs:'[#]',php:'[?]',swift:'[S]',kt:'[K]',vue:'[V]',html:'[H]',css:'[~]',md:'[M]',json:'{J}',yaml:'{Y}',yml:'{Y}',sh:'[>]',txt:'[T]',png:'[i]',jpg:'[i]',svg:'[v]',dir:'/D/',default:'[·]'},
  orbital:   {js:'⊙',ts:'⊕',py:'⊗',go:'⊛',rs:'⊘',rb:'⊚',java:'◍',cpp:'◌',c:'◎',cs:'◯',php:'◐',swift:'◑',kt:'◒',vue:'◓',html:'◔',css:'◕',md:'○',json:'·',yaml:'·',yml:'·',sh:'◉',txt:'○',png:'◍',jpg:'◍',svg:'◌',dir:'⊕',default:'·'},
  cyber:     {js:'⟨J⟩',ts:'⟨T⟩',py:'⟨P⟩',go:'⟨G⟩',rs:'⟨R⟩',rb:'⟨rb⟩',java:'⟨J⟩',cpp:'⟨C⟩',c:'⟨c⟩',cs:'⟨#⟩',php:'⟨?⟩',swift:'⟨S⟩',kt:'⟨K⟩',vue:'⟨V⟩',html:'⟨H⟩',css:'⟨~⟩',md:'⟨M⟩',json:'⟦J⟧',yaml:'⟦Y⟧',yml:'⟦Y⟧',sh:'⟨»⟩',txt:'⟨T⟩',png:'⟨+⟩',jpg:'⟨+⟩',svg:'⟨V⟩',dir:'⟦D⟧',default:'·'},
  minimal:   {js:'·',ts:'·',py:'·',go:'·',rs:'·',rb:'·',java:'·',cpp:'·',c:'·',cs:'·',php:'·',swift:'·',kt:'·',vue:'·',html:'·',css:'·',md:'·',json:'·',yaml:'·',yml:'·',sh:'·',txt:'·',png:'·',jpg:'·',svg:'·',dir:'○',default:'·'},
};
let currentIconPack=localStorage.getItem('stellarmap_iconpack')||'geometric';
function getIcon(filename,isDir){
  if(isDir) return ICON_PACKS[currentIconPack]?.dir||'◈';
  const ext=(filename||'').split('.').pop().toLowerCase();
  const pack=ICON_PACKS[currentIconPack]||ICON_PACKS.geometric;
  return pack[ext]||pack.default||'·';
}
function setIconPack(pack){
  currentIconPack=pack;
  localStorage.setItem('stellarmap_iconpack',pack);
  contributors.forEach(c=>{c.planets.forEach(p=>{p.char=getIcon(p.name,p.type==='dir');});});
  document.querySelectorAll('.icon-opt').forEach(el=>el.classList.toggle('selected',el.dataset.ip===pack));
}

// ── I18N ──────────────────────────────────────────────────────
// Languages are registered via langs/*.js files loaded in index.html.
// StellarLang registry (js/i18n.js) provides the API.

let currentLang = localStorage.getItem('stellarmap_lang') || 'en';
const T = () => StellarLang.get(currentLang);


function applyLang(){
  const t = T();
  const q = (id) => document.getElementById(id);
  const qs = (sel) => document.querySelector(sel);

  // Header
  const sub=q('subtitle'); if(sub) sub.textContent=t.subtitle;
  const ui=q('uinput'); if(ui) ui.placeholder=t.placeholder;
  const gb=q('gobtn'); if(gb) gb.textContent=t.scanBtn||t.scanBtn;
  // (lang button removed — language shown in settings panel)

  // Nav pills
  const tp=qs('.pill:first-child'); if(tp) tp.textContent=t.trendingPill;
  const put=q('pill-user-text'); if(put) put.textContent=t.userPill;

  // Status & pause
  const pb=q('pause-badge'); if(pb) pb.textContent=t.pauseBadge;

  // Creator badge
  const cb=q('creator-zone-badge'); if(cb) cb.textContent=t.crBadge;

  // Theme panel headers
  const tph=q('tp-theme-h'); if(tph) tph.textContent=t.themeSelectTitle;
  const iph=q('tp-icon-h'); if(iph) iph.textContent=t.iconPackTitle;
  const dh=q('tp-display-h'); if(dh) dh.textContent=t.displayTitle2;
  const tc=q('theme-close'); if(tc) tc.textContent=t.themeClose;
  // Theme names (by data-t attr)
  const thMap={cyber:t.tCyber,void:t.tVoid,ember:t.tEmber,matrix:t.tMatrix,arctic:t.tArctic,white:t.tWhite||'WHITE',creator:t.tGolden};
  document.querySelectorAll('.theme-opt[data-t] .theme-label').forEach(el=>{
    const dt=el.closest('[data-t]')?.dataset.t;
    if(dt&&thMap[dt]) el.textContent=thMap[dt];
  });
  // Creator locked suffix
  const lockedEl=qs('.theme-locked .theme-label');
  if(lockedEl&&!lockedEl.textContent.includes('✦')) lockedEl.textContent=thMap.creator;

  // Icon pack names
  const ipMap={geometric:t.ipGeometric,ascii:t.ipAscii,orbital:t.ipOrbital,cyber:t.ipCyber,minimal:t.ipMinimal};
  document.querySelectorAll('.icon-opt[data-ip] .theme-label').forEach(el=>{
    const dp=el.closest('[data-ip]')?.dataset.ip;
    if(dp&&ipMap[dp]) el.textContent=ipMap[dp];
  });

  // Rate banner
  const rt=q('rate-title'); if(rt) rt.textContent=t.rateLimit;
  const rgt=q('rate-get-token'); if(rgt) rgt.textContent=t.rateGetToken;
  const rib=q('rate-import-btn'); if(rib) rib.textContent=t.rateImport;
  const rtl=q('rate-token-label'); if(rtl) rtl.textContent=t.rateTokenLabel;
  const rab=q('rate-apply-btn'); if(rab) rab.textContent=t.rateApply;
  const rcb=q('rate-clear-btn'); if(rcb) rcb.textContent=t.rateClear;
  const tip=q('token-input'); if(tip) tip.placeholder=t.tokenRowPlaceholder;

  // Settings btn
  const sb=q('settings-btn'); if(sb) sb.textContent=t.settingsBtn||'⚙ SETTINGS';
  // Lang section
  const tlh=q('tp-lang-h'); if(tlh) tlh.textContent=t.langTitle||'◉ LANGUAGE';
  const rbl=q('tp-reset-lbl'); if(rbl) rbl.textContent=t.resetBtn||'RESET EVERYTHING';
  // Rebuild lang picker from registry (adds any newly loaded lang files automatically)
  StellarLang.buildLangPicker();
  // Splash (if still present)
  const stag=q('splash-tagline'); if(stag) stag.textContent=t.splashTagline;
  const lbl=document.getElementById('launch-label'); if(lbl) lbl.textContent=t.launchBtn||'LAUNCH SATELLITE';
  const ssb=qs('.splash-btn-secondary'); if(ssb) ssb.textContent=t.splashSearch;
  // splash search bar removed

  // ── INFO PANEL ────────────────────────────────────────────────
  const ibLbl=q('info-btn-lbl');        if(ibLbl)  ibLbl.textContent=t.infoBtnLbl||'INFO';
  const ipH=q('info-panel-h');          if(ipH)    ipH.textContent='ℹ '+(t.infoPanelH||'ABOUT STELLARMAP');
  const iwT=q('info-what-t');           if(iwT)    iwT.textContent=t.infoWhatT||'WHAT IS THIS?';
  const iwB=q('info-what-b');           if(iwB)    iwB.innerHTML=t.infoWhatB||'A 3D visualization of GitHub universes. Each <b>star</b> is a repo. Each <b>sun</b> is a contributor. Each <b>planet</b> is a file.';
  const inT=q('info-nav-t');            if(inT)    inT.textContent=t.infoNavT||'HOW TO NAVIGATE';
  const inB=q('info-nav-b');            if(inB)    inB.innerHTML=t.infoNavB||'<b>Drag</b> to rotate · <b>Scroll</b> to zoom · <b>Click</b> stars to enter · <b>Click</b> suns to dive deeper';
  const isT=q('info-sess-t');           if(isT)    isT.textContent=t.infoSessT||'CURRENT SESSION';
  const iaT=q('info-api-t');            if(iaT)    iaT.textContent=t.infoApiT||'API STATUS';
  const ibuT=q('info-built-t');         if(ibuT)   ibuT.textContent=t.infoBuiltT||'BUILT WITH';
  const ibuB=q('info-built-b');         if(ibuB)   ibuB.textContent=t.infoBuiltB||'GitHub REST API · Vanilla JS · Canvas 2D · No frameworks';
  // Refresh dynamic info panel content if it's open
  if(q('info-panel')?.classList.contains('open')) updateInfoPanel();

  // ── BOOKMARKS PANEL ───────────────────────────────────────────
  const bkBtnLbl=q('bookmarks-btn-lbl'); if(bkBtnLbl) bkBtnLbl.textContent=t.bkBtnLbl||'SAVED';
  const bkTitle=q('bk-title');           if(bkTitle)  bkTitle.textContent='☆ '+(t.bkTitle||'BOOKMARKS');

  // ── SHORTCUTS PANEL ───────────────────────────────────────────
  const scBtnLbl=q('shortcuts-btn-lbl'); if(scBtnLbl) scBtnLbl.textContent=t.scBtnLbl||'KEYS';
  const scTitle=q('sc-title');           if(scTitle)  scTitle.textContent='⌨ '+(t.scTitle||'SHORTCUTS');
  const scF=q('sc-f');     if(scF)     scF.textContent=t.scF||'search repos';
  const scB=q('sc-b');     if(scB)     scB.textContent=t.scB||'bookmarks';
  const scEsc=q('sc-esc'); if(scEsc)   scEsc.textContent=t.scEsc||'go back';
  const scSp=q('sc-space');if(scSp)    scSp.textContent=t.scSpace||'pause orbits';
  const scQ=q('sc-q');     if(scQ)     scQ.textContent=t.scQ||'shortcuts';
  const scH=q('sc-h');     if(scH)     scH.textContent=t.scH||'clear history';
  const scU=q('sc-u');     if(scU)     scU.textContent=t.scU||'copy share URL';
  const scC=q('sc-c');     if(scC)     scC.textContent=t.scC||'constellation lines';
  const scZ=q('sc-z');     if(scZ)     scZ.textContent=t.scZ||'zoom in';
  const scX=q('sc-x');     if(scX)     scX.textContent=t.scX||'zoom out';
  const scCl=q('sc-close');if(scCl)    scCl.textContent='✕ '+(t.scClose||'CLOSE');
}

// ── SPLASH ────────────────────────────────────────────────────
function initSplashParticles(){
  const c=document.getElementById('splash-particles');
  if(!c)return;
  const chars=['✦','◈','★','⋆','·','○'];
  for(let i=0;i<28;i++){
    const p=document.createElement('div');p.className='spart';
    p.textContent=chars[Math.floor(Math.random()*chars.length)];
    p.style.left=Math.random()*100+'%';p.style.top=(20+Math.random()*70)+'%';
    p.style.animationDelay=Math.random()*6+'s';p.style.animationDuration=(4+Math.random()*5)+'s';
    p.style.opacity='0';
    p.style.color=['#5bc8f5','#3a9bbf','#2d6480','#7eb8d4'][Math.floor(Math.random()*4)];
    c.appendChild(p);
  }
}
initSplashParticles();

function dismissSplash(){
  const sp=document.getElementById('splash');if(!sp)return;
  sp.classList.add('fade-out');setTimeout(()=>sp.remove(),650);
}
function launchSequence(){
  const btn   = document.getElementById('launch-btn');
  const label = document.getElementById('launch-label');
  const svg   = btn && btn.querySelector('.ship-svg');
  if(!btn || btn.classList.contains('launching')) return;
  btn.classList.add('launching');

  function after(ms, fn){ return new Promise(r=>setTimeout(()=>{fn();r();},ms)); }

  // STEP 1 (0→500ms): label fades out — button stays fully visible
  label.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
  label.style.opacity    = '0';
  label.style.transform  = 'translateY(-8px)';

  after(500, ()=>{
    // STEP 2 (500→1100ms): button border + bg fade away while ship stays put
    label.style.display = 'none';
    if(svg) svg.style.animation = 'none';
    btn.style.transition  = 'border-color 0.6s ease, background 0.6s ease, box-shadow 0.6s ease';
    btn.style.borderColor = 'transparent';
    btn.style.background  = 'transparent';
    btn.style.boxShadow   = 'none';
    // keep ship exactly where it is — just center it inside the dissolving button
    btn.style.display        = 'flex';
    btn.style.alignItems     = 'center';
    btn.style.justifyContent = 'center';
    if(svg){ svg.style.width='26px'; svg.style.height='26px'; }
  })
  .then(()=>after(700, ()=>{
    // STEP 3 (1200ms): ship rumbles in place inside the invisible button shell
    if(svg) svg.style.animation = 'shipRumble 0.12s linear infinite';
  }))
  .then(()=>after(900, ()=>{
    // STEP 4 (2100ms): snapshot ship screen position, then launch
    if(svg) svg.style.animation = 'none';

    // snapshot before any changes
    const svgRect = svg ? svg.getBoundingClientRect() : btn.getBoundingClientRect();
    const cx = svgRect.left + svgRect.width  / 2;
    const cy = svgRect.top  + svgRect.height / 2;

    // hide original button instantly (it's already transparent border/bg, just hide the svg)
    btn.style.opacity = '0';

    // place fixed clone at exact same screen position
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;';
    document.body.appendChild(overlay);

    const shipEl = document.createElement('div');
    shipEl.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;transform:translate(-50%,-50%);width:26px;height:26px;`;
    const svgClone = svg ? svg.cloneNode(true) : null;
    if(svgClone){ svgClone.style.width='26px'; svgClone.style.height='26px'; svgClone.style.animation='none'; shipEl.appendChild(svgClone); }
    overlay.appendChild(shipEl);

    // launch upward next frame
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      shipEl.style.transition = 'top 0.85s cubic-bezier(0.4,0,1,1), opacity 0.18s ease 0.68s';
      shipEl.style.top     = '-80px';
      shipEl.style.opacity = '0';
    }));
    setTimeout(()=>overlay.remove(), 1100);
  }))
  .then(()=>after(800, ()=>{
    dismissSplash();
    loadMainGalaxy();
  }));
}

function splashTrending(){launchSequence();}
function focusSplashSearch(){
  const bar=document.getElementById('splash-search');if(!bar)return;
  bar.style.display='flex';bar.style.opacity='0';bar.style.transform='translateY(10px)';
  bar.style.transition='opacity 0.3s ease,transform 0.3s ease';
  requestAnimationFrame(()=>requestAnimationFrame(()=>{bar.style.opacity='1';bar.style.transform='translateY(0)';}));
  setTimeout(()=>{const i=document.getElementById('splash-input');if(i)i.focus();},80);
}
function splashSearch(){
  const v=document.getElementById('splash-input')?.value.trim();if(!v)return;
  skipTrendingLoad = true;
  document.getElementById('uinput').value=v;dismissSplash();run();
}
function updateSplashTheme(t){
  const cols={cyber:'#5bc8f5',void:'#a078f5',ember:'#f58040',matrix:'#00ff41',arctic:'#80c8f8',white:'#333344',creator:'#ffd700'};
  const col=cols[t]||'#5bc8f5';const sp=document.getElementById('splash');if(!sp)return;
  sp.querySelectorAll('.spart').forEach(p=>{p.style.color=col;});
  const core=document.getElementById('splash-core');if(core)core.style.color=col;
  const logo=document.getElementById('splash-logo');
  if(logo){logo.style.color=col;logo.style.textShadow=`0 0 24px ${col}88`;}
  const pb=document.querySelector('.splash-btn-primary');if(pb){pb.style.borderColor=col;pb.style.color=col;}
}
document.getElementById('splash-input')?.addEventListener('keydown',e=>{if(e.key==='Enter')splashSearch();});

// ── THEME ─────────────────────────────────────────────────────
function unlockGoldenTheme(){
  const opt=document.querySelector('.theme-opt[data-t="creator"]');if(!opt)return;
  opt.classList.remove('theme-locked');
  opt.onclick=()=>setTheme('creator');
  opt.querySelector('.theme-label').textContent=T().creatorUnlocked;
}
// DOM is already parsed when app.js loads (script at end of body) — call directly
if(goldenThemeUnlocked) unlockGoldenTheme();
document.querySelectorAll('.icon-opt').forEach(el=>el.classList.toggle('selected',el.dataset.ip===currentIconPack));

function setTheme(t){
  if(creatorMode)return;
  const actualTheme=t==='creator'?'creator-gold':t;
  currentTheme=t;
  document.body.setAttribute('data-theme',actualTheme);
  document.querySelectorAll('.theme-opt').forEach(el=>el.classList.toggle('selected',el.dataset.t===t));
  updateSplashTheme(t);
  const pal=getThemePalette();
  contributors.forEach((c,i)=>{
    c.color=(pal.suns||SUN_PALETTE)[i%(pal.suns||SUN_PALETTE).length];
    c.planets.forEach(p=>{p.color=p.type==='dir'?pal.dir:pal.planet;});
  });
}
function toggleThemePanel(){$('theme-panel').classList.toggle('open');}
document.addEventListener('click',e=>{
  const tp=$('theme-panel'),sb=$('settings-btn');
  if(tp.classList.contains('open')&&!tp.contains(e.target)&&e.target!==sb)tp.classList.remove('open');
});


function setLang(l){
  currentLang = l;
  localStorage.setItem('stellarmap_lang', l);
  applyLang();
}

function resetEverything(){
  const t = T();
  const msg = t.resetConfirm || (currentLang==='es'
    ? '¿Borrar todos los ajustes guardados? (tema, idioma, token, iconos, desbloqueos)'
    : 'Delete all saved settings? (theme, language, token, icon pack, unlocks)');
  if(!confirm(msg)) return;
  // Wipe all localStorage keys
  ['stellarmap_lang','stellarmap_golden','stellarmap_iconpack','orbitview_token','stellarmap_history','stellarmap_bookmarks'].forEach(k=>localStorage.removeItem(k));
  searchHistory=[];bookmarks=[];renderHistory();renderBookmarks();
  // Reset in-memory state
  ghToken = null;
  currentLang = 'en';
  currentTheme = 'white';
  currentIconPack = 'geometric';
  goldenThemeUnlocked = false;
  creatorMode = false;
  // Restore DOM
  document.body.setAttribute('data-theme','white');
  document.body.classList.remove('creator','bright');
  // Re-lock golden theme
  const opt = document.querySelector('.theme-opt[data-t="creator"]');
  if(opt){
    opt.classList.add('theme-locked');
    opt.onclick = null;
    opt.querySelector('.theme-label').textContent = 'GOLDEN';
  }
  // Reset theme-btn visibility
  const sb = document.getElementById('settings-btn');
  if(sb) sb.style.removeProperty('display');
  applyLang();
  // Update icon pack selection
  document.querySelectorAll('.icon-opt').forEach(el=>el.classList.toggle('selected',el.dataset.ip==='geometric'));
  document.querySelectorAll('.theme-opt').forEach(el=>el.classList.toggle('selected',el.dataset.t==='cyber'));
  toggleThemePanel();
  setStatus(T().resetDone || (currentLang==='es'?'ajustes reiniciados':'settings reset'));
}



// ── TOKEN MANAGEMENT ─────────────────────────────────────────
let ghToken = localStorage.getItem('orbitview_token') || null;
let apiRemaining = null;
let apiLimit = 60;

function getAuthHeaders(){
  if(!ghToken)return{};
  return{'Authorization':'token '+ghToken};
}

async function ghFetchWithToken(url){
  const opts=ghToken?{headers:getAuthHeaders()}:{};
  const r=await fetch(url,opts);
  if(r.status===403||r.status===429){
    const j=await r.clone().json().catch(()=>({}));
    const msg=(j.message||'').toLowerCase();
    if(msg.includes('rate limit')||r.status===429){showRateLimit(r);throw new Error('rate_limit');}
    if(msg.includes('bad credential')||msg.includes('unauthorized')){
      ghToken=null;localStorage.removeItem('orbitview_token');
      $('token-status').textContent=T().rateBadCred;$('token-status').style.color='#ff7060';
      $('clear-token-btn').style.display='none';throw new Error('bad_token');
    }
  }
  const remaining=r.headers.get('x-ratelimit-remaining');
  const limit=r.headers.get('x-ratelimit-limit');
  if(remaining!==null){apiRemaining=parseInt(remaining);}
  if(limit!==null){apiLimit=parseInt(limit);}
  if(remaining!==null&&parseInt(remaining)===0)showRateLimit(r);
  return r;
}

async function ghFetch(url){return ghFetchWithToken(url);}

// ── RATE LIMIT DETECTION ──────────────────────────────────────
let rateLimitHit=false;

function showRateLimit(r){
  document.body.classList.add('rate-active');
  if(rateLimitHit)return;
  rateLimitHit=true;
  const banner=$('rate-banner');
  banner.style.display='block';
  const resetTs=r&&r.headers&&r.headers.get('x-ratelimit-reset');
  if(resetTs){
    const resetDate=new Date(parseInt(resetTs)*1000);
    const mins=Math.max(1,Math.round((resetDate-new Date())/60000));
    $('rate-reset-msg').textContent=`resets in ~${mins} min`;
  }
  setStatus(T().statusRate);
}

function resetRateLimit(){
  rateLimitHit=false;
  $('rate-banner').style.display='none';
  document.body.classList.remove('rate-active');
}

function toggleTokenInput(){
  const row=$('token-input-row');
  const isOpen=row.style.display==='flex';
  row.style.display=isOpen?'none':'flex';
  if(!isOpen){
    $('token-input').value=ghToken?'••••••••••••••••••••':'';
    $('token-status').textContent=ghToken?T().rateTokenActive('?'):'';
    $('token-status').style.color=ghToken?'#70e090':'#ff9070';
    $('clear-token-btn').style.display=ghToken?'inline-block':'none';
    setTimeout(()=>$('token-input').focus(),60);
    document.body.classList.add('rate-active-tall');
  } else {
    document.body.classList.remove('rate-active-tall');
  }
}

async function applyToken(){
  const raw=$('token-input').value.trim();
  if(!raw||raw.startsWith('•'))return;
  $('token-status').textContent=T().rateVerifying;$('token-status').style.color='#ffb090';
  try{
    const r=await fetch('https://api.github.com/rate_limit',{headers:{'Authorization':'token '+raw}});
    const j=await r.json();
    if(r.status===401||(j.message&&j.message.toLowerCase().includes('bad'))){
      $('token-status').textContent=T().rateInvalid;$('token-status').style.color='#ff7060';return;
    }
    ghToken=raw;localStorage.setItem('orbitview_token',raw);
    if(typeof j.rate?.remaining==='number'){apiRemaining=j.rate.remaining;}
    if(typeof j.rate?.limit==='number'){apiLimit=j.rate.limit;}
    const limit=j.rate?.limit||'?';const remaining2=j.rate?.remaining||'?';
    $('token-status').textContent=T().rateTokenActive(remaining2);$('token-status').style.color='#70e090';
    $('token-input').value='••••••••••••••••••••';
    $('clear-token-btn').style.display='inline-block';
    resetRateLimit();setStatus(T().rateApplied(remaining2));
  }catch(e){$('token-status').textContent=T().rateVerifyFail;$('token-status').style.color='#ff7060';}
}

function clearToken(){
  ghToken=null;localStorage.removeItem('orbitview_token');
  $('token-input').value='';$('token-status').textContent=T().rateCleared;
  $('token-status').style.color='#ff9070';$('clear-token-btn').style.display='none';
}

(function restoreToken(){if(ghToken)setStatus(T().statusToken);})();

// ── TRENDING DEVS (parse github/trending/developers via proxy) ──
async function fetchTrending(){
  const url='https://github.com/trending/developers';
  for(const proxy of CORS_PROXIES){
    try{
      const res=await fetch(proxy+encodeURIComponent(url),{
        signal:AbortSignal.timeout(10000),
        headers:{'User-Agent':'Mozilla/5.0 (compatible; Stellarmap/1.0)'}
      });
      if(!res.ok)continue;
      const html=await res.text();
      const logins=parseTrendingHTML(html);
      if(logins&&logins.length>=5)return logins;
    }catch(e){continue;}
  }
  return null; // all proxies failed — caller uses FALLBACK_USERS
}

function parseTrendingHTML(html){
  // Use the browser's DOMParser for reliable parsing — far more robust than regex.
  // GitHub /trending/developers renders server-side HTML with article.Box-row cards.
  const doc = new DOMParser().parseFromString(html,'text/html');
  const logins = new Set();

  // ── Strategy 1: article.Box-row (classic GitHub trending structure) ──────
  // Each developer card is <article class="Box-row d-flex ...">
  //   Inside: an <h1 class="h3"> or <h1 class="h3 lh-condensed"> with <a href="/username">
  doc.querySelectorAll('article').forEach(article=>{
    // Grab the first anchor whose href is a bare /username path
    const anchors=article.querySelectorAll('a[href]');
    for(const a of anchors){
      const href=(a.getAttribute('href')||'').trim();
      const m=href.match(/^\/([a-zA-Z0-9][a-zA-Z0-9\-]{0,38})$/);
      if(m&&!GITHUB_RESERVED.has(m[1].toLowerCase())){
        logins.add(m[1]);
        break; // first valid anchor per article = the username
      }
    }
    if(logins.size>=25)return;
  });

  // ── Strategy 2: hovercard data attributes ────────────────────────────────
  // GitHub attaches data-hovercard-url="/users/LOGIN" to user avatar/name links
  if(logins.size<5){
    doc.querySelectorAll('[data-hovercard-url]').forEach(el=>{
      const m=(el.getAttribute('data-hovercard-url')||'').match(/\/users\/([a-zA-Z0-9][a-zA-Z0-9\-]{0,38})/);
      if(m&&!GITHUB_RESERVED.has(m[1].toLowerCase())) logins.add(m[1]);
    });
  }

  // ── Strategy 3: fallback regex on raw HTML (last resort) ─────────────────
  if(logins.size<5){
    const re=/href="\/([a-zA-Z0-9][a-zA-Z0-9\-]{0,38})"[^>]*>\s*(?:<[^>]+>\s*)*[A-Z][a-z]/g;
    let m;
    while((m=re.exec(html))!==null){
      if(!GITHUB_RESERVED.has(m[1].toLowerCase())) logins.add(m[1]);
      if(logins.size>=25)break;
    }
  }

  return [...logins].slice(0,25);
}

// GitHub path segments that are never usernames
const GITHUB_RESERVED=new Set([
  'trending','features','pricing','about','login','logout','join','explore',
  'marketplace','pulls','issues','notifications','codespaces','settings',
  'orgs','organizations','new','import','gist','topics','collections',
  'events','sponsors','security','contact','blog','readme','wiki',
  'site','assets','static','github','microsoft','google','search',
  'enterprise','teams','apps','integrations','actions','packages',
  'discussions','commits','blob','tree','raw','compare','releases',
  'archive','tags','branches','graphs','network','pulse','stargazers',
  'watchers','forks','contributors','community','projects',
]);

// ── MAIN GALAXY ────────────────────────────────────────────────
const FALLBACK_USERS=['torvalds','gvanrossum','antirez','yyx990803','sindresorhus','tj','addyosmani','nicolo-ribaudo','nicksabers','mattdesl','mpj','wesbos','kentcdodds','ThePrimeagen','thecodebarbarian','jonatasbaldin','tiangolo','miguelgrinberg','mrdoob','mattdesl'];

async function loadMainGalaxy(){
  if(creatorMode)deactivateCreatorZone();
  stopEventFeed();
  clearGalaxySearchFull();
  userData=null;
  const ghBtnEl=document.getElementById('github-btn'); if(ghBtnEl)ghBtnEl.style.display='none';
  const abBtn=$('add-bookmark-btn'); if(abBtn)abBtn.style.display='none';
  const srBtnEl=$('star-repo-btn'); if(srBtnEl)srBtnEl.style.display='none';
  galaxySource='main';
  setPillActive('main');
  $('pill-user').style.display='none';
  stars=[];userData=null;activeStar=null;focusedSun=null;contributors=[];
  mode='galaxy';paused=false;
  setStatus(T().statusLoading);
  resetGalCam();
  // Always cancel and restart the animation loop cleanly
  if(af){cancelAnimationFrame(af);af=null;}

  // 1. Try to get trending
  let logins=await fetchTrending();
  let isTrending=true;
  if(!logins||logins.length<5){
    logins=FALLBACK_USERS;
    isTrending=false;
    setStatus(T().trendingUnavailable);
  }

  // 2. Fetch GH user data + their popular repo in parallel
  setStatus(T().statusTrendLoading(logins.length));
  const results=[];
  for(let i=0;i<logins.length;i+=5){
    const batch=logins.slice(i,i+5);
    const settled=await Promise.allSettled(batch.map(async login=>{
      const [ur,rr]=await Promise.all([
        ghFetch('https://api.github.com/users/'+login).then(r=>r.ok?r.json():null),
        ghFetch('https://api.github.com/users/'+login+'/repos?per_page=30&sort=stars').then(r=>r.ok?r.json():[])
      ]);
      if(!ur)return null;
      const repos=Array.isArray(rr)?rr:[];
      const popRepo=repos.find(r=>!r.fork)||repos[0]||null;
      return{user:ur,popRepo};
    }));
    settled.forEach(r=>{if(r.status==='fulfilled'&&r.value)results.push(r.value);});
    if(i===0&&results.length>0){
      buildMainGalaxy(results,isTrending);
      if(!af)af=requestAnimationFrame(animate);
      setStatus(T().statusLoadingBatch(results.length,logins.length));
    }
  }
  buildMainGalaxy(results,isTrending);
  resetRateLimit();
  setStatus(T().statusMappedN(results.length,isTrending));
}

function buildMainGalaxy(devs,trending){
  stars=[];
  const maxF=Math.max(1,...devs.map(d=>d.user.followers||0));
  const n=devs.length;
  // Trending galaxy: loose open cluster with sub-groups by follower count
  const phi=Math.PI*(3-Math.sqrt(5));
  devs.forEach((d,i)=>{
    const followers=d.user.followers||0;
    const fRatio=maxF>0?followers/maxF:0;
    // More followers → closer to center, bigger
    const radBase=28+Math.pow(1-fRatio,0.5)*100;
    // Layered arrangement: top devs form inner ring, rest scatter
    const t=i/Math.max(n-1,1);
    const inc=Math.acos(1-2*t);
    const az=phi*i;
    // flatten into a loose disc with some vertical scatter
    const flatY=0.35+fRatio*0.15;
    const jitter=15*(1-fRatio);      // top devs have less jitter
    const jx=(Math.sin(i*6271))*jitter;
    const jz=(Math.cos(i*7919))*jitter;
    stars.push({
      x:radBase*Math.sin(inc)*Math.cos(az)+jx,
      y:radBase*Math.cos(inc)*flatY,
      z:radBase*Math.sin(inc)*Math.sin(az)+jz,
      size:3.5+fRatio*12,
      color:trending?getThemePalette().trending:getThemePalette().star,
      label:d.user.login,
      isMain:true,trending,
      userObj:d.user,popRepo:d.popRepo,
      ci:Math.min(3+Math.floor(fRatio*3),STAR_CHARS.length-1)
    });
  });
}

// ── USER GALAXY ────────────────────────────────────────────────
async function run(){
  skipTrendingLoad=true; // user is explicitly searching — don't auto-load trending
  const input=$('uinput').value.trim();
  if(!input){skipTrendingLoad=false;return;}
  $('hint')&&($('hint').style.display='none');
  setStatus(T().statusScanning(input.toLowerCase()));
  mode='galaxy';activeStar=null;focusedSun=null;contributors=[];paused=false;
  resetGalCam();
  if(af){cancelAnimationFrame(af);af=null;}
  try{
    const[ur,rr]=await Promise.all([
      ghFetch('https://api.github.com/users/'+input),
      ghFetch('https://api.github.com/users/'+input+'/repos?per_page=80&sort=updated')
    ]);
    if(!ur.ok)throw new Error();
    userData=await ur.json();
    userRepos=await rr.json();
    galaxySource='user';
    setPillActive('user');
    $('pill-user').textContent=userData.login.toUpperCase();
    $('pill-user').style.display='';
    addToHistory(userData.login);
    startEventFeed(userData.login);
    updateBookmarkButton();
    updateGitHubBtn();
    const isOB=userData.login.toLowerCase()==='offbranded';
    if(isOB&&!creatorMode){
      activateCreatorZone();
    } else if(!isOB&&creatorMode){
      deactivateCreatorZone();
    }
    buildUserGalaxy(userRepos);
    setBreadcrumb(null,null,null);
    resetRateLimit();
    setStatus(T().statusMapped(userRepos.length));
    animate();
  }catch(e){setStatus(T().statusNotFound);}
}

function buildUserGalaxy(repos){
  stars=[];
  const maxS=Math.max(1,...repos.map(r=>r.stargazers_count||0));
  const n=repos.length;

  // Seed a deterministic RNG from the user ID so each user has a unique galaxy shape
  const uid=parseInt(userData?.id||Date.now())%999983;
  function rng(i){ return((uid*1000003+i*998244353)%999983)/999983; }

  // Derive personality params from user id — different spread, tilt, clustering
  const armCount  = 2 + (uid % 4);                    // 2-5 spiral arms
  const flatness  = 0.15 + rng(1)*0.55;               // how flat the galaxy is (0=disc, 0.7=sphere)
  const armTwist  = (1.5 + rng(2)*3) * Math.PI;       // how much arms curl
  const coreSize  = 0.15 + rng(3)*0.25;               // size of dense core region
  const outerRad  = 75 + rng(4)*45;                   // max radius — tighter so stars fill view
  const scatter   = 0.08 + rng(5)*0.18;               // random scatter off arms

  repos.forEach((r,i)=>{
    const starRatio = maxS > 0 ? (r.stargazers_count||0)/maxS : 0;
    // Stars with more stars go in the brighter core; obscure repos go to outer arms
    const coreProb = coreSize + starRatio*(1-coreSize)*0.6;
    const inCore = rng(i*7+1) < coreProb * 0.4;

    let x,y,z;
    if(inCore){
      // Core: dense cluster near center
      const cr=outerRad*coreSize*(0.1+rng(i*3)*0.9);
      const ca=rng(i*5)*Math.PI*2, cb=rng(i*11)*Math.PI*2;
      x=cr*Math.sin(ca)*Math.cos(cb);
      y=cr*Math.cos(ca)*flatness*0.5;
      z=cr*Math.sin(ca)*Math.sin(cb);
    } else {
      // Arm: logarithmic spiral placement
      const arm = i % armCount;
      const armAngle = (arm/armCount)*Math.PI*2;
      const t = 0.05 + rng(i*13+3)*0.95;                  // distance from center 0→1
      const r2 = outerRad*(0.12 + Math.pow(t,0.6)*0.88);
      const theta = armAngle + t*armTwist + (rng(i*17+7)-0.5)*scatter*Math.PI*2;
      x = r2*Math.cos(theta);
      z = r2*Math.sin(theta);
      y = (rng(i*23+11)-0.5)*r2*flatness*0.8;
    }

    // Add small random scatter
    x += (rng(i*31+1)-0.5)*outerRad*scatter;
    z += (rng(i*37+2)-0.5)*outerRad*scatter;

    stars.push({
      x,y,z,
      size:3+starRatio*11,
      color:LC(r.language),
      label:r.name,repo:r,isMain:false,
      fresh:(Date.now()-new Date(r.updated_at).getTime())<30*864e5,
      ci:Math.min(Math.floor(2+starRatio*6),STAR_CHARS.length-1)
    });
  });
}

function loadUserGalaxy(){
  if(!userData)return;
  if(creatorMode&&userData.login.toLowerCase()!=='offbranded')deactivateCreatorZone();
  stopEventFeed();
  const srBtn=$('star-repo-btn'); if(srBtn)srBtn.style.display='none';
  galaxySource='user';setPillActive('user');
  mode='galaxy';activeStar=null;focusedSun=null;contributors=[];
  resetGalCam();buildUserGalaxy(userRepos);
  setBreadcrumb(null,null,null);
  setStatus(T().statusSystems(userRepos.length));
}

function setPillActive(which){
  document.querySelectorAll('.pill').forEach(p=>p.classList.remove('active'));
  if(which==='main')$('nav-pills').querySelector('.pill').classList.add('active');
  else $('pill-user').classList.add('active');
}

// ── SOLAR / ZOOM ENTRY ────────────────────────────────────────
async function enterFromMain(star){
  if(!star.popRepo){setStatus(T().noRepoData);return;}
  setStatus('entering: '+star.label.toLowerCase()+' / '+star.popRepo.name.toLowerCase()+'...');
  const fakeStarObj={repo:star.popRepo,label:star.popRepo.name};
  enterSolar(fakeStarObj,star.label);
}

async function enterSolar(star,ownerOverride){
  warpTransition(()=>{});
  activeStar=star;mode='solar';focusedSun=null;contributors=[];
  paused=false;$('pause-badge').style.display='none';
  resetSolCam();
  updateStarButton();
  updateGitHubBtn();
  setStatus(T().statusEntering(star.repo.name.toLowerCase()));
  setBreadcrumb(ownerOverride||userData?.login,star.repo.name,null);
  const[cr,fr]=await Promise.all([
    ghFetch(`https://api.github.com/repos/${star.repo.full_name}/contributors?per_page=20`).catch(()=>({ok:false})),
    ghFetch(`https://api.github.com/repos/${star.repo.full_name}/contents`).catch(()=>({ok:false}))
  ]);
  let contribs=[];
  if(cr.ok){try{contribs=await cr.json();}catch(e){}}
  if(!Array.isArray(contribs)||!contribs.length)contribs=[{login:star.repo.owner?.login||ownerOverride||'?',contributions:1}];
  let files=[];
  if(fr.ok){try{files=await fr.json();}catch(e){}}
  if(!Array.isArray(files))files=[];
  buildSolar(contribs,files);
  const total=contributors.reduce((a,c)=>a+c.planets.length,0);
  setStatus(T().statusSolar(contribs.length,total));
}

function buildSolar(contribs,files){
  const maxC=Math.max(1,...contribs.map(c=>c.contributions||1));

  // ── Deterministic per-user RNG seeded from GitHub user ID ──
  // Each user gets a unique, stable pseudo-random layout
  function makeRng(seed){
    let h=seed>>>0;
    return function(){
      h=Math.imul(h^(h>>>16),0x45d9f3b);
      h=Math.imul(h^(h>>>16),0x45d9f3b);
      h^=h>>>16;
      return ((h>>>0)/4294967296);
    };
  }

  // Seed from repo owner id + repo id + contributor count for uniqueness
  const repoId  = activeStar?.repo?.id   || 0;
  const ownerId = activeStar?.repo?.owner?.id || userData?.id || 0;
  const seed    = ((parseInt(repoId)||0) ^ ((parseInt(ownerId)||0)<<8) ^ (contribs.length*997)) >>> 0;
  const rng = makeRng(seed);

  contributors=contribs.map((c,i)=>{
    const n=contribs.length;
    const pal=getThemePalette();

    if(n===1){
      return{
        login:c.login,contributions:c.contributions||0,
        wx:0, wy:0,
        sunR:26+(c.contributions||1)/maxC*40,
        color:(pal.suns||SUN_PALETTE)[0],
        weight:1, planets:[], glowPhase:rng()*Math.PI*2, avatarImg:null
      };
    }

    // Seeded layout: each contributor gets a unique angle offset, radius, and y-warp
    // Base angle evenly spaced, then jittered by rng per-contributor
    const baseAngle = (i/n)*Math.PI*2;
    const angleJitter = (rng()-0.5)*0.6; // ±0.3 rad
    const angle = baseAngle + angleJitter;

    // Radius varies: inner contributors (more commits) sit closer, jittered
    const weight = (c.contributions||1)/maxC;
    const baseRing = 180 + (1-weight)*160;         // less active → further out
    const ringJitter = (rng()-0.5)*100;             // ±50px noise
    const ring = Math.max(120, baseRing+ringJitter);

    // Y-axis warp: each system has a unique tilt/flatness
    const yWarp = 0.45 + rng()*0.45;               // 0.45–0.90

    // Small random offset to break perfect circles
    const wobbleX = (rng()-0.5)*40;
    const wobbleY = (rng()-0.5)*30;

    return{
      login:c.login,contributions:c.contributions||0,
      wx: Math.cos(angle)*ring + wobbleX,
      wy: Math.sin(angle)*ring*yWarp + wobbleY,
      sunR: 16+(weight)*42,
      color:(pal.suns||SUN_PALETTE)[i%(pal.suns||SUN_PALETTE).length],
      weight, planets:[], glowPhase:rng()*Math.PI*2, avatarImg:null
    };
  });

  contribs.forEach((c,i)=>{
    if(c.avatar_url){
      const img=new Image();img.crossOrigin='anonymous';
      img.onload=()=>{if(contributors[i])contributors[i].avatarImg=img;};
      img.src=c.avatar_url;
    }
  });

  // Re-seed for planet layout
  const rng2=makeRng(seed^0xdeadbeef);

  files.slice(0,36).forEach((f,i)=>{
    const owner=contributors[i%contributors.length];
    const idx=Math.floor(i/contributors.length);
    // Orbit spacing seeded per-file: varied gaps instead of fixed 40px steps
    const orbitGap = 34+rng2()*28;
    const prevOrbit = owner.planets.length
      ? owner.planets[owner.planets.length-1].orbitR
      : owner.sunR+42;
    owner.planets.push({
      name:f.name||'?',type:f.type||'file',size:f.size||100,path:f.path||f.name,
      orbitR: prevOrbit+orbitGap,
      speed: 0.003+rng2()*0.012,
      angle: rng2()*Math.PI*2,
      tilt: 0.38+rng2()*0.52,        // wider tilt range: nearly flat to nearly circular
      char: getIcon(f.name||'',f.type==='dir'),
      psize: 5+Math.min((f.size||100)/900,11),
      color: f.type==='dir'?getThemePalette().dir:getThemePalette().planet
    });
  });

  if(!files.length){
    contributors.forEach(c=>{
      const rng3=makeRng(seed^(c.login.charCodeAt(0)||0));
      for(let i=0;i<4;i++) c.planets.push({
        name:'module_'+i,type:'file',size:500,path:'?',
        orbitR:c.sunR+46+i*(32+rng3()*20),
        speed:0.005+rng3()*0.01,
        angle:rng3()*Math.PI*2,
        tilt:0.4+rng3()*0.5,
        char:getIcon('module',true),psize:7,color:getThemePalette().planet
      });
    });
  }

  fitSolarCamera();
}

function fitSolarCamera(){
  if(!contributors.length)return;
  let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
  contributors.forEach(c=>{
    const r=c.sunR+c.planets.reduce((a,p)=>Math.max(a,p.orbitR),0)+24;
    minX=Math.min(minX,c.wx-r);maxX=Math.max(maxX,c.wx+r);
    minY=Math.min(minY,c.wy-r);maxY=Math.max(maxY,c.wy+r);
  });
  const cxw=(minX+maxX)/2,cyw=(minY+maxY)/2;
  const spanX=maxX-minX+60,spanY=maxY-minY+60;
  const fitScale=Math.min(W/spanX,H/spanY)*0.82;
  camWX=tCamWX=cxw;camWY=tCamWY=cyw;
  camScale=tCamScale=Math.max(fitScale,0.3);
}

function enterZoom(contrib){
  updateGitHubBtn();
  fetchContributorActivity(contrib.login).then(()=>{});
  focusedSun=contrib;mode='zoom';
  paused=false;$('pause-badge').style.display='none';
  const maxOrbit=contrib.planets.reduce((a,p)=>Math.max(a,p.orbitR),contrib.sunR)+32;
  const fitScale=Math.min(W,H)/(maxOrbit*2+24)*0.76;
  tCamWX=contrib.wx;tCamWY=contrib.wy;tCamScale=Math.max(fitScale,0.5);
  setBreadcrumb(userData?.login||activeStar?.repo?.owner?.login,activeStar?.repo?.name,contrib.login);
  setStatus(T().statusZoom(contrib.login,contrib.planets.length));
}


// ── COORDINATE SYSTEM ────────────────────────────────────────
// One coordinate system: [USER_SECTOR].[USER_SYSTEM].[USER_POS] / [REPO_CLUSTER].[REPO_NODE]
// Both IDs map into the same space via consistent bit-slicing.
// Format:  SSS.SSSS.PPP / CC.NNNN
//   SSS   = user sector  (id / 10M)
//   SSSS  = user system  ((id % 10M) / 1000)
//   PPP   = user position (id % 1000)
//   CC    = repo cluster  (repo_id / 10M) — same scale as user sector
//   NNNN  = repo node     (repo_id % 10M / 1000) — same scale as user system

function toCoords(userId, repoId){
  const hasUser = userId != null;
  const hasRepo = repoId != null;
  let userPart = null, repoPart = null;

  if(hasUser){
    const u = parseInt(userId);
    const sec = Math.floor(u / 10000000);
    const sys = Math.floor((u % 10000000) / 1000);
    const pos = u % 1000;
    userPart = `${sec.toString().padStart(3,'0')}.${sys.toString().padStart(4,'0')}.${pos.toString().padStart(3,'0')}`;
  }
  if(hasRepo){
    const r = parseInt(repoId);
    const cluster = Math.floor(r / 10000000);
    const node    = Math.floor((r % 10000000) / 1000);
    repoPart = `${cluster.toString().padStart(3,'0')}.${node.toString().padStart(4,'0')}`;
  }

  if(userPart && repoPart) return `${userPart} / ${repoPart}`;
  if(userPart) return userPart;
  if(repoPart) return `--- / ${repoPart}`;
  return null;
}

// keep old names as shims so nothing else breaks
function idToCoords(id){
  if(!id) return null;
  const u = parseInt(id);
  const sec = Math.floor(u / 10000000);
  const sys = Math.floor((u % 10000000) / 1000);
  const pos = u % 1000;
  return {
    sector: sec.toString().padStart(3,'0'),
    system: sys.toString().padStart(4,'0'),
    pos:    pos.toString().padStart(3,'0'),
    full:   `${sec.toString().padStart(3,'0')}.${sys.toString().padStart(4,'0')}.${pos.toString().padStart(3,'0')}`
  };
}
function repoIdToCoords(id){
  if(!id) return null;
  const r = parseInt(id);
  const cluster = Math.floor(r / 10000000);
  const node    = Math.floor((r % 10000000) / 1000);
  return `${cluster.toString().padStart(3,'0')}.${node.toString().padStart(4,'0')}`;
}

// ── CAMERA RESETS ─────────────────────────────────────────────
function resetGalCam(){rotX=tRX=0.28;rotY=tRY=0;galScale=tGalScale=3.2;}
function resetSolCam(){camWX=tCamWX=0;camWY=tCamWY=0;camScale=tCamScale=1;}

// ── BREADCRUMB ────────────────────────────────────────────────
function setBreadcrumb(owner,repo,contrib){
  const el=$('breadcrumb');
  const parts=[];
  if(galaxySource==='main') parts.push(`<span onclick="loadMainGalaxy()">◈ ${T().breadTrending}</span>`);
  else if(userData) parts.push(`<span onclick="loadUserGalaxy()">◈ ${userData.login.toLowerCase()}</span>`);
  if(repo) parts.push(`<span onclick="backToSolar()">${repo.toLowerCase()}</span>`);
  if(contrib) parts.push(contrib.toLowerCase());
  el.innerHTML=parts.join(' / ');
}

function backToGalaxy(){
  mode='galaxy';activeStar=null;focusedSun=null;contributors=[];
  const srBtnEl3=$('star-repo-btn'); if(srBtnEl3)srBtnEl3.style.display='none';
  paused=false;$('pause-badge').style.display='none';
  resetGalCam();setBreadcrumb(null,null,null);
  setStatus(T().statusObjects(stars.length));
}
function backToSolar(){
  if(!activeStar)return;
  mode='solar';focusedSun=null;
  paused=false;$('pause-badge').style.display='none';
  fitSolarCamera();
  setBreadcrumb(userData?.login||activeStar.repo?.owner?.login,activeStar.repo?.name,null);
  setStatus(T().statusSystems(contributors.length));
}

document.addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT') return; // don't intercept when typing
  if(e.key==='f'||e.key==='F'){e.preventDefault();openGalaxySearch();return;}
  if(e.key==='b'||e.key==='B'){toggleBookmarks();return;}
  if(e.key==='?'){toggleShortcuts();return;}
  if(e.key==='u'||e.key==='U'){copyShareURL();return;}
  if(e.key==='h'||e.key==='H'){searchHistory=[];localStorage.removeItem('stellarmap_history');renderHistory();setStatus('search history cleared');return;}
  if(e.key==='c'||e.key==='C'){showConstellations=!showConstellations;setStatus(showConstellations?'constellation lines on':'constellation lines off');return;}
  if(e.key==='z'||e.key==='Z'){
    if(mode==='galaxy'){tGalScale=Math.max(0.4,Math.min(60,tGalScale*1.14));}
    else{tCamScale=Math.max(0.04,Math.min(140,tCamScale*1.15));}
    return;
  }
  if(e.key==='x'||e.key==='X'){
    if(mode==='galaxy'){tGalScale=Math.max(0.4,Math.min(60,tGalScale*0.88));}
    else{tCamScale=Math.max(0.04,Math.min(140,tCamScale*0.87));}
    return;
  }

  // Arrow keys — pan/rotate
  const isArrow = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key);
  if(isArrow){
    e.preventDefault();
    stopOrbit();
    const step = e.shiftKey ? 0.12 : 0.04; // shift = faster
    if(mode==='galaxy'){
      // rotate the 3D galaxy
      if(e.key==='ArrowLeft')  tRY -= step*2;
      if(e.key==='ArrowRight') tRY += step*2;
      if(e.key==='ArrowUp')    tRX = Math.max(-1.2, tRX - step);
      if(e.key==='ArrowDown')  tRX = Math.min( 1.2, tRX + step);
    } else {
      // pan the 2D solar/zoom camera in world space
      const pan = step * 80 / camScale;
      if(e.key==='ArrowLeft')  tCamWX -= pan;
      if(e.key==='ArrowRight') tCamWX += pan;
      if(e.key==='ArrowUp')    tCamWY -= pan;
      if(e.key==='ArrowDown')  tCamWY += pan;
    }
    return;
  }

  if(e.key==='Escape'){
    if(searchLocked){ clearGalaxySearchFull(); return; }
    if(searchActive){ clearGalaxySearchFull(); return; }
    if(mode==='zoom')backToSolar();
    else if(mode==='solar'){paused=false;$('pause-badge').style.display='none';backToGalaxy();}
  }
  if(e.key===' '&&e.target===document.body){e.preventDefault();togglePause();}
});
function togglePause(){
  if(mode==='galaxy')return;
  paused=!paused;
  $('pause-badge').style.display=paused?'block':'none';
}

// ── CREATOR ZONE ──────────────────────────────────────────────
function deactivateCreatorZone(){
  creatorMode=false;
  document.body.classList.remove('creator');
  // restore theme — if golden is unlocked stay as creator-gold, else revert to cyber
  const restoreTheme = goldenThemeUnlocked ? 'creator-gold' : currentTheme || 'cyber';
  const actualTheme = restoreTheme==='creator' ? 'creator-gold' : restoreTheme;
  document.body.setAttribute('data-theme', actualTheme);
  // show theme button again
  const tb=$('theme-btn'); if(tb)tb.style.removeProperty('display');
  // hide creator badge
  $('creator-zone-badge').style.display='none';
}

function activateCreatorZone(){
  creatorMode=true;
  // Unlock the golden theme permanently
  goldenThemeUnlocked=true;
  localStorage.setItem('stellarmap_golden','1');
  unlockGoldenTheme();
  document.body.classList.add('creator');
  document.body.removeAttribute('data-theme');
  $('theme-panel').classList.remove('open');
  const tb=$('theme-btn'); if(tb)tb.style.display='none';
  creatorParticles=Array.from({length:90},()=>({
    x:W/2+(Math.random()-0.5)*W*0.7,y:H/2+(Math.random()-0.5)*H*0.7,
    vx:(Math.random()-0.5)*2.8,vy:(Math.random()-0.5)*2.8,
    life:1,decay:0.007+Math.random()*0.009,
    char:['★','✦','◈','⬡','◉'][Math.floor(Math.random()*5)]
  }));
  setStatus(T().statusCreator);
}
function drawCreatorParticles(){
  if(!creatorMode)return;
  creatorParticles=creatorParticles.filter(p=>p.life>0);
  creatorParticles.forEach(p=>{
    p.x+=p.vx;p.y+=p.vy;p.life-=p.decay;
    ctx.save();ctx.globalAlpha=p.life*0.85;
    ctx.fillStyle='#ffd700';
    ctx.font=`bold ${Math.round(7+p.life*9)}px Orbitron,sans-serif`;
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(p.char,p.x,p.y);ctx.restore();
  });
}

// ── DRAW: BG ─────────────────────────────────────────────────
function drawBg(){
  const bg=cssVar('--bg');
  ctx.fillStyle=bg||'#050a14';ctx.fillRect(0,0,W,H);
  const isBright=document.body.classList.contains('bright');
  const sc=cssVar('--star-bg')||'rgba(126,184,212,1)';
  const m=sc.match(/[\d.]+/g)||['126','184','212','1'];
  const r=isBright?'10':m[0],g=isBright?'40':m[1],b=isBright?'80':m[2];
  for(let i=0;i<220;i++){
    const x=((i*7919+3)%1000)/1000*W,y=((i*6271+7)%1000)/1000*H;
    // brighter alpha on light bg so stars are visible
    const a=isBright?(((i*1973)%100)/200+0.08):(((i*1973)%100)/400+0.03);
    ctx.fillStyle=`rgba(${r},${g},${b},${a.toFixed(2)})`;
    ctx.beginPath();ctx.arc(x,y,((i*491)%10)/10*0.85+0.15,0,Math.PI*2);ctx.fill();
  }
}

// ── DRAW: GALAXY ──────────────────────────────────────────────
function drawGrid3D(){
  const gc=cssVar('--grid')||'rgba(20,50,80,0.25)';
  ctx.save();ctx.strokeStyle=gc;ctx.lineWidth=0.5;
  // scale grid step with galScale so grid stays useful at all zoom levels
  const step=Math.max(8,Math.round(30/galScale)*10),lines=12;
  for(let i=-lines;i<=lines;i++){
    const a=projGal(i*step,-65,-lines*step),b=projGal(i*step,-65,lines*step);
    const c=projGal(-lines*step,-65,i*step),d=projGal(lines*step,-65,i*step);
    ctx.beginPath();ctx.moveTo(a.sx,a.sy);ctx.lineTo(b.sx,b.sy);ctx.stroke();
    ctx.beginPath();ctx.moveTo(c.sx,c.sy);ctx.lineTo(d.sx,d.sy);ctx.stroke();
  }
  ctx.restore();
}

function drawGalaxy(){
  // If orbiting, translate canvas so target stays at center
  if(orbitActive&&orbitTarget){
    const{ox,oy}=getOrbitOffset();
    ctx.save();
    ctx.translate(ox,oy);
    _galOffX=ox; _galOffY=oy;
  } else {
    _galOffX=0; _galOffY=0;
  }
  drawGrid3D();
  drawConstellations();
  drawShootingStars();
  const proj=stars.map((star,si)=>{const p=projGal(star.x,star.y,star.z);return{...p,s:star,si};});
  proj.sort((a,b)=>a.rz-b.rz);
  const o=projGal(0,0,0);
  const acc2=cssVar('--acc2')||'#5bc8f5';
  ctx.save();ctx.globalAlpha=0.5;ctx.fillStyle=acc2;
  ctx.font='bold 11px Rajdhani,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('⊕',o.sx,o.sy);ctx.restore();

  proj.forEach(({sx,sy,scale,rz,s,si})=>{
    if(sx<-200||sx>W+200||sy<-200||sy>H+200)return;
    // Highlight: dim everything except search matches
    const isSearched = (searchActive || searchLocked) && searchHighlights.size > 0;
    const isMatch = isSearched && searchHighlights.has(si);
    const isDimmed = isSearched && !isMatch;

    if(isDimmed){
      ctx.save();ctx.globalAlpha=0.06;
      ctx.fillStyle=s.color;
      ctx.font=`bold ${Math.max(6,Math.round((7+s.size*1.5)*scale))}px Rajdhani,sans-serif`;
      ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(STAR_CHARS[s.ci]||'✦',sx,sy);
      ctx.restore();
      return;
    }

    const alpha=Math.max(0.1,Math.min(1,0.18+0.82*(1-rz/360)));
    const fs=Math.max(6,Math.round((7+s.size*1.5)*scale));
    const isHov=hovered?.type==='star'&&hovered.s===s;
    const isTrend=s.isMain&&s.trending;
    const pulse=0.35+0.4*Math.sin(tick*0.055+s.x*0.1);

    // glow
    if(isTrend||isHov||s.fresh){
      const glowR=fs*(false?6:isTrend?3.8:2.6);
      const g=ctx.createRadialGradient(sx,sy,0,sx,sy,glowR);
      g.addColorStop(0,s.color);
      g.addColorStop(1,'transparent');
      ctx.save();ctx.globalAlpha=alpha*(isHov?0.55:isTrend?pulse*0.45:pulse*0.25);
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx,sy,glowR,0,Math.PI*2);ctx.fill();
      ctx.restore();
    }
    if(isTrend&&!isHov){
      ctx.save();ctx.globalAlpha=alpha*0.2;ctx.strokeStyle=s.color;ctx.lineWidth=0.8;
      ctx.beginPath();ctx.arc(sx,sy,fs*1.8,0,Math.PI*2);ctx.stroke();
      ctx.restore();
    }

    ctx.save();ctx.globalAlpha=alpha*(isHov?1:0.84);
    ctx.fillStyle=isHov?(cssVar('--acc')||'#a8d4e8'):s.color;
    ctx.font=`bold ${fs}px Rajdhani,sans-serif`;
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(STAR_CHARS[s.ci]||'✦',sx,sy);

    // Show label: always for matches, for hovered, and when close enough (galScale > 4)
    const showLabel = isHov || isMatch || galScale > 3.8;
    if(showLabel){
      ctx.globalAlpha=alpha*(isHov?0.92:0.45);
      ctx.fillStyle=isTrend?(cssVar('--acc')||'#a8d4e8'):(cssVar('--gray2')||'#4a6070');
      ctx.font=`${Math.max(9,fs-1)}px Rajdhani,sans-serif`;
      const lbl=s.label.slice(0,18).toLowerCase();
      ctx.fillText(lbl,sx,sy+fs+3);
      // show popular repo name for trending when close
      if(isTrend&&s.popRepo&&galScale>5){
        ctx.globalAlpha=alpha*0.28;ctx.fillStyle=s.color;
        ctx.font=`${Math.max(7,fs-4)}px Rajdhani,sans-serif`;
        ctx.fillText(s.popRepo.name.slice(0,16).toLowerCase(),sx,sy+fs+3+Math.max(9,fs-1)+2);
      }
    }
    ctx.restore();
  });
  if(orbitActive&&orbitTarget) ctx.restore();
}

// ── DRAW: HEX BG ──────────────────────────────────────────────
function drawHexBg(){
  const hc=cssVar('--hex')||'rgba(15,40,65,0.38)';
  ctx.save();ctx.strokeStyle=hc;ctx.lineWidth=0.5/Math.max(camScale,0.3);
  const hs=50;
  const tl=s2w(0,0),br=s2w(W,H);
  const sc=Math.floor((tl.wx-hs*2)/(hs*1.15))-1;
  const ec=Math.ceil((br.wx+hs*2)/(hs*1.15))+1;
  const sr=Math.floor((tl.wy-hs*2)/(hs*0.87))-1;
  const er=Math.ceil((br.wy+hs*2)/(hs*0.87))+1;
  for(let row=sr;row<=er;row++){
    for(let col=sc;col<=ec;col++){
      const wx=(col+(row%2)*0.5)*hs*1.15,wy=row*hs*0.87;
      const{sx,sy}=w2s(wx,wy);
      ctx.beginPath();
      for(let k=0;k<6;k++){const a=Math.PI/3*k;ctx.lineTo(sx+hs*camScale*0.48*Math.cos(a),sy+hs*camScale*0.48*Math.sin(a));}
      ctx.closePath();ctx.stroke();
    }
  }
  ctx.restore();
}

// ── DRAW: SUN ────────────────────────────────────────────────
function drawSun(c){
  const{sx,sy}=w2s(c.wx,c.wy);
  const sr=c.sunR*camScale;
  const isHov=hovered?.type==='sun'&&hovered.c===c;
  const pulse=0.65+0.35*Math.sin(tick*0.04+c.glowPhase);

  // activity trail
  drawActivityTrail(c,sx,sy,sr);
  // orbit rings
  c.planets.forEach(p=>{
    const or=p.orbitR*camScale;
    const gc2=cssVar('--c2')||'#2d6480';
    ctx.save();ctx.strokeStyle='rgba(74,143,168,0.12)';ctx.lineWidth=Math.max(0.4,0.6/Math.max(camScale,0.3));
    ctx.setLineDash([Math.max(2,3/Math.max(camScale,0.5)),Math.max(4,7/Math.max(camScale,0.5))]);
    ctx.beginPath();ctx.ellipse(sx,sy,or,or*p.tilt,0,0,Math.PI*2);ctx.stroke();
    ctx.setLineDash([]);ctx.restore();
  });

  // glow
  for(let ri=3;ri>0;ri--){
    const r=sr*2.8*(ri/3);
    const a=0.055*(ri/3)*pulse*(isHov?1.9:1);
    const g=ctx.createRadialGradient(sx,sy,0,sx,sy,r);
    g.addColorStop(0,c.color);g.addColorStop(1,'transparent');
    ctx.save();ctx.globalAlpha=a;ctx.fillStyle=g;
    ctx.beginPath();ctx.arc(sx,sy,r,0,Math.PI*2);ctx.fill();ctx.restore();
  }

  // avatar circle
  const avR=sr*0.72;
  if(avR>4){
    if(c.avatarImg){
      ctx.save();
      ctx.beginPath();ctx.arc(sx,sy,avR,0,Math.PI*2);ctx.clip();
      ctx.globalAlpha=0.82;ctx.drawImage(c.avatarImg,sx-avR,sy-avR,avR*2,avR*2);
      ctx.restore();
      ctx.save();ctx.strokeStyle=c.color;ctx.lineWidth=isHov?2.5:1.5;ctx.globalAlpha=isHov?1:0.75;
      ctx.beginPath();ctx.arc(sx,sy,avR,0,Math.PI*2);ctx.stroke();ctx.restore();
    } else {
      ctx.save();
      ctx.fillStyle='rgba(8,16,32,0.92)';
      ctx.beginPath();ctx.arc(sx,sy,avR,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle=c.color;ctx.lineWidth=isHov?2.5:1.5;ctx.globalAlpha=0.8;
      ctx.beginPath();ctx.arc(sx,sy,avR,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=1;ctx.fillStyle=c.color;
      ctx.font=`700 ${Math.max(8,Math.round(avR*0.82))}px Orbitron,sans-serif`;
      ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(c.login.slice(0,2).toUpperCase(),sx,sy);
      ctx.restore();
    }
  }

  // label
  if(sr>8){
    const fs2=Math.max(9,Math.min(14,Math.round(sr*0.4)));
    ctx.save();
    ctx.globalAlpha=isHov?0.95:0.48;ctx.fillStyle=c.color;
    ctx.font=`600 ${fs2}px Rajdhani,sans-serif`;
    ctx.textAlign='center';ctx.textBaseline='top';
    ctx.fillText(c.login.slice(0,14).toLowerCase(),sx,sy+sr*0.82+3);
    if(isHov){
      ctx.globalAlpha=0.55;ctx.fillStyle=cssVar('--acc2')||'#5bc8f5';
      ctx.font=`${Math.max(6,fs2-2)}px Rajdhani,sans-serif`;
      ctx.fillText(c.contributions+' commits',sx,sy+sr*0.82+3+fs2+1);
    }
    ctx.restore();
  }

  // planets
  c.planets.forEach(p=>{
    if(!paused)p.angle+=p.speed;
    const pr=p.psize*camScale;
    const px=sx+Math.cos(p.angle)*p.orbitR*camScale;
    const py=sy+Math.sin(p.angle)*p.orbitR*camScale*p.tilt;
    const isHovP=hovered?.type==='planet'&&hovered.p===p;
    if(isHovP&&pr>3){
      const g=ctx.createRadialGradient(px,py,0,px,py,pr*2.8);
      g.addColorStop(0,p.color);g.addColorStop(1,'transparent');
      ctx.save();ctx.globalAlpha=0.35;ctx.fillStyle=g;
      ctx.beginPath();ctx.arc(px,py,pr*2.8,0,Math.PI*2);ctx.fill();ctx.restore();
    }
    if(pr>2){
      ctx.save();
      ctx.fillStyle=isHovP?(cssVar('--acc')||'#a8d4e8'):p.type==='dir'?'#5bc8f5':'#7eb8d4';
      ctx.font=`bold ${Math.max(7,Math.round(pr*2))}px Rajdhani,sans-serif`;
      ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(p.char,px,py);
      if(pr>5||isHovP){
        ctx.globalAlpha=isHovP?0.9:0.4;ctx.fillStyle=cssVar('--acc2')||getThemePalette().dir;
        ctx.font=`${Math.max(8,Math.round(pr*1.5))}px Rajdhani,sans-serif`;
        ctx.fillText((p.type==='dir'?'['+p.name+']':p.name).slice(0,16),px,py+Math.max(7,Math.round(pr*2))+2);
      }
      ctx.restore();
    } else {
      ctx.save();ctx.fillStyle=p.type==='dir'?getThemePalette().dir:getThemePalette().planet;ctx.globalAlpha=0.6;
      ctx.beginPath();ctx.arc(px,py,Math.max(1.5,pr),0,Math.PI*2);ctx.fill();ctx.restore();
    }
  });
}

// ── DRAW: SOLAR / ZOOM ────────────────────────────────────────
function drawSolar(){
  if(contributors.length>1){
    ctx.save();ctx.strokeStyle='rgba(30,60,90,0.14)';ctx.lineWidth=0.6;ctx.setLineDash([4,8]);
    for(let i=0;i<contributors.length;i++){
      const a=contributors[i],b=contributors[(i+1)%contributors.length];
      const pa=w2s(a.wx,a.wy),pb=w2s(b.wx,b.wy);
      ctx.beginPath();ctx.moveTo(pa.sx,pa.sy);ctx.lineTo(pb.sx,pb.sy);ctx.stroke();
    }
    ctx.setLineDash([]);ctx.restore();
  }
  contributors.forEach(c=>drawSun(c));
  drawBottomBar();
}

function drawZoom(){
  if(focusedSun)drawSun(focusedSun);
  ctx.save();
  ctx.fillStyle='rgba(5,10,20,0.82)';ctx.fillRect(0,H-34,W,34);
  ctx.strokeStyle='rgba(74,143,168,0.22)';ctx.lineWidth=0.5;
  ctx.beginPath();ctx.moveTo(0,H-34);ctx.lineTo(W,H-34);ctx.stroke();
  ctx.fillStyle=cssVar('--gray2')||'#4a6070';ctx.font='600 11px Rajdhani,sans-serif';
  ctx.textAlign='left';ctx.textBaseline='middle';
  if(focusedSun)ctx.fillText(`☀ ${focusedSun.login.toUpperCase()} · ${focusedSun.contributions} COMMITS · ${focusedSun.planets.length} OBJECTS`,14,H-17);
  ctx.textAlign='right';ctx.fillStyle=cssVar('--c2')||'#2d6480';
  ctx.fillText(`${T().btnPlanetView} · ${T().btnEsc}`,W-14,H-17);
  ctx.restore();
}

function drawBottomBar(){
  ctx.save();
  ctx.fillStyle='rgba(5,10,20,0.82)';ctx.fillRect(0,H-34,W,34);
  ctx.strokeStyle='rgba(74,143,168,0.22)';ctx.lineWidth=0.5;
  ctx.beginPath();ctx.moveTo(0,H-34);ctx.lineTo(W,H-34);ctx.stroke();
  ctx.fillStyle=cssVar('--gray2')||'#4a6070';ctx.font='600 11px Rajdhani,sans-serif';
  ctx.textAlign='left';ctx.textBaseline='middle';
  const r=activeStar?.repo;
  if(r)ctx.fillText(`⭐ ${r.stargazers_count||0}  🍴 ${r.forks_count||0}  ${r.language||'?'}  SUNS: ${contributors.length}  PLANETS: ${contributors.reduce((a,c)=>a+c.planets.length,0)}`,14,H-17);
  ctx.textAlign='right';ctx.fillStyle=cssVar('--c2')||'#2d6480';
  ctx.fillText(`${T().btnSunZoom} · ${T().btnPlanetOpen} · ${T().btnEsc}`,W-14,H-17);
  ctx.restore();
}

// ── ANIMATE ───────────────────────────────────────────────────
function animate(){
  ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  ctx.clearRect(0,0,W,H);
  rotX+=(tRX-rotX)*0.06;rotY+=(tRY-rotY)*0.06;
  galScale+=(tGalScale-galScale)*0.08;
  tickOrbit();
  camWX+=(tCamWX-camWX)*0.09;camWY+=(tCamWY-camWY)*0.09;
  camScale+=(tCamScale-camScale)*0.09;
  drawBg();drawCreatorParticles();
  if(mode==='galaxy')drawGalaxy();
  else if(mode==='solar')drawSolar();
  else if(mode==='zoom')drawZoom();
  // HUD
  const el=$('hud-r');
  // Push hud up to clear bottom bar in solar/zoom modes
  el.style.bottom=(mode==='galaxy'?'1rem':'2.9rem');
  $('breadcrumb').style.bottom=(mode==='galaxy'?'1rem':'2.9rem');
  const t2=T();
  const tokenLine=ghToken
    ?`<b>${t2.hudToken}</b> ${t2.hudActive}${apiRemaining!==null?` · <b>${apiRemaining}</b>/${apiLimit} ${t2.hudReqLeft}`:''}` 
    :(apiRemaining!==null?`<b>${apiRemaining}</b>/${apiLimit} ${t2.hudReqLeft}`:`<span style="opacity:0.4">${t2.hudNoToken}</span>`);
  if(mode==='galaxy'){
    const coords = userData ? idToCoords(userData.id) : null;
    const coordStr = toCoords(userData?.id, null);
    const coordLine = coordStr
      ? `<span style="opacity:0.4;font-size:0.52rem;letter-spacing:0.08em">COORDS </span><span style="font-family:'Orbitron',sans-serif;font-size:0.56rem;letter-spacing:0.1em;color:var(--acc2)">${coordStr}</span>`
      : `<span style="opacity:0.25;font-size:0.52rem">---</span>`;
    el.innerHTML=`<b>${t2.hudRot}</b> ${rotX.toFixed(2)},${rotY.toFixed(2)}<br><b>${t2.hudZoom}</b> ${galScale.toFixed(1)}x<br><b>${t2.hudObjects}</b> ${stars.length}<br>${tokenLine}<br>${coordLine}`;
  }
  else {
    const userCoords = userData ? idToCoords(userData.id) : null;
    const repoCoords = activeStar?.repo ? repoIdToCoords(activeStar.repo.id) : null;
    const coordStr2 = toCoords(userData?.id, activeStar?.repo?.id);
    const coordLine = coordStr2
      ? `<span style="opacity:0.4;font-size:0.52rem;letter-spacing:0.08em">COORDS </span><span style="font-family:'Orbitron',sans-serif;font-size:0.54rem;letter-spacing:0.08em;color:var(--acc2)">${coordStr2}</span>`
      : `<span style="opacity:0.25;font-size:0.52rem">---</span>`;
    el.innerHTML=`<b>${t2.hudScale}</b> ${camScale.toFixed(2)}px/u<br><b>${t2.hudSuns}</b> ${contributors.length}<br><b>${t2.hudPlanets}</b> ${contributors.reduce((a,c)=>a+c.planets.length,0)}<br>${tokenLine}<br>${coordLine}`;
  }
  tick++;af=requestAnimationFrame(animate);
}

// ── HOVER PICK ────────────────────────────────────────────────
function pickHover(mx,my){
  const tip=$('tooltip');
  hovered=null;
  if(mode==='galaxy'){
    const proj=stars.map((star,si)=>{const p=projGal(star.x,star.y,star.z);return{...p,s:star,si};});
    let best=null,bd=26;
    proj.forEach(p=>{const d=Math.hypot(mx-p.sx,my-p.sy);if(d<bd){bd=d;best=p;}});
    if(best){
      hovered={type:'star',s:best.s};
      const s=best.s;
      tip.style.display='block';tip.style.display='block';tip.style.left='-9999px';tip.style.top='-9999px';
      // position after render so we know the size
      requestAnimationFrame(()=>{
        const tw=tip.offsetWidth||220,th=tip.offsetHeight||80;
        const margin=12;
        let tx=mx+16, ty=my-8;
        if(tx+tw+margin>window.innerWidth) tx=mx-tw-12;
        if(ty+th+margin>window.innerHeight) ty=window.innerHeight-th-margin;
        if(ty<margin) ty=margin;
        if(tx<margin) tx=margin;
        tip.style.left=tx+'px'; tip.style.top=ty+'px';
      });
      if(s.isMain){
        const u=s.userObj;
        tip.innerHTML=`<span class="tname">${u.login}</span>
${s.trending?'<div style="color:#5bc8f5;font-size:0.55rem;letter-spacing:0.12em;margin-bottom:4px">🔥 TRENDING TODAY</div>':''}
<div class="trow"><span>${T().tipFollowers}</span><span class="tval">${(u.followers||0).toLocaleString()}</span></div>
<div class="trow"><span>${T().tipRepos}</span><span class="tval">${u.public_repos||0}</span></div>
${u.name?`<div class="trow"><span>${T().tipName}</span><span class="tval">${u.name}</span></div>`:''}
${s.popRepo?`<div class="trow"><span>${T().tipPopRepo}</span><span class="tval">${s.popRepo.name}</span></div>`:''}
${s.popRepo?.stargazers_count?`<div class="trow"><span>⭐</span><span class="tval">${s.popRepo.stargazers_count.toLocaleString()}</span></div>`:''}
${u.bio?`<div style="color:var(--gray2);font-size:0.58rem;margin-top:5px">${u.bio.slice(0,70)}</div>`:''}
<div style="color:var(--c2);font-size:0.54rem;margin-top:6px">click to explore system</div>`;
      } else {
        const r=s.repo;
        const days=Math.round((Date.now()-new Date(r.updated_at).getTime())/86400000);
        tip.innerHTML=`<span class="tname">${r.name}</span>
<div class="trow"><span>${T().tipLang}</span><span class="tval" style="color:${LC(r.language)}">${r.language||'?'}</span></div>
<div class="trow"><span>${T().tipStars}</span><span class="tval">${r.stargazers_count||0}</span></div>
<div class="trow"><span>${T().tipForks}</span><span class="tval">${r.forks_count||0}</span></div>
<div class="trow"><span>${T().tipUpdated}</span><span class="tval">${days}d ago</span></div>
${r.description?`<div style="color:var(--gray2);font-size:0.58rem;margin-top:5px">${r.description.slice(0,80)}</div>`:''}
<div style="color:var(--c2);font-size:0.54rem;margin-top:6px">click to enter system</div>`;
      }
    } else tip.style.display='none';
  } else {
    const cList=mode==='zoom'?(focusedSun?[focusedSun]:[]):contributors;
    let best=null,bd=32,bestType=null;
    cList.forEach(c=>{
      const{sx,sy}=w2s(c.wx,c.wy);
      const d=Math.hypot(mx-sx,my-sy);
      if(d<c.sunR*camScale*1.5&&d<bd){bd=d;best=c;bestType='sun';}
    });
    if(!best){
      cList.forEach(c=>{
        const{sx,sy}=w2s(c.wx,c.wy);
        c.planets.forEach(p=>{
          const px=sx+Math.cos(p.angle)*p.orbitR*camScale;
          const py=sy+Math.sin(p.angle)*p.orbitR*camScale*p.tilt;
          const pr=Math.max(10,p.psize*camScale);
          const d=Math.hypot(mx-px,my-py);
          if(d<pr&&d<bd){bd=d;best=p;bestType='planet';}
        });
      });
    }
    hovered=best?{type:bestType,c:bestType==='sun'?best:null,p:bestType==='planet'?best:null}:null;
    if(best&&bestType==='sun'){
      tip.style.display='block';tip.style.display='block';tip.style.left='-9999px';tip.style.top='-9999px';
      // position after render so we know the size
      requestAnimationFrame(()=>{
        const tw=tip.offsetWidth||220,th=tip.offsetHeight||80;
        const margin=12;
        let tx=mx+16, ty=my-8;
        if(tx+tw+margin>window.innerWidth) tx=mx-tw-12;
        if(ty+th+margin>window.innerHeight) ty=window.innerHeight-th-margin;
        if(ty<margin) ty=margin;
        if(tx<margin) tx=margin;
        tip.style.left=tx+'px'; tip.style.top=ty+'px';
      });
      tip.innerHTML=`<span class="tname">${best.login}</span>
<div class="trow"><span>${T().tipCommits}</span><span class="tval">${best.contributions}</span></div>
<div class="trow"><span>${T().tipPlanets}</span><span class="tval">${best.planets.length}</span></div>
<div style="color:var(--c2);font-size:0.54rem;margin-top:6px">${mode==='solar'?T().tipZoomIn:T().tipOpenProfile}</div>`;
    } else if(best&&bestType==='planet'){
      const kb=best.size?Math.round(best.size/1024*10)/10:null;
      tip.style.display='block';tip.style.display='block';tip.style.left='-9999px';tip.style.top='-9999px';
      // position after render so we know the size
      requestAnimationFrame(()=>{
        const tw=tip.offsetWidth||220,th=tip.offsetHeight||80;
        const margin=12;
        let tx=mx+16, ty=my-8;
        if(tx+tw+margin>window.innerWidth) tx=mx-tw-12;
        if(ty+th+margin>window.innerHeight) ty=window.innerHeight-th-margin;
        if(ty<margin) ty=margin;
        if(tx<margin) tx=margin;
        tip.style.left=tx+'px'; tip.style.top=ty+'px';
      });
      tip.innerHTML=`<span class="tname">${best.name}</span>
<div class="trow"><span>${T().tipType}</span><span class="tval">${best.type==='dir'?'dir':'file'}</span></div>
${kb?`<div class="trow"><span>${T().tipSize}</span><span class="tval">${kb} KB</span></div>`:''}
<div style="color:var(--c2);font-size:0.54rem;margin-top:6px">click to view on github</div>`;
    } else tip.style.display='none';
  }
}

// ── INPUT ─────────────────────────────────────────────────────
canvas.addEventListener('mousedown',e=>{stopOrbit();dragging=true;dragMoved=false;lastMX=e.clientX;lastMY=e.clientY;canvas.style.cursor='grabbing'});
window.addEventListener('mouseup',()=>{dragging=false;canvas.style.cursor='crosshair'});
window.addEventListener('mousemove',e=>{
  const dx=e.clientX-lastMX,dy=e.clientY-lastMY;
  if(dragging){
    dragMoved=true;
    if(mode==='galaxy'){tRY+=dx*0.007;tRX+=dy*0.004;tRX=Math.max(-1.2,Math.min(1.2,tRX));}
    else{tCamWX-=dx/camScale;tCamWY-=dy/camScale;}
  }
  lastMX=e.clientX;lastMY=e.clientY;
  if(!dragging)pickHover(e.clientX,e.clientY);
});
canvas.addEventListener('wheel',e=>{
  e.preventDefault();
  if(mode==='galaxy'){
    stopOrbit();
    const factor=e.deltaY>0?0.88:1.14;
    tGalScale=Math.max(0.4,Math.min(60,tGalScale*factor));
  } else {
    const factor=e.deltaY>0?0.87:1.15;
    // Anchor using TARGET state so lerp lag doesn't cause drift
    // World point under cursor (computed from target camera, not lagged current)
    const anchorWX=(e.clientX-W/2)/tCamScale+tCamWX;
    const anchorWY=(e.clientY-H/2)/tCamScale+tCamWY;
    const ns=Math.max(0.04,Math.min(140,tCamScale*factor));
    // After scale change, keep anchorW under cursor: anchorW = (cursor-W/2)/ns + newCamWX
    // => newCamWX = anchorWX - (cursor-W/2)/ns
    tCamWX=anchorWX-(e.clientX-W/2)/ns;
    tCamWY=anchorWY-(e.clientY-H/2)/ns;
    tCamScale=ns;
  }
},{passive:false});
canvas.addEventListener('click',e=>{
  if(dragMoved){dragMoved=false;return;}
  if(mode==='galaxy'){
    if(hovered?.type==='star'){
      if(hovered.s.isMain)enterFromMain(hovered.s);
      else enterSolar(hovered.s);
    }
  } else if(mode==='solar'){
    if(hovered?.type==='sun')enterZoom(hovered.c);
    else if(hovered?.type==='planet'&&activeStar)
      window.open(`https://github.com/${activeStar.repo.full_name}/blob/HEAD/${hovered.p.path}`,'_blank');
  } else if(mode==='zoom'){
    if(hovered?.type==='sun'&&focusedSun)enterContributorGalaxy(focusedSun.login);
    else if(hovered?.type==='planet'&&activeStar)
      window.open(`https://github.com/${activeStar.repo.full_name}/blob/HEAD/${hovered.p.path}`,'_blank');
  }
});
canvas.addEventListener('touchstart',e=>{
  if(e.touches.length===1){dragging=true;dragMoved=false;lastMX=e.touches[0].clientX;lastMY=e.touches[0].clientY;}
  if(e.touches.length===2)lastTouchDist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
},{passive:true});
canvas.addEventListener('touchmove',e=>{
  e.preventDefault();
  if(e.touches.length===1&&dragging){
    dragMoved=true;
    const dx=e.touches[0].clientX-lastMX,dy=e.touches[0].clientY-lastMY;
    if(mode==='galaxy'){tRY+=dx*0.007;tRX+=dy*0.004;}
    else{tCamWX-=dx/camScale;tCamWY-=dy/camScale;}
    lastMX=e.touches[0].clientX;lastMY=e.touches[0].clientY;
  }
  if(e.touches.length===2){
    const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
    const f=d/Math.max(lastTouchDist,1);
    if(mode==='galaxy'){tGalScale=Math.max(0.4,Math.min(60,tGalScale*f));}
    else{
      const midX=(e.touches[0].clientX+e.touches[1].clientX)/2;
      const midY=(e.touches[0].clientY+e.touches[1].clientY)/2;
      const anchorWX=(midX-W/2)/tCamScale+tCamWX;
      const anchorWY=(midY-H/2)/tCamScale+tCamWY;
      const ns=Math.max(0.04,Math.min(140,tCamScale*f));
      tCamWX=anchorWX-(midX-W/2)/ns;
      tCamWY=anchorWY-(midY-H/2)/ns;
      tCamScale=ns;
    }
    lastTouchDist=d;
  }
},{passive:false});
canvas.addEventListener('touchend',()=>{dragging=false;});
$('uinput').addEventListener('keydown',e=>{if(e.key==='Enter')run();});


// ═══════════════════════════════════════════════════════════════
// FEATURE: SEARCH HISTORY
// ═══════════════════════════════════════════════════════════════
let searchHistory = JSON.parse(localStorage.getItem('stellarmap_history')||'[]');

function addToHistory(user){
  searchHistory = [user,...searchHistory.filter(u=>u!==user)].slice(0,8);
  localStorage.setItem('stellarmap_history', JSON.stringify(searchHistory));
  renderHistory();
}
function renderHistory(){
  const el = document.getElementById('history-pills');
  if(!el)return;
  el.innerHTML = searchHistory.map(u=>
    `<span class="hist-pill" onclick="loadFromHistory('${u}')" title="${u}">◈ ${u}</span>`
  ).join('');
}
function loadFromHistory(user){
  document.getElementById('uinput').value = user;
  run();
}
renderHistory();

// ═══════════════════════════════════════════════════════════════
// FEATURE: BOOKMARKS
// ═══════════════════════════════════════════════════════════════
let bookmarks = JSON.parse(localStorage.getItem('stellarmap_bookmarks')||'[]');

function saveUserBookmark(){
  if(!userData) return;
  if(!bookmarks.find(b=>(b.login||b.name)===userData.login&&b.type!=='repo')){
    bookmarks = [{type:'user',login:userData.login,ts:Date.now()},...bookmarks].slice(0,40);
    localStorage.setItem('stellarmap_bookmarks', JSON.stringify(bookmarks));
  }
  renderBookmarks(); updateBookmarkButton();
}
function saveRepoBookmark(){
  const repo = activeStar?.repo; if(!repo) return;
  if(!bookmarks.find(b=>b.type==='repo'&&b.fullName===repo.full_name)){
    bookmarks = [{type:'repo',name:repo.name,fullName:repo.full_name,stars:repo.stargazers_count||0,ts:Date.now()},...bookmarks].slice(0,40);
    localStorage.setItem('stellarmap_bookmarks', JSON.stringify(bookmarks));
  }
  renderBookmarks(); updateStarButton();
}
function saveBookmark(){ saveUserBookmark(); }
function removeBookmark(key, type){
  if(type==='repo') bookmarks = bookmarks.filter(b=>!(b.type==='repo'&&b.fullName===key));
  else bookmarks = bookmarks.filter(b=>!((b.login||b.name)===key&&b.type!=='repo'));
  localStorage.setItem('stellarmap_bookmarks', JSON.stringify(bookmarks));
  renderBookmarks(); updateBookmarkButton(); updateStarButton();
}
function renderBookmarks(){
  const list=$('bk-list');
  if(!list)return;

  const users=bookmarks.filter(b=>b.type==='user'||!b.type);
  const repos=bookmarks.filter(b=>b.type==='repo');

  let html='';
  html+=`<div style="font-family:Orbitron,sans-serif;font-size:0.5rem;color:var(--acc3);padding:0.35rem 0.8rem 0.2rem;letter-spacing:0.12em;border-bottom:1px solid var(--c3)">&#9672; USERS</div>`;
  if(!users.length){
    html+=`<div style="padding:0.3rem 0.8rem;font-size:0.62rem;color:var(--gray3);font-family:Rajdhani,sans-serif">none yet</div>`;
  }else{
    html+=users.map(b=>`<div class="bk-item" onclick="loadFromHistory('${b.login||b.name}')"><span class="bk-name">${b.login||b.name}</span><span class="bk-del" onclick="event.stopPropagation();removeBookmark('${b.login||b.name}','user')">&#10005;</span></div>`).join('');
  }
  html+=`<div style="font-family:Orbitron,sans-serif;font-size:0.5rem;color:var(--acc3);padding:0.35rem 0.8rem 0.2rem;letter-spacing:0.12em;border-bottom:1px solid var(--c3);border-top:1px solid var(--c3);margin-top:2px">&#9670; REPOS</div>`;
  if(!repos.length){
    html+=`<div style="padding:0.3rem 0.8rem;font-size:0.62rem;color:var(--gray3);font-family:Rajdhani,sans-serif">none yet</div>`;
  }else{
    html+=repos.map(b=>`<div class="bk-item" onclick="enterBookmarkedRepo('${b.fullName}')"><span class="bk-name">${b.name}</span><span class="bk-del" onclick="event.stopPropagation();removeBookmark('${b.fullName}','repo')">&#10005;</span></div>`).join('');
  }
  // Add current context quick-add buttons
  const hasUser=userData&&!bookmarks.find(b=>(b.login||b.name)===userData.login&&b.type!=='repo');
  const hasRepo=activeStar?.repo&&!bookmarks.find(b=>b.type==='repo'&&b.fullName===activeStar.repo.full_name);
  if(hasUser||hasRepo){
    html+=`<div style="border-top:1px solid var(--c3);margin-top:2px">`;
    if(hasUser)html+=`<div class="bk-add-btn" onclick="saveUserBookmark();renderBookmarks()">+ ${userData.login}</div>`;
    if(hasRepo)html+=`<div class="bk-add-btn" onclick="saveRepoBookmark();renderBookmarks()">&#11088; ${activeStar.repo.name}</div>`;
    html+=`</div>`;
  }
  list.innerHTML=html||'<div style="padding:0.5rem 0.8rem;font-size:0.62rem;color:var(--gray3);font-family:Rajdhani,sans-serif">no bookmarks yet</div>';
}

function closeAllPanels(){
  ['bookmarks-panel','info-panel','shortcuts-panel'].forEach(id=>{
    const el=$(id); if(el) el.classList.remove('open');
  });
}

function updateSidePanelPositions(){
  // When a panel is open, push sibling buttons aside so they don't overlap
  const bkOpen=$('bookmarks-panel').classList.contains('open');
  const infoOpen=$('info-panel').classList.contains('open');
  const scOpen=$('shortcuts-panel').classList.contains('open');
  const anyOpen=bkOpen||infoOpen||scOpen;

  // Base positions (closed state)
  const BASE={bk:'8.9rem',info:'7.2rem',sc:'5.5rem'};

  // When a panel is open, compute heights dynamically
  const bkBtn=$('bookmarks-btn'), infoBtn=$('info-btn'), scBtn=$('shortcuts-btn');
  const bkPanel=$('bookmarks-panel'), infoPanel=$('info-panel'), scPanel=$('shortcuts-panel');

  if(!anyOpen){
    if(bkBtn) bkBtn.style.bottom=BASE.bk;
    if(bkPanel) bkPanel.style.bottom=BASE.bk;
    if(infoBtn) infoBtn.style.bottom=BASE.info;
    if(infoPanel) infoPanel.style.bottom=BASE.info;
    if(scBtn) scBtn.style.bottom=BASE.sc;
    if(scPanel) scPanel.style.bottom=BASE.sc;
    return;
  }

  // Get the open panel height to shift buttons above it
  const openPanel=bkOpen?bkPanel:infoOpen?infoPanel:scPanel;
  const openBtn=bkOpen?bkBtn:infoOpen?infoBtn:scBtn;
  const openBase=bkOpen?BASE.bk:infoOpen?BASE.info:BASE.sc;

  // When info panel is open, push bookmarks btn above it
  if(bkBtn) bkBtn.style.bottom=BASE.bk;
  if(bkPanel) bkPanel.style.bottom=BASE.bk;
  if(infoBtn) infoBtn.style.bottom=BASE.info;
  if(infoPanel) infoPanel.style.bottom=BASE.info;
  if(scBtn) scBtn.style.bottom=BASE.sc;
  if(scPanel) scPanel.style.bottom=BASE.sc;

  if(infoOpen){
    // measure info panel height and push bookmarks above it
    const infoPanelH = infoPanel ? infoPanel.offsetHeight : 0;
    const infoBtnH = infoBtn ? infoBtn.offsetHeight : 0;
    const newBkBottom = (7.2*16 + infoPanelH + 6) + 'px';
    if(bkBtn) bkBtn.style.bottom = newBkBottom;
    if(bkPanel) bkPanel.style.bottom = newBkBottom;
  }
  if(scOpen){
    const scPanelH = scPanel ? scPanel.offsetHeight : 0;
    const newInfoBottom = (5.5*16 + scPanelH + 6) + 'px';
    if(infoBtn) infoBtn.style.bottom = newInfoBottom;
    if(infoPanel) infoPanel.style.bottom = newInfoBottom;
    const newBkBottom2 = (5.5*16 + scPanelH + 6 + 1.7*16 + 6) + 'px';
    if(bkBtn) bkBtn.style.bottom = newBkBottom2;
    if(bkPanel) bkPanel.style.bottom = newBkBottom2;
  }
  if(bkOpen){
    // bookmarks open — nothing above needs moving
  }
}

// Close all panels when clicking outside
document.addEventListener('click', e=>{
  const panelIds=['bookmarks-panel','info-panel','shortcuts-panel'];
  const btnIds=['bookmarks-btn','info-btn','shortcuts-btn'];
  const clickedInside=panelIds.some(id=>{
    const el=$(id); return el&&el.contains(e.target);
  }) || btnIds.some(id=>{
    const el=$(id); return el&&el.contains(e.target);
  });
  if(!clickedInside){
    const anyOpen=panelIds.some(id=>$(id)?.classList.contains('open'));
    if(anyOpen){ closeAllPanels(); updateSidePanelPositions(); }
  }
});



function toggleStarRepo(){
  if(!activeStar?.repo) return;
  const repo = activeStar.repo;
  const already = bookmarks.find(b=>b.type==='repo'&&b.fullName===repo.full_name);
  if(already) removeBookmark(repo.full_name,'repo');
  else saveRepoBookmark();
  updateStarButton();
}
function updateStarButton(){
  const btn = $('star-repo-btn');
  if(!btn) return;
  if(!activeStar?.repo){ btn.style.display='none'; return; }
  btn.style.display='';
  const starred = !!bookmarks.find(b=>b.type==='repo'&&b.fullName===activeStar.repo.full_name);
  btn.textContent = starred ? '★ REPO' : '☆ REPO';
  btn.classList.toggle('starred', starred);
  btn.title = starred ? 'remove repo star' : 'star this repo';
}

function openOnGitHub(){
  let url = null;
  if(mode==='zoom'&&focusedSun)
    url = 'https://github.com/'+focusedSun.login;
  else if((mode==='solar'||mode==='zoom')&&activeStar?.repo)
    url = 'https://github.com/'+activeStar.repo.full_name;
  else if(userData)
    url = 'https://github.com/'+userData.login;
  if(url) window.open(url,'_blank');
}

function updateGitHubBtn(){
  const btn = document.getElementById('github-btn');
  if(!btn) return;
  const show = !!(userData || activeStar?.repo || focusedSun);
  btn.style.display = show ? '' : 'none';
  if(mode==='zoom'&&focusedSun)
    btn.title = 'open '+focusedSun.login+' on GitHub';
  else if(activeStar?.repo)
    btn.title = 'open '+activeStar.repo.full_name+' on GitHub';
  else if(userData)
    btn.title = 'open '+userData.login+' on GitHub';
}
function toggleBookmarkCurrent(){
  if(!userData) return;
  const already = bookmarks.find(b=>(b.login||b.name)===userData.login&&b.type!=='repo');
  if(already) removeBookmark(userData.login,'user');
  else saveUserBookmark();
  updateBookmarkButton();
}

function updateBookmarkButton(){
  const btn = $('add-bookmark-btn');
  if(!btn)return;
  if(!userData){ btn.style.display='none'; return; }
  btn.style.display='';
  const bookmarked = !!bookmarks.find(b=>(b.login||b.name)===userData.login&&b.type!=='repo');
  btn.textContent = bookmarked ? '★ USER' : '☆ USER';
  btn.classList.toggle('bookmarked', bookmarked);
  btn.title = bookmarked ? 'remove bookmark' : 'bookmark this user';
}

async function enterBookmarkedRepo(fullName){
  setStatus('loading ' + fullName + '...');
  $('bookmarks-panel').classList.remove('open');
  updateSidePanelPositions();
  try{
    const[rr,cr]=await Promise.all([
      ghFetch('https://api.github.com/repos/'+fullName),
      ghFetch('https://api.github.com/users/'+fullName.split('/')[0])
    ]);
    if(!rr.ok) throw new Error();
    const repo = await rr.json();
    // set userData to the owner so breadcrumb works
    if(cr.ok) userData = await cr.json();
    userRepos = [repo];
    galaxySource = 'user';
    setPillActive('user');
    if(userData){ $('pill-user').textContent=userData.login.toUpperCase(); $('pill-user').style.display=''; }
    const starObj = {repo, label: repo.name};
    addToHistory(repo.full_name.split('/')[0]);
    enterSolar(starObj, repo.owner?.login);
  }catch(e){ setStatus('could not load repo'); }
}
function toggleBookmarks(){
  const p=$('bookmarks-panel');
  const opening=!p.classList.contains('open');
  closeAllPanels();
  if(opening){ p.classList.add('open'); renderBookmarks(); }
  updateSidePanelPositions();
}
renderBookmarks();

// ═══════════════════════════════════════════════════════════════
// FEATURE: GALAXY SEARCH (highlight matching stars)
// ═══════════════════════════════════════════════════════════════
let searchActive = false;
let searchQuery = '';
let searchHighlights = new Set();
let searchLocked = false; // true after selecting — keeps dim until ESC

function openGalaxySearch(){
  if(mode!=='galaxy')return;
  searchActive = true;
  $('search-overlay').classList.add('active');
  const inp = $('galaxy-search');
  inp.value = '';
  inp.focus();
  inp.oninput = ()=>{ searchQuery=inp.value.toLowerCase(); updateSearchHighlights(); renderSearchResults(); };
  inp.onkeydown = e=>{
    // Arrow keys — pan/rotate
  const isArrow = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key);
  if(isArrow){
    e.preventDefault();
    stopOrbit();
    const step = e.shiftKey ? 0.12 : 0.04; // shift = faster
    if(mode==='galaxy'){
      // rotate the 3D galaxy
      if(e.key==='ArrowLeft')  tRY -= step*2;
      if(e.key==='ArrowRight') tRY += step*2;
      if(e.key==='ArrowUp')    tRX = Math.max(-1.2, tRX - step);
      if(e.key==='ArrowDown')  tRX = Math.min( 1.2, tRX + step);
    } else {
      // pan the 2D solar/zoom camera in world space
      const pan = step * 80 / camScale;
      if(e.key==='ArrowLeft')  tCamWX -= pan;
      if(e.key==='ArrowRight') tCamWX += pan;
      if(e.key==='ArrowUp')    tCamWY -= pan;
      if(e.key==='ArrowDown')  tCamWY += pan;
    }
    return;
  }

  if(e.key==='Escape'){closeGalaxySearch();return;}
    if(e.key==='Enter'){
      const first = stars.find(s=>matchesStar(s,searchQuery));
      if(first){
        searchHighlights.clear();
        const fi = stars.indexOf(first);
        if(fi >= 0) searchHighlights.add(fi);
        searchLocked = true;
        searchActive = false;
        searchQuery = '';
        $('search-overlay').classList.remove('active');
        renderSearchResults();
        centerOnStar(first);
      }
    }
  };
}
function closeGalaxySearch(){
  stopOrbit();
  searchActive = false;
  searchQuery = '';
  $('search-overlay').classList.remove('active');
  renderSearchResults();
  // DON'T clear highlights — they stay locked until ESC
}

function clearGalaxySearchFull(){
  stopOrbit();
  searchActive = false;
  searchLocked = false;
  searchQuery = '';
  searchHighlights.clear();
  $('search-overlay').classList.remove('active');
  renderSearchResults();
}


function centerOnStar(star){
  const len = Math.sqrt(star.x**2 + star.y**2 + star.z**2);
  if(len > 0){
    tRY = -Math.atan2(star.x, star.z);
    tRX = Math.asin(Math.max(-1, Math.min(1, star.y / len))) * 0.4;
  }
  tGalScale = Math.min(40, Math.max(8, 300 / Math.max(len, 6)));
}
function selectSearchResult(i){
  const star = window._srMatches && window._srMatches[i];
  if(!star) return;
  // Lock highlights on this star only, close overlay
  searchHighlights.clear();
  const idx = stars.indexOf(star);
  if(idx >= 0) searchHighlights.add(idx);
  searchLocked = true;
  searchActive = false;
  searchQuery = '';
  $('search-overlay').classList.remove('active');
  renderSearchResults();
  centerOnStar(star);
}
function clearGalaxySearch(){ clearGalaxySearchFull(); }

function matchesStar(s, q){
  if(!q)return false;
  return s.label?.toLowerCase().includes(q) || s.repo?.description?.toLowerCase().includes(q) || s.repo?.language?.toLowerCase().includes(q);
}
function updateSearchHighlights(){
  searchHighlights.clear();
  if(!searchQuery)return;
  stars.forEach((s,i)=>{ if(matchesStar(s,searchQuery)) searchHighlights.add(i); });
}
function renderSearchResults(){
  const el = $('search-results');
  if(!el)return;
  if(!searchQuery){el.innerHTML='';return;}
  const matches = stars.filter(s=>matchesStar(s,searchQuery)).slice(0,8);
  // Store matches in a global array and use index to avoid escaping issues
  window._srMatches = matches;
  el.innerHTML = matches.map((st,i)=>`
    <div class="search-result" onclick="selectSearchResult(${i})">
      <span class="sr-name">${st.label}</span>
      <span class="sr-lang">${st.repo?.language||st.repo?.stargazers_count||''}</span>
    </div>`).join('');
}
let orbitTarget = null;    // star being orbited after search
let orbitAngle  = 0;       // current orbit angle offset
let orbitActive = false;

function jumpToStar(star){
  const target = typeof star === 'string'
    ? stars.find(s=>s.label===star)
    : (stars.find(s=>s.label===star?.label) || star);
  if(!target) return;

  orbitActive = false;
  orbitTarget = target;

  // Aim rotations so the star faces the camera
  const len = Math.sqrt(target.x**2 + target.y**2 + target.z**2);
  if(len > 0){
    tRY = -Math.atan2(target.x, target.z);
    tRX = Math.asin(Math.max(-1, Math.min(1, target.y / len))) * 0.4;
    orbitAngle = tRY;
  }

  // Zoom in — target fills ~1/6 of the screen
  tGalScale = Math.min(50, Math.max(10, 350 / Math.max(len, 8)));

  // Start orbiting after lerp settles
  setTimeout(()=>{
    if(orbitTarget === target && mode === 'galaxy'){
      orbitAngle = rotY; // sync angle to current actual rotation
      orbitActive = true;
    }
  }, 800);
}

function jumpToStarByLabel(label){
  const star = stars.find(s=>s.label===label);
  if(star) jumpToStar(star);
}

function stopOrbit(){
  orbitActive = false;
  orbitTarget = null;
}

function tickOrbit(){
  if(!orbitActive || !orbitTarget || mode !== 'galaxy') return;
  orbitAngle += 0.004;
  rotY = orbitAngle;
  tRY  = orbitAngle;
}

// ═══════════════════════════════════════════════════════════════
// FEATURE: SHOOTING STARS (repos updated today)
// ═══════════════════════════════════════════════════════════════
let shootingStars = [];
function spawnShootingStar(){
  if(!stars.length) return;
  const fresh = stars.filter(s=>s.fresh);
  if(!fresh.length) return;
  const star = fresh[Math.floor(Math.random()*fresh.length)];
  const proj = projGal(star.x,star.y,star.z);
  const angle = Math.random()*Math.PI*2;
  const speed = 4+Math.random()*6;
  shootingStars.push({
    x:proj.sx, y:proj.sy,
    vx:Math.cos(angle)*speed, vy:Math.sin(angle)*speed-2,
    life:1, decay:0.018+Math.random()*0.01,
    color:star.color, len:40+Math.random()*30
  });
}
function drawShootingStars(){
  if(mode!=='galaxy')return;
  shootingStars = shootingStars.filter(p=>p.life>0);
  shootingStars.forEach(p=>{
    ctx.save();
    ctx.globalAlpha = p.life*0.8;
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 1.2;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.moveTo(p.x,p.y);
    ctx.lineTo(p.x-p.vx*(p.len/10),p.y-p.vy*(p.len/10));
    ctx.stroke();
    ctx.restore();
    p.x+=p.vx; p.y+=p.vy; p.life-=p.decay;
  });
  if(tick%80===0 && Math.random()<0.7) spawnShootingStar();
}

// ═══════════════════════════════════════════════════════════════
// FEATURE: CONSTELLATION LINES (same language repos)
// ═══════════════════════════════════════════════════════════════
let showConstellations = false;
function drawConstellations(){
  if(!showConstellations||mode!=='galaxy')return;
  const byLang = {};
  stars.forEach((s,i)=>{
    const lang = s.repo?.language||s.userObj?.type||'misc';
    if(!byLang[lang]) byLang[lang]=[];
    byLang[lang].push(i);
  });
  ctx.save(); ctx.lineWidth=0.5; ctx.setLineDash([3,8]);
  Object.values(byLang).forEach(group=>{
    if(group.length<2)return;
    const projs = group.map(i=>projGal(stars[i].x,stars[i].y,stars[i].z));
    const col = stars[group[0]].color;
    ctx.strokeStyle = col.replace('#','rgba(').replace(/(..)(..)(..)$/,(_,r,g,b)=>`${parseInt(r,16)},${parseInt(g,16)},${parseInt(b,16)},0.15)`)||'rgba(91,200,245,0.12)';
    ctx.beginPath();
    for(let i=0;i<projs.length-1;i++){
      const a=projs[i],b=projs[i+1];
      const dist=Math.hypot(a.sx-b.sx,a.sy-b.sy);
      if(dist<200){ ctx.moveTo(a.sx,a.sy); ctx.lineTo(b.sx,b.sy); }
    }
    ctx.stroke();
  });
  ctx.setLineDash([]); ctx.restore();
}

// ═══════════════════════════════════════════════════════════════
// FEATURE: WARP ANIMATION
// ═══════════════════════════════════════════════════════════════
function warpTransition(cb){
  const el = $('warp-overlay');
  el.classList.add('active');
  setTimeout(()=>{
    cb();
    setTimeout(()=>el.classList.remove('active'),300);
  },200);
}

// ═══════════════════════════════════════════════════════════════
// FEATURE: URL SHARING
// ═══════════════════════════════════════════════════════════════
function getShareURL(){
  const base = location.href.split('?')[0];
  if(userData) return `${base}?user=${encodeURIComponent(userData.login)}`;
  return base;
}
function copyShareURL(){
  const url = getShareURL();
  navigator.clipboard.writeText(url).then(()=>{
    setStatus('share url copied to clipboard!');
    setTimeout(()=>setStatus(''),2000);
  }).catch(()=>{
    prompt('copy this url:', url);
  });
}
function checkURLParam(){
  const params = new URLSearchParams(location.search);
  const user = params.get('user');
  if(user){
    skipTrendingLoad = true;
    document.getElementById('uinput').value = user;
    // defer until after boot completes (next microtask after current call stack)
    Promise.resolve().then(()=>{ dismissSplash(); run(); });
  }
}

// ═══════════════════════════════════════════════════════════════
// FEATURE: LIVE EVENT FEED
// ═══════════════════════════════════════════════════════════════
let eventFeedActive = false;
let eventFeedInterval = null;
async function startEventFeed(login){
  stopEventFeed();
  if(!login) return;
  eventFeedActive = true;
  async function fetchEvents(){
    if(!eventFeedActive) return;
    try{
      const r = await ghFetch(`https://api.github.com/users/${login}/events/public?per_page=5`);
      if(!r.ok) return;
      const events = await r.json();
      if(!Array.isArray(events)) return;
      events.slice(0,2).forEach((ev,i)=>{
        setTimeout(()=>addEventItem(ev), i*1200);
      });
    }catch(e){}
  }
  await fetchEvents();
  eventFeedInterval = setInterval(fetchEvents, 30000);
}
function stopEventFeed(){
  eventFeedActive = false;
  if(eventFeedInterval){ clearInterval(eventFeedInterval); eventFeedInterval=null; }
  const el = $('event-feed');
  if(el) el.innerHTML='';
}
function addEventItem(ev){
  const el = $('event-feed');
  if(!el) return;
  const typeMap = {PushEvent:'pushed to',CreateEvent:'created',WatchEvent:'starred',ForkEvent:'forked',IssuesEvent:'opened issue on'};
  const action = typeMap[ev.type]||ev.type.replace('Event','');
  const repo = ev.repo?.name?.split('/')[1]||'?';
  const div = document.createElement('div');
  div.className = 'event-item';
  div.textContent = `${action} ${repo}`;
  el.appendChild(div);
  while(el.children.length>5) el.removeChild(el.firstChild);
}

// ═══════════════════════════════════════════════════════════════
// FEATURE: CONTRIBUTOR → OWN GALAXY (click sun → drill into their repos)
// ═══════════════════════════════════════════════════════════════
async function enterContributorGalaxy(login){
  warpTransition(async()=>{
    // Load as a new user search but keep breadcrumb trail
    setStatus(`entering ${login}'s galaxy...`);
    try{
      const[ur,rr]=await Promise.all([
        ghFetch('https://api.github.com/users/'+login),
        ghFetch('https://api.github.com/users/'+login+'/repos?per_page=80&sort=updated')
      ]);
      if(!ur.ok)throw new Error();
      const prevUserData = userData;
      userData = await ur.json();
      userRepos = await rr.json();
      galaxySource='user';
      mode='galaxy'; activeStar=null; focusedSun=null; contributors=[];
      resetGalCam();
      buildUserGalaxy(userRepos);
      setPillActive('user');
      $('pill-user').textContent=userData.login.toUpperCase();
      $('pill-user').style.display='';
      setBreadcrumb(null,null,null);
      setStatus(userRepos.length+' star systems · drag · click to enter');
      if(!af) af=requestAnimationFrame(animate);
      addToHistory(login);
      startEventFeed(login);
    }catch(e){ setStatus('could not load galaxy for '+login); }
  });
}

// ═══════════════════════════════════════════════════════════════
// FEATURE: SHORTCUTS PANEL
// ═══════════════════════════════════════════════════════════════
function toggleShortcuts(){
  const p=$('shortcuts-panel');
  const opening=!p.classList.contains('open');
  closeAllPanels();
  if(opening) p.classList.add('open');
  updateSidePanelPositions();
}

// ═══════════════════════════════════════════════════════════════
// FEATURE: COMMIT HISTORY TRAIL (ring around sun)
// ═══════════════════════════════════════════════════════════════
const contributorActivityCache = {};
async function fetchContributorActivity(login){
  if(contributorActivityCache[login]) return contributorActivityCache[login];
  try{
    const r = await ghFetch(`https://api.github.com/users/${login}/events/public?per_page=30`);
    if(!r.ok) return null;
    const events = await r.json();
    const pushes = events.filter(e=>e.type==='PushEvent').slice(0,12);
    const result = pushes.map((e,i)=>({angle:(i/12)*Math.PI*2, size:3+Math.random()*4, color:'#5bc8f5', repo:e.repo?.name?.split('/')[1]||'?'}));
    contributorActivityCache[login] = result;
    return result;
  }catch(e){ return null; }
}

function drawActivityTrail(c, sx, sy, sr){
  const activity = contributorActivityCache[c.login];
  if(!activity||!activity.length) return;
  const trailR = sr*2.2;
  activity.forEach((a,i)=>{
    const ax = sx+Math.cos(a.angle+tick*0.005)*trailR;
    const ay = sy+Math.sin(a.angle+tick*0.005)*trailR*0.6;
    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = a.color;
    ctx.beginPath(); ctx.arc(ax,ay,Math.max(1.5,a.size*0.3*camScale),0,Math.PI*2); ctx.fill();
    ctx.restore();
  });
}


// ═══════════════════════════════════════════════════════════════
// FEATURE: INFO PANEL
// ═══════════════════════════════════════════════════════════════
function toggleInfo(){
  const p=$('info-panel');
  const opening=!p.classList.contains('open');
  closeAllPanels();
  if(opening){ p.classList.add('open'); updateInfoPanel(); }
  updateSidePanelPositions();
}

function updateInfoPanel(){
  const t=T();
  const stats=$('info-stats');
  const api=$('info-api');
  if(stats){
    const totalPlanets=contributors.reduce((a,c)=>a+c.planets.length,0);
    stats.innerHTML=[
      [t.infoStatGalaxies||'explored galaxies', searchHistory.length||0],
      [t.infoStatBookmarks||'bookmarks saved',  bookmarks.length||0],
      [t.infoStatStars    ||'current stars',    stars.length||0],
      [t.infoStatSuns     ||'current suns',     contributors.length||0],
      [t.infoStatPlanets  ||'current planets',  totalPlanets||0],
      [t.infoStatConst    ||'constellations',   showConstellations?(t.infoOn||'on'):(t.infoOff||'off')],
    ].map(([l,v])=>`<div class="info-stat"><span class="info-stat-label">${l}</span><span class="info-stat-val">${v}</span></div>`).join('');
  }
  if(api){
    const hasToken=!!ghToken;
    const remaining=apiRemaining!==null?apiRemaining:'?';
    const limit=apiLimit||60;
    const pct=apiRemaining!==null?Math.round(apiRemaining/limit*100):null;
    api.innerHTML=[
      [t.infoApiToken   ||'token',         hasToken?'✓ '+(t.infoActive||'active'):'✗ '+(t.infoNone||'none')],
      [t.infoApiReqLeft ||'requests left', apiRemaining!==null?`${remaining} / ${limit}`:(t.infoUnknown||'unknown')],
      [t.infoApiUsage   ||'usage',         pct!==null?`${pct}%`:'—'],
      [t.infoApiRateHit ||'rate limit hit', rateLimitHit?(t.infoYes||'yes'):(t.infoNo||'no')],
    ].map(([l,v])=>`<div class="info-stat"><span class="info-stat-label">${l}</span><span class="info-stat-val" style="${v.includes('✗')||v===(t.infoYes||'yes')?'color:#ff8060':''}">${v}</span></div>`).join('');
  }
}

// ── REFRESH GUARD ────────────────────────────────────────────
window.addEventListener('beforeunload', e => {
  if(stars.length > 0 || mode !== 'galaxy') {
    e.preventDefault();
    e.returnValue = '';
    return '';
  }
});

// ── BOOT ──────────────────────────────────────────────────────
// Build the language picker from whatever lang files were loaded
StellarLang.buildLangPicker();
// Apply persisted lang
applyLang();
// Reset all state on fresh load
mode='galaxy';activeStar=null;focusedSun=null;contributors=[];
stars=[];userData=null;userRepos=[];paused=false;
checkURLParam(); // sets skipTrendingLoad=true if ?user= param present
// Don't auto-load anything at boot — let splash buttons decide
// (splashTrending → loadMainGalaxy, splashSearch/URL → run)