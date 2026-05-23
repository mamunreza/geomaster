# 🌍 GeoMaster — World Geography Games

A React 18 geography quiz application inspired by world-geography-games.com.  
Fully responsive · Multi-language · 195 countries · 3 quiz types · Leaderboard

---

## ✨ Features

| Feature | Details |
|---|---|
| 🏳️ **Flags Quiz** | Identify countries by their flag — 195 flags, 3 difficulty levels, 6 regions |
| 🏛️ **Capitals Quiz** | Name the capital city of any country in the world |
| 🗺️ **Map Quiz** | Click the correct country on an interactive zoomable world map |
| 🌐 **3 Languages** | English · বাংলা (Bangla) · Español — switch instantly from the navbar |
| 🏆 **Leaderboard** | Top 100 scores stored locally, filterable by game type |
| 👤 **User Accounts** | Register, login, track personal stats & recent game history |
| 👻 **Guest Mode** | Play immediately without signing up |
| ⏱️ **Timed Rounds** | Countdown timer per question with visual ring indicator |
| 📱 **Responsive** | Works on mobile, tablet and desktop |

---

## 🚀 Quick Start

**Requirements:** Node.js 18+ and npm

```bash
# 1. Enter the project folder
cd geomaster

# 2. Install dependencies (takes ~30 seconds)
npm install

# 3. Start the dev server — opens at http://localhost:3000
npm run dev
```

To create a production build:
```bash
npm run build        # outputs to ./dist
npm run preview      # preview the production build locally
```

---

## 🗂️ Project Structure

```
geomaster/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx              # App entry point
    ├── App.jsx               # Root: BrowserRouter + Providers + lazy routes
    ├── styles/
    │   └── globals.css       # Design tokens, utility classes, animations
    ├── i18n/
    │   ├── index.js          # i18next initialisation
    │   ├── en.json           # English translations
    │   ├── bn.json           # Bangla translations
    │   └── es.json           # Spanish translations
    ├── data/
    │   └── countries.js      # 195 countries: name, capital, flag emoji, region, TopoJSON id
    ├── hooks/
    │   └── useQuiz.js        # Reusable quiz state machine (timer, scoring, flow)
    ├── context/
    │   ├── AuthContext.jsx   # Register / login / guest / score persistence
    │   └── LanguageContext.jsx
    ├── components/
    │   ├── Navbar.jsx
    │   ├── LanguageSelector.jsx
    │   ├── GameCard.jsx
    │   ├── QuizSettings.jsx  # Difficulty + region picker
    │   ├── QuizTimer.jsx     # Circular SVG countdown ring
    │   ├── ResultsScreen.jsx
    │   └── ScoreDisplay.jsx
    └── pages/
        ├── Home.jsx
        ├── Games.jsx
        ├── FlagsQuiz.jsx
        ├── CapitalsQuiz.jsx
        ├── MapQuiz.jsx       # Uses react-simple-maps + TopoJSON
        ├── Leaderboard.jsx
        ├── Profile.jsx
        └── Auth.jsx
```

---

## ⚙️ Scalability Architecture

This codebase is designed for 10M+ concurrent users when deployed with a proper backend:

| Concern | Solution used |
|---|---|
| **Bundle size** | `React.lazy` + `Suspense` — each page is a separate chunk |
| **Code splitting** | `vite.config.js` `manualChunks` splits vendor, router, i18n, maps |
| **State** | Context API with `useMemo`/`useCallback` — zero re-render overhead |
| **i18n** | i18next with JSON resource files — add any new language in minutes |
| **Data layer** | `countries.js` is pure data — swap `localStorage` for a REST/GraphQL API with no component changes |
| **Caching** | All game data is static — serve from CDN (Cloudflare/Fastly) |
| **Auth** | `AuthContext` wraps a `login/register` interface — replace bodies with `fetch('/api/auth')` calls |

For true 10M-scale deployment, pair this frontend with:
- **CDN** — Cloudflare Pages / Vercel Edge for the static bundle
- **API** — Node.js + Redis for leaderboard; PostgreSQL for user data
- **Auth** — JWT or Supabase Auth to replace the localStorage mock

---

## 🌐 Adding a New Language

1. Create `src/i18n/xx.json` (copy `en.json` and translate values)
2. In `src/i18n/index.js` import and register it: `xx: { translation: xx }`
3. In `src/context/LanguageContext.jsx` add to the `LANGUAGES` array:
   ```js
   { code: 'xx', label: 'MyLang', nativeLabel: 'মাই ল্যাং', flag: '🏳️', dir: 'ltr' }
   ```

---

## 📦 Key Dependencies

| Package | Purpose |
|---|---|
| `react` + `react-dom` | UI framework |
| `react-router-dom` v6 | Client-side routing |
| `i18next` + `react-i18next` | Internationalisation |
| `react-simple-maps` | SVG world map with clickable countries |
| `framer-motion` | Available for page transition animations |
| `vite` | Lightning-fast dev server & bundler |

---

*Built with ❤️ using React 18 + Vite 5*
