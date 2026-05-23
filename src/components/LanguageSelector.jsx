import { useState, useRef, useEffect } from 'react';
import { useLanguage, LANGUAGES } from '../context/LanguageContext.jsx';

export default function LanguageSelector() {
  const { language, changeLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.7rem', background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}>
        <span style={{ fontSize: '1.1rem' }}>{current.flag}</span>
        <span>{current.nativeLabel}</span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', minWidth: '150px', boxShadow: 'var(--shadow)', zIndex: 200, overflow: 'hidden', animation: 'fadeIn 0.15s ease' }}>
          {LANGUAGES.map((lang) => (
            <button key={lang.code} onClick={() => { changeLanguage(lang.code); setOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%', padding: '0.65rem 1rem', background: lang.code === language ? 'rgba(79,70,229,0.2)' : 'transparent', color: lang.code === language ? 'var(--primary-light)' : 'var(--text)', fontSize: '0.9rem', cursor: 'pointer', transition: 'background 0.15s', textAlign: 'left', border: 'none' }}>
              <span style={{ fontSize: '1.2rem' }}>{lang.flag}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{lang.nativeLabel}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lang.label}</div>
              </div>
              {lang.code === language && <span style={{ marginLeft: 'auto', color: 'var(--primary-light)' }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
