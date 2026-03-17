StellarLang.register('en', {

  // ── META ──────────────────────────────────────────────────────────────────
  flag:  '🇺🇸',
  label: 'ENGLISH',

  // ── HEADER ────────────────────────────────────────────────────────────────
  subtitle:     'map the cosmos of source code',
  placeholder:  'search username or organization...',
  scanBtn:      'SCAN ▶',
  trendingPill: '◈ TRENDING',
  settingsBtn:  '⚙ SETTINGS',

  // ── STATUS MESSAGES ───────────────────────────────────────────────────────
  statusLoading:       'fetching trending developers...',
  statusLoaded:        (n, t) => `${n} ${t ? 'trending' : 'featured'} developers · drag/rotate · click to explore`,
  statusScanning:      u => `scanning: ${u}...`,
  statusMapped:        n => `${n} star systems · drag to rotate · scroll to zoom · click star to enter`,
  statusEntering:      n => `entering: ${n}...`,
  statusSolar:         (s, p) => `${s} suns · ${p} planets · scroll to zoom · drag to pan · space to pause`,
  statusZoom:          (l, n) => `system: ${l} · ${n} objects · scroll to zoom · space to pause · esc back`,
  statusNotFound:      'user not found in this universe',
  statusCreator:       'welcome back, creator. the universe bends to your will.',
  statusSystems:       n => `${n} systems · click star to enter`,
  statusObjects:       n => `${n} objects · click to explore`,
  statusRate:          'github api rate limit reached · see banner above',
  statusToken:         'token loaded from storage · authenticated',
  statusLoadingBatch:  (n, t) => `loaded ${n}/${t} · loading more...`,
  statusTrendLoading:  n => `loading ${n} developers...`,
  statusMappedN:       (n, t) => `${n} ${t ? 'trending' : 'featured'} developers · drag/rotate · click to explore`,
  noRepoData:          'no repo data for this user',
  trendingUnavailable: 'trending unavailable · using featured developers...',

  // ── HUD ───────────────────────────────────────────────────────────────────
  hudRot: 'rot', hudZoom: 'zoom', hudObjects: 'objects',
  hudScale: 'scale', hudSuns: 'suns', hudPlanets: 'planets',
  hudToken: 'token', hudActive: 'active', hudReqLeft: 'req left',
  hudNoToken: 'no token',

  // ── PAUSE BADGE ───────────────────────────────────────────────────────────
  pauseBadge: '⏸ PAUSED · SPACE TO RESUME',

  // ── SPLASH SCREEN ─────────────────────────────────────────────────────────
  splashTagline:    'explore github as a universe',
  splashTrending:   '◈ EXPLORE TRENDING',
  splashSearch:     'SEARCH USER ▶',
  splashPlaceholder:'enter github username or organization...',
  splashGo:         'SCAN ▶',
  launchBtn:        'LAUNCH SATELLITE',

  // ── BREADCRUMB ────────────────────────────────────────────────────────────
  breadGalaxy: 'galaxy', breadTrending: 'trending',

  // ── TOOLTIP LABELS ────────────────────────────────────────────────────────
  tipClickExplore: 'click to explore system',
  tipClickEnter:   'click to enter system',
  tipZoomIn:       'click to zoom in',
  tipOpenProfile:  'click to open profile',
  tipViewGH:       'click to view on github',
  tipFollowers: 'followers', tipRepos: 'repos', tipName: 'name',
  tipPopRepo: 'popular repo', tipLang: 'lang', tipStars: 'stars',
  tipForks: 'forks', tipUpdated: 'updated', tipCommits: 'commits',
  tipPlanets: 'planets', tipType: 'type', tipSize: 'size',
  tipTrending: '🔥 TRENDING TODAY',

  // ── CANVAS BUTTONS ────────────────────────────────────────────────────────
  btnSunZoom:    'CLICK SUN TO ZOOM IN',
  btnPlanetOpen: 'CLICK PLANET TO OPEN',
  btnEsc:        'ESC TO EXIT',
  btnPlanetView: 'CLICK PLANET TO VIEW',

  // ── CREATOR ZONE ──────────────────────────────────────────────────────────
  crBadge:        '◈ CREATOR ZONE · OFFBRANDED',
  creatorUnlocked:'GOLDEN ✦ UNLOCKED',

  // ── RATE LIMIT BANNER ─────────────────────────────────────────────────────
  rateLimit:       '⚠ RATE LIMIT',
  rateSoon:        'resets soon',
  rateGetToken:    'GET TOKEN ↗',
  rateImport:      'IMPORT TOKEN',
  rateTokenLabel:  'TOKEN ▸',
  rateApply:       'APPLY ▶',
  rateClear:       'CLEAR TOKEN',
  rateTokenActive: n => `✓ active · ${n} requests left`,
  rateVerifying:   'verifying...',
  rateInvalid:     '✗ invalid token',
  rateBadCred:     '✗ bad token — cleared',
  rateVerifyFail:  '✗ could not verify',
  rateCleared:     'token cleared',
  rateApplied:     n => `token applied · ${n} requests available`,
  tokenRowPlaceholder: 'ghp_xxxxxxxxxxxxxxxxxxxx',

  // ── SETTINGS PANEL ────────────────────────────────────────────────────────
  themeSelectTitle: '◑ SELECT THEME',
  iconPackTitle:    '◧ ICON PACK',
  displayTitle2:    '◐ DISPLAY',
  langTitle:        '◉ LANGUAGE',
  themeClose:       '✕ CLOSE',
  resetBtn:         'RESET EVERYTHING',
  resetConfirm:     'Delete all saved settings? (theme, language, token, icon pack, unlocks)',
  resetDone:        'settings reset',

  // ── THEME NAMES ───────────────────────────────────────────────────────────
  tCyber: 'CYBER BLUE', tVoid: 'DEEP VOID', tEmber: 'EMBER',
  tMatrix: 'MATRIX', tArctic: 'ARCTIC', tWhite: 'WHITE', tGolden: 'GOLDEN',

  // ── ICON PACK NAMES ───────────────────────────────────────────────────────
  ipGeometric: 'GEOMETRIC', ipAscii: 'ASCII', ipOrbital: 'ORBITAL',
  ipCyber: 'CYBER', ipMinimal: 'MINIMAL',

  // ── NAV ───────────────────────────────────────────────────────────────────
  userPill: 'USER',

  // ── SIDE PANEL BUTTONS ────────────────────────────────────────────────────
  infoBtnLbl: 'INFO',
  bkBtnLbl:   'SAVED',
  scBtnLbl:   'KEYS',

  // ── INFO PANEL ────────────────────────────────────────────────────────────
  infoPanelH: 'ABOUT STELLARMAP',
  infoWhatT:  'WHAT IS THIS?',
  infoWhatB:  'A 3D visualization of GitHub universes. Each <b>star</b> is a repo. Each <b>sun</b> is a contributor. Each <b>planet</b> is a file.',
  infoNavT:   'HOW TO NAVIGATE',
  infoNavB:   '<b>Drag</b> to rotate · <b>Scroll</b> to zoom · <b>Click</b> stars to enter · <b>Click</b> suns to dive deeper',
  infoSessT:  'CURRENT SESSION',
  infoApiT:   'API STATUS',
  infoBuiltT: 'BUILT WITH',
  infoBuiltB: 'GitHub REST API · Vanilla JS · Canvas 2D · No frameworks',

  // info panel — dynamic stat labels
  infoStatGalaxies: 'explored galaxies',
  infoStatBookmarks:'bookmarks saved',
  infoStatStars:    'current stars',
  infoStatSuns:     'current suns',
  infoStatPlanets:  'current planets',
  infoStatConst:    'constellations',
  infoOn: 'on',   infoOff: 'off',
  infoActive: 'active', infoNone: 'none',
  infoUnknown: 'unknown',
  infoYes: 'yes', infoNo: 'no',
  infoApiToken:   'token',
  infoApiReqLeft: 'requests left',
  infoApiUsage:   'usage',
  infoApiRateHit: 'rate limit hit',

  // ── BOOKMARKS PANEL ───────────────────────────────────────────────────────
  bkTitle: 'BOOKMARKS',

  // ── SHORTCUTS PANEL ───────────────────────────────────────────────────────
  scTitle: 'SHORTCUTS',
  scClose: 'CLOSE',
  scF:     'search repos',
  scB:     'bookmarks',
  scEsc:   'go back',
  scSpace: 'pause orbits',
  scQ:     'shortcuts',
  scH:     'clear history',
  scU:     'copy share URL',
  scC:     'constellation lines',
  scZ:     'zoom in',
  scX:     'zoom out',
});