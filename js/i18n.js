/**
 * Stellarmap — i18n Engine
 *
 * Language files live in langs/<code>.js and call StellarLang.register() to
 * add themselves. The engine builds the settings panel language list
 * automatically from whatever files are loaded — no hardcoded list anywhere.
 *
 * To add a language: copy langs/en.js → langs/fr.js, translate, add the
 * <script> tag for it in index.html. That's it.
 */

const StellarLang = (() => {

  const _registry = {};   // { 'en': {...}, 'es': {...}, ... }

  /**
   * Called by each lang file to register itself.
   * @param {string} code  — BCP-47 code, e.g. 'en', 'es', 'fr'
   * @param {object} data  — translation map (must include flag + label)
   */
  function register(code, data) {
    _registry[code] = data;
  }

  /** Return all registered language codes in insertion order. */
  function codes() {
    return Object.keys(_registry);
  }

  /** Return the full data object for a code (falls back to 'en'). */
  function get(code) {
    return _registry[code] || _registry['en'] || {};
  }

  /**
   * Build and inject the language picker into #tp-lang-container.
   * Runs once after all lang scripts are loaded (called from app.js boot).
   */
  function buildLangPicker() {
    const container = document.getElementById('tp-lang-container');
    if (!container) return;

    container.innerHTML = codes().map(code => {
      const d = _registry[code];
      return `<div class="lang-opt" data-l="${code}" onclick="setLang('${code}')">
        <span class="lang-flag">${d.flag || '🌐'}</span>
        <span class="theme-label" id="lang-opt-${code}">${d.label || code.toUpperCase()}</span>
      </div>`;
    }).join('');

    // Mark current active lang
    const saved = localStorage.getItem('stellarmap_lang') || 'en';
    container.querySelectorAll('.lang-opt').forEach(el =>
      el.classList.toggle('active', el.dataset.l === saved)
    );
  }

  return { register, codes, get, buildLangPicker };
})();
