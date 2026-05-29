import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import Navbar from './components/Navbar.jsx';
import './i18n/index.js';
import './styles/globals.css';

// Code-split all pages for scalability
const Home = lazy(() => import('./pages/Home.jsx'));
const Games = lazy(() => import('./pages/Games.jsx'));
const FlagsQuiz = lazy(() => import('./pages/FlagsQuiz.jsx'));
const CapitalsQuiz = lazy(() => import('./pages/CapitalsQuiz.jsx'));
const MapQuiz = lazy(() => import('./pages/MapQuiz.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const Auth = lazy(() => import('./pages/Auth.jsx'));

function Spinner() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', animation: 'spin 1s linear infinite', display: 'inline-block', marginBottom: '0.5rem' }}>🌍</div>
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 'auto' }}>
      <div style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>🌍 GeoMaster</div>
      <p>© {new Date().getFullYear()} GeoMaster</p>
    </footer>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <Suspense fallback={<Spinner />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/games" element={<Games />} />
                  <Route path="/flags" element={<FlagsQuiz />} />
                  <Route path="/capitals" element={<CapitalsQuiz />} />
                  <Route path="/map" element={<MapQuiz />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="*" element={<div className="page" style={{ textAlign: 'center' }}><div style={{ fontSize: '4rem' }}>🗺️</div><h2>404 – Page Not Found</h2></div>} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
