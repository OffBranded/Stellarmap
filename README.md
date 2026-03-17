# Stellarmap
A 3D GitHub universe explorer. Search any user or org and watch their repositories orbit as stars, contributors as suns, and files as planets — all rendered in real time on an HTML5 canvas.

![themes](https://img.shields.io/badge/themes-7-blueviolet) ![langs](https://img.shields.io/badge/i18n-extensible-blue) ![vanilla](https://img.shields.io/badge/built%20with-vanilla%20JS-yellow)

---

## Features

### 🌌 Visualization
| | |
|---|---|
| **Galaxy view** | Every repo is a star — sized by stars & forks, colored by language |
| **Solar system view** | Click any star to enter; contributors become suns, files become orbiting planets |
| **Shooting stars** | Repos updated today leave light trails across the galaxy |
| **Constellation lines** | Toggle lines connecting repos that share the same language |

### 🔭 Exploration
| | |
|---|---|
| **Trending** | Scrapes `github.com/trending/developers` live on load |
| **Search** | Map any GitHub username or org into its own universe |
| **URL sharing** | `?user=torvalds` loads a galaxy directly from the address bar |
| **Bookmarks** | Save and jump back to any user instantly |
| **Live event feed** | Real-time push events streamed per user as you explore |

### 🎨 Customization
| | |
|---|---|
| **7 themes** | Cyber Blue · Deep Void · Ember · Matrix · Arctic · White · Golden *(unlockable)* |
| **5 icon packs** | Geometric · ASCII · Orbital · Cyber · Minimal |
| **Fully translatable** | Every string in the UI comes from a swappable lang file |
| **API token** | Paste a GitHub token in Settings to raise rate limits to 5000 req/hr |

> [!IMPORTANT]
> The trending feature is not working correctly, while i fix it, it fetches popular devs :D

---

## Getting Started

No build step. Just open `index.html` in a browser or serve the folder with any static server:

```bash
npx serve .
# or
python3 -m http.server
```

> GitHub's API allows 60 unauthenticated requests/hour. Add a token in the Settings panel to get 5000/hour.

---

## File Structure

```
stellarmap/
├── index.html        — markup shell, no inline JS or CSS
├── style.css         — all styles, themes, and animations
├── js/
│   ├── i18n.js       — language registry engine (StellarLang)
│   └── app.js        — all application logic
└── langs/
    ├── en.js         — English
    ├── es.js         — Spanish
    └── ...           — add more here
```

---

## Adding a Language

1. Copy `langs/en.js` → `langs/fr.js`
2. Edit the meta block:
   ```js
   flag:  '🇫🇷',
   label: 'FRANÇAIS',
   ```
3. Translate all the strings in the file
4. Add one line to the scripts section of `index.html`:
   ```html
   <script src="langs/fr.js"></script>
   ```

The new language will appear in the Settings panel automatically. No other changes needed.

---

## Adding a Theme

Open `style.css` and find the `/* ── THEMES ── */` section. Each theme is a single line:

```css
body[data-theme="mytheme"]{
  --bg:#0a0a0a; --bg2:rgba(10,10,10,0.97);
  --c1:#...; --c2:#...; --c3:#...;
  --acc:#...; --acc2:#...; --acc3:#...;
  --gray2:#...; --gray3:#...;
  --star-bg:rgba(...); --grid:rgba(...); --hex:rgba(...);
  --sun-filter:none;
}
```

Then add a canvas palette entry in `app.js` under `THEME_PALETTES`, and a swatch in the theme panel in `index.html`.

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `F` | Search repos in current galaxy |
| `B` | Toggle bookmarks panel |
| `ESC` | Go back one level |
| `Space` | Pause / resume orbits |
| `H` | Clear search history |
| `U` | Copy shareable URL |
| `C` | Toggle constellation lines |
| `Z` / `X` | Zoom in / out |
| `?` | Show shortcuts panel |

---

## GitHub API

Stellarmap uses the public GitHub REST API. No auth required, but rate-limited to 60 req/hour without a token.

To increase the limit: open Settings → Import Token → paste a [personal access token](https://github.com/settings/tokens/new?description=Stellarmap&scopes=public_repo,read:user) with `public_repo` and `read:user` scopes.

The token is stored in `localStorage` and never sent anywhere except directly to `api.github.com`.

---
