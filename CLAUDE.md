# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Dev server at http://localhost:3000 (auto-opens)
npm run build     # Production build → ./dist/
npm run preview   # Preview production build locally
npm run lint      # ESLint check (no auto-fix flag configured)
```

No test framework is configured.

## Architecture

GeoMaster is a React 18 SPA geography quiz game built with Vite. All data is stored in localStorage — there is no backend.

**Provider hierarchy** (outermost → innermost):
```
BrowserRouter → LanguageProvider → AuthProvider → [Lazy Pages]
```

**Data flow:**
- `src/data/countries.js` — single source of truth: 195-country array + helpers (`generateQuizQuestions`, `getCountriesByRegion`, `shuffle`). Quiz pages call these helpers to produce question sets.
- `src/hooks/useQuiz.js` — shared quiz state machine used by FlagsQuiz, CapitalsQuiz, and (partially) MapQuiz. Manages the idle → playing → answer → finished lifecycle, per-question timers, and scoring (`max(10, timeLeft × 10)`).
- `src/context/AuthContext.jsx` — handles mock auth (no backend), persists users + scores to `geomaster_users` and `geomaster_leaderboard` (top 100) in localStorage.
- `src/context/LanguageContext.jsx` — wraps i18next; language preference persists to `geomaster_lang`.

**i18n:** `src/i18n/index.js` initializes i18next with three translation files (`en.json`, `bn.json`, `es.json`). Translation keys follow a nested convention: `games.flagsQuiz.title`, `nav.home`, etc.

**Routing & code splitting:** All 8 pages in `src/pages/` are `React.lazy()`-loaded with a `Suspense` fallback. Vite chunks are manually split into `vendor`, `router`, `i18n`, and `maps` for HTTP cache efficiency.

**Styling:** CSS custom properties (dark theme) defined in `src/styles/globals.css`. No CSS framework — inline styles are used heavily throughout components.

**MapQuiz** (`src/pages/MapQuiz.jsx`) is the only page that uses `react-simple-maps` (TopoJSON world map). It has its own timer state independent of `useQuiz`.

## localStorage Keys

| Key | Contents |
|-----|----------|
| `geomaster_users` | Array of user objects (mock auth, hashed passwords) |
| `geomaster_session` | Current session token (JSON) |
| `geomaster_leaderboard` | Top-100 global scores (JSON array) |
| `geomaster_lang` | Selected language code (`en`, `bn`, `es`) |

## Adding a Language

1. Add a translation JSON to `src/i18n/` mirroring the structure of `en.json`
2. Register it in `src/i18n/index.js` under `resources`
3. Add the option to `src/components/LanguageSelector.jsx`
