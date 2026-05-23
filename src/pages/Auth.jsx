import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Auth() {
  const { t } = useTranslation();
  const { register, login, loginAsGuest } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.username.trim()) return setError(t('auth.errors.usernameRequired'));
    if (!form.password) return setError(t('auth.errors.passwordRequired'));
    if (mode === 'register' && form.password !== form.confirmPassword) return setError(t('auth.errors.passwordMismatch'));
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    const result = mode === 'login' ? login(form.username, form.password) : register(form.username, form.password);
    setLoading(false);
    if (result.error) return setError(t(`auth.errors.${result.error}`));
    navigate('/');
  };

  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 70px)' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🌍</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{mode === 'login' ? t('auth.loginTitle') : t('auth.registerTitle')}</h1>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{t('auth.username')}</label>
              <input className="input" type="text" value={form.username} onChange={(e) => update('username', e.target.value)} placeholder={t('auth.username')} autoComplete="username" />
            </div>
            <div className="form-group">
              <label className="form-label">{t('auth.password')}</label>
              <input className="input" type="password" value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="••••••••" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
            </div>
            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label">{t('auth.confirmPassword')}</label>
                <input className="input" type="password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} placeholder="••••••••" autoComplete="new-password" />
              </div>
            )}
            {error && <p className="form-error" style={{ marginBottom: '1rem' }}>⚠️ {error}</p>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '0.75rem' }} disabled={loading}>
              {loading ? '...' : mode === 'login' ? t('auth.loginBtn') : t('auth.registerBtn')}
            </button>
            <button type="button" className="btn btn-secondary" style={{ width: '100%', marginBottom: '1rem' }} onClick={() => { loginAsGuest(); navigate('/'); }}>
              👤 {t('auth.guestPlay')}
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {mode === 'login' ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
              <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary-light)', fontWeight: 600, cursor: 'pointer' }}>
                {mode === 'login' ? t('auth.signUp') : t('auth.signIn')}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
