import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import ScoreDisplay from '../components/ScoreDisplay.jsx';

export default function Profile() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="page">
        <div className="container" style={{ textAlign: 'center', paddingTop: '3rem' }}>
          <div style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>🔐</div>
          <h2 style={{ marginBottom: '1rem' }}>Sign in to view your profile</h2>
          <button className="btn btn-primary" onClick={() => navigate('/auth')}>Login / Register</button>
        </div>
      </div>
    );
  }

  const stats = user.stats || {};
  const avgAccuracy = stats.totalQuestions > 0 ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : 0;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '720px' }}>
        {/* Header */}
        <div className="card" style={{ marginBottom: '1.1rem', display: 'flex', alignItems: 'center', gap: '1.1rem', flexWrap: 'wrap' }}>
          <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.35rem', fontWeight: 700, flexShrink: 0 }}>
            {user.username[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{user.username}</h1>
            {user.isGuest && <span className="badge badge-warning" style={{ marginTop: '0.25rem' }}>Guest</span>}
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => { logout(); navigate('/'); }}>
            {t('nav.logout')}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid-4" style={{ marginBottom: '1.1rem' }}>
          {[
            { icon: '🎮', label: t('profile.gamesPlayed'), value: stats.gamesPlayed || 0, color: 'var(--primary-light)' },
            { icon: '⭐', label: t('profile.bestScore'), value: stats.bestScore || 0, color: 'var(--accent)' },
            { icon: '📊', label: t('profile.totalScore'), value: stats.totalScore || 0, color: 'var(--secondary)' },
            { icon: '🎯', label: t('profile.avgAccuracy'), value: `${avgAccuracy}%`, color: 'var(--success)' },
          ].map((s) => (
            <div key={s.label} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem' }}>{s.icon}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Recent Games */}
        <div className="card">
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>📋 {t('profile.recentGames')}</h2>
          {(!user.scores || user.scores.length === 0) ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem' }}>{t('profile.noGames')}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {user.scores.slice(0, 10).map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.55rem', background: 'var(--bg-card2)', borderRadius: 'var(--radius-sm)', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                    <span style={{ fontSize: '0.9rem' }}>{s.gameType === 'Flags Quiz' ? '🏳️' : s.gameType === 'Capitals Quiz' ? '🏛️' : '🗺️'}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{s.gameType}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.date}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '0.8rem' }}>⭐ {s.score}</span>
                    <span style={{ color: s.accuracy >= 80 ? 'var(--success)' : s.accuracy >= 50 ? 'var(--warning)' : 'var(--danger)', fontSize: '0.8rem' }}>🎯 {s.accuracy}%</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>✅ {s.correct}/{s.total}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
