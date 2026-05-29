import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.jsx';
import LanguageSelector from './LanguageSelector.jsx';

export default function Navbar() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false); };

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/games', label: t('nav.games') },
    ...(user ? [{ to: '/profile', label: t('nav.profile') }] : []),
  ];

  return (
    <nav style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: '2px solid var(--border)', position: 'sticky', top: 0, zIndex: 100, height: '56px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 16px rgba(168,85,247,0.1)' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        {/* Logo */}
        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, fontSize: '1.1rem' }}>
          <span style={{ fontSize: '1.3rem' }}>🌍</span>
          <span style={{ background: 'linear-gradient(135deg, var(--primary-light), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>GeoMaster</span>
        </NavLink>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="desktop-nav">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'}
              style={({ isActive }) => ({ padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.9rem', color: isActive ? 'var(--primary-dark)' : 'var(--text-muted)', background: isActive ? '#f3e8ff' : 'transparent', transition: 'all 0.2s' })}>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <LanguageSelector />
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>👤 {user.username}</span>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>{t('nav.logout')}</button>
            </div>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/auth')}>{t('nav.login')}</button>
          )}
          {/* Hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="hamburger-btn"
            style={{ display: 'none', background: 'none', padding: '0.5rem', color: 'var(--text)', fontSize: '1.4rem' }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{ position: 'absolute', top: '56px', left: 0, right: 0, background: '#ffffff', borderBottom: '2px solid var(--border)', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', zIndex: 99, boxShadow: '0 8px 24px rgba(168,85,247,0.15)' }}>
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'} onClick={() => setMenuOpen(false)}
              style={({ isActive }) => ({ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontWeight: 700, color: isActive ? 'var(--primary-dark)' : 'var(--text)', background: isActive ? '#f3e8ff' : 'transparent' })}>
              {link.label}
            </NavLink>
          ))}
          {user ? (
            <button className="btn btn-secondary" onClick={handleLogout}>{t('nav.logout')}</button>
          ) : (
            <button className="btn btn-primary" onClick={() => { navigate('/auth'); setMenuOpen(false); }}>{t('nav.login')}</button>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
