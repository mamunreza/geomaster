import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Leaderboard() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('all');

  const allScores = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('geomaster_leaderboard') || '[]'); }
    catch { return []; }
  }, []);

  const gameTypes = ['all', 'Flags Quiz', 'Capitals Quiz', 'Map Quiz'];
  const filtered = filter === 'all' ? allScores : allScores.filter((s) => s.gameType === filter);
  const sorted = [...filtered].sort((a, b) => b.score - a.score).slice(0, 50);

  const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>🏆 {t('leaderboard.title')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>Top players from around the world</p>
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {gameTypes.map((g) => (
            <button key={g} onClick={() => setFilter(g)} className="btn btn-sm"
              style={{ background: filter === g ? 'var(--primary)' : 'var(--bg-card)', border: `1px solid ${filter === g ? 'var(--primary)' : 'var(--border)'}`, color: filter === g ? '#fff' : 'var(--text-muted)' }}>
              {g === 'all' ? '🌍 All Games' : g === 'Flags Quiz' ? '🏳️ ' + g : g === 'Capitals Quiz' ? '🏛️ ' + g : '🗺️ ' + g}
            </button>
          ))}
        </div>

        {sorted.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
            <p style={{ color: 'var(--text-muted)' }}>{t('leaderboard.noScores')}</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-card2)', borderBottom: '1px solid var(--border)' }}>
                  {[t('leaderboard.rank'), t('leaderboard.player'), t('leaderboard.game'), t('leaderboard.score'), t('leaderboard.accuracy'), t('leaderboard.date')].map((h) => (
                    <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((entry, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(79,70,229,0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {i < 3 ? <span style={{ fontSize: '1.3rem' }}>{['🥇','🥈','🥉'][i]}</span> : <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>#{i + 1}</span>}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>👤 {entry.username}</td>
                    <td style={{ padding: '0.85rem 1rem' }}><span className="badge badge-primary">{entry.gameType}</span></td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--accent)' }}>⭐ {entry.score}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ color: entry.accuracy >= 80 ? 'var(--success)' : entry.accuracy >= 50 ? 'var(--warning)' : 'var(--danger)' }}>{entry.accuracy}%</span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{entry.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
