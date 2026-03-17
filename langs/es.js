StellarLang.register('es', {

  // ── META ──────────────────────────────────────────────────────────────────
  flag:  '🇲🇽',
  label: 'ESPAÑOL',

  // ── HEADER ────────────────────────────────────────────────────────────────
  subtitle:     'mapea el cosmos de código fuente',
  placeholder:  'buscar usuario u organización...',
  scanBtn:      'BUSCAR ▶',
  trendingPill: '◈ TENDENCIAS',
  settingsBtn:  '⚙ AJUSTES',

  // ── STATUS MESSAGES ───────────────────────────────────────────────────────
  statusLoading:       'obteniendo desarrolladores en tendencia...',
  statusLoaded:        (n, t) => `${n} desarrolladores ${t ? 'en tendencia' : 'destacados'} · arrastra/rota · clic para explorar`,
  statusScanning:      u => `escaneando: ${u}...`,
  statusMapped:        n => `${n} sistemas estelares · arrastra para rotar · rueda para zoom · clic para entrar`,
  statusEntering:      n => `entrando: ${n}...`,
  statusSolar:         (s, p) => `${s} soles · ${p} planetas · rueda para zoom · arrastra para mover · espacio para pausar`,
  statusZoom:          (l, n) => `sistema: ${l} · ${n} objetos · rueda para zoom · espacio pausa · esc atrás`,
  statusNotFound:      'usuario no encontrado en este universo',
  statusCreator:       'bienvenido de vuelta, creador. el universo se doblega a tu voluntad.',
  statusSystems:       n => `${n} sistemas · clic en estrella para entrar`,
  statusObjects:       n => `${n} objetos · clic para explorar`,
  statusRate:          'límite de api de github alcanzado · ver banner superior',
  statusToken:         'token cargado desde memoria · autenticado',
  statusLoadingBatch:  (n, t) => `cargados ${n}/${t} · cargando más...`,
  statusTrendLoading:  n => `cargando ${n} desarrolladores...`,
  statusMappedN:       (n, t) => `${n} desarrolladores ${t ? 'en tendencia' : 'destacados'} · arrastra/rota · clic para explorar`,
  noRepoData:          'no se encontraron repositorios para este usuario',
  trendingUnavailable: 'tendencias no disponibles · usando desarrolladores destacados...',

  // ── HUD ───────────────────────────────────────────────────────────────────
  hudRot: 'rot', hudZoom: 'zoom', hudObjects: 'objetos',
  hudScale: 'escala', hudSuns: 'soles', hudPlanets: 'planetas',
  hudToken: 'token', hudActive: 'activo', hudReqLeft: 'req restantes',
  hudNoToken: 'sin token',

  // ── PAUSE BADGE ───────────────────────────────────────────────────────────
  pauseBadge: '⏸ PAUSADO · ESPACIO PARA REANUDAR',

  // ── SPLASH SCREEN ─────────────────────────────────────────────────────────
  splashTagline:    'explora github como un universo',
  splashTrending:   '◈ EXPLORAR TENDENCIAS',
  splashSearch:     'BUSCAR USUARIO ▶',
  splashPlaceholder:'ingresa usuario u organización de github...',
  splashGo:         'BUSCAR ▶',
  launchBtn:        'LANZAR SATÉLITE',

  // ── BREADCRUMB ────────────────────────────────────────────────────────────
  breadGalaxy: 'galaxia', breadTrending: 'tendencias',

  // ── TOOLTIP LABELS ────────────────────────────────────────────────────────
  tipClickExplore: 'clic para explorar sistema',
  tipClickEnter:   'clic para entrar al sistema',
  tipZoomIn:       'clic para hacer zoom',
  tipOpenProfile:  'clic para abrir perfil',
  tipViewGH:       'clic para ver en github',
  tipFollowers: 'seguidores', tipRepos: 'repos', tipName: 'nombre',
  tipPopRepo: 'repo popular', tipLang: 'lenguaje', tipStars: 'estrellas',
  tipForks: 'forks', tipUpdated: 'actualizado', tipCommits: 'commits',
  tipPlanets: 'planetas', tipType: 'tipo', tipSize: 'tamaño',
  tipTrending: '🔥 TENDENCIA HOY',

  // ── CANVAS BUTTONS ────────────────────────────────────────────────────────
  btnSunZoom:    'CLIC EN SOL PARA ZOOM',
  btnPlanetOpen: 'CLIC EN PLANETA PARA ABRIR',
  btnEsc:        'ESC PARA SALIR',
  btnPlanetView: 'CLIC EN PLANETA PARA VER',

  // ── CREATOR ZONE ──────────────────────────────────────────────────────────
  crBadge:        '◈ ZONA CREADOR · OFFBRANDED',
  creatorUnlocked:'DORADO ✦ DESBLOQUEADO',

  // ── RATE LIMIT BANNER ─────────────────────────────────────────────────────
  rateLimit:       '⚠ LÍMITE DE API',
  rateSoon:        'se reinicia pronto',
  rateGetToken:    'OBTENER TOKEN ↗',
  rateImport:      'IMPORTAR TOKEN',
  rateTokenLabel:  'TOKEN ▸',
  rateApply:       'APLICAR ▶',
  rateClear:       'BORRAR TOKEN',
  rateTokenActive: n => `✓ activo · ${n} solicitudes restantes`,
  rateVerifying:   'verificando...',
  rateInvalid:     '✗ token inválido',
  rateBadCred:     '✗ token incorrecto — borrado',
  rateVerifyFail:  '✗ no se pudo verificar',
  rateCleared:     'token borrado',
  rateApplied:     n => `token aplicado · ${n} solicitudes disponibles`,
  tokenRowPlaceholder: 'ghp_xxxxxxxxxxxxxxxxxxxx',

  // ── SETTINGS PANEL ────────────────────────────────────────────────────────
  themeSelectTitle: '◑ SELECCIONAR TEMA',
  iconPackTitle:    '◧ PACK DE ICONOS',
  displayTitle2:    '◐ PANTALLA',
  langTitle:        '◉ IDIOMA',
  themeClose:       '✕ CERRAR',
  resetBtn:         'RESETEAR TODO',
  resetConfirm:     '¿Borrar todos los ajustes guardados? (tema, idioma, token, iconos, desbloqueos)',
  resetDone:        'ajustes reiniciados',

  // ── THEME NAMES ───────────────────────────────────────────────────────────
  tCyber: 'CYBER BLUE', tVoid: 'DEEP VOID', tEmber: 'EMBER',
  tMatrix: 'MATRIX', tArctic: 'ARCTIC', tWhite: 'WHITE', tGolden: 'GOLDEN',

  // ── ICON PACK NAMES ───────────────────────────────────────────────────────
  ipGeometric: 'GEOMETRIC', ipAscii: 'ASCII', ipOrbital: 'ORBITAL',
  ipCyber: 'CYBER', ipMinimal: 'MINIMAL',

  // ── NAV ───────────────────────────────────────────────────────────────────
  userPill: 'USUARIO',

  // ── SIDE PANEL BUTTONS ────────────────────────────────────────────────────
  infoBtnLbl: 'INFO',
  bkBtnLbl:   'GUARDADOS',
  scBtnLbl:   'TECLAS',

  // ── INFO PANEL ────────────────────────────────────────────────────────────
  infoPanelH: 'SOBRE STELLARMAP',
  infoWhatT:  '¿QUÉ ES ESTO?',
  infoWhatB:  'Una visualización 3D de universos de GitHub. Cada <b>estrella</b> es un repo. Cada <b>sol</b> es un colaborador. Cada <b>planeta</b> es un archivo.',
  infoNavT:   'CÓMO NAVEGAR',
  infoNavB:   '<b>Arrastra</b> para rotar · <b>Rueda</b> para zoom · <b>Clic</b> en estrellas para entrar · <b>Clic</b> en soles para profundizar',
  infoSessT:  'SESIÓN ACTUAL',
  infoApiT:   'ESTADO DE API',
  infoBuiltT: 'CONSTRUIDO CON',
  infoBuiltB: 'GitHub REST API · Vanilla JS · Canvas 2D · No frameworks',

  // info panel — etiquetas de estadísticas dinámicas
  infoStatGalaxies: 'galaxias exploradas',
  infoStatBookmarks:'marcadores guardados',
  infoStatStars:    'estrellas actuales',
  infoStatSuns:     'soles actuales',
  infoStatPlanets:  'planetas actuales',
  infoStatConst:    'constelaciones',
  infoOn: 'activo', infoOff: 'inactivo',
  infoActive: 'activo', infoNone: 'ninguno',
  infoUnknown: 'desconocido',
  infoYes: 'sí', infoNo: 'no',
  infoApiToken:   'token',
  infoApiReqLeft: 'solicitudes restantes',
  infoApiUsage:   'uso',
  infoApiRateHit: 'límite alcanzado',

  // ── BOOKMARKS PANEL ───────────────────────────────────────────────────────
  bkTitle: 'MARCADORES',

  // ── SHORTCUTS PANEL ───────────────────────────────────────────────────────
  scTitle: 'ATAJOS DE TECLADO',
  scClose: 'CERRAR',
  scF:     'buscar repos',
  scB:     'marcadores',
  scEsc:   'volver atrás',
  scSpace: 'pausar órbitas',
  scQ:     'atajos',
  scH:     'borrar historial',
  scU:     'copiar URL para compartir',
  scC:     'líneas de constelación',
  scZ:     'acercar',
  scX:     'alejar',
});