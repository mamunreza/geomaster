import { useTranslation } from 'react-i18next';
import { REGIONS } from '../data/countries.js';

export default function QuizSettings({ settings, onChange, onStart }) {
  const { t } = useTranslation();
  const regions = [
    { value: REGIONS.ALL, label: t('quiz.allWorld'), icon: '🌍' },
    { value: REGIONS.AFRICA, label: t('quiz.africa'), icon: '🌍' },
    { value: REGIONS.AMERICAS, label: t('quiz.americas'), icon: '🌎' },
    { value: REGIONS.ASIA, label: t('quiz.asia'), icon: '🌏' },
    { value: REGIONS.EUROPE, label: t('quiz.europe'), icon: '🇪🇺' },
    { value: REGIONS.OCEANIA, label: t('quiz.oceania'), icon: '🏝️' },
  ];
  const difficulties = [
    { value: 'easy', label: t('quiz.easy'), count: 10, time: 20 },
    { value: 'medium', label: t('quiz.medium'), count: 15, time: 15 },
    { value: 'hard', label: t('quiz.hard'), count: 20, time: 10 },
  ];

  return (
    <div className="card fade-in" style={{ maxWidth: '520px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>{t('quiz.settings.title')}</h2>

      <div className="form-group">
        <label className="form-label">{t('quiz.difficulty')}</label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {difficulties.map((d) => (
            <button key={d.value} onClick={() => onChange({ ...settings, difficulty: d.value, count: d.count, timeLimit: d.time })}
              className="btn" style={{ flex: 1, background: settings.difficulty === d.value ? 'var(--primary)' : 'var(--bg-card2)', border: `1px solid ${settings.difficulty === d.value ? 'var(--primary)' : 'var(--border)'}`, color: settings.difficulty === d.value ? '#fff' : 'var(--text-muted)' }}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">{t('quiz.selectRegion')}</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem' }}>
          {regions.map((r) => (
            <button key={r.value} onClick={() => onChange({ ...settings, region: r.value })}
              className="btn btn-sm" style={{ background: settings.region === r.value ? 'var(--primary)' : 'var(--bg-card2)', border: `1px solid ${settings.region === r.value ? 'var(--primary)' : 'var(--border)'}`, color: settings.region === r.value ? '#fff' : 'var(--text-muted)', flexDirection: 'column', padding: '0.6rem 0.4rem', fontSize: '0.8rem' }}>
              <span>{r.icon}</span><span>{r.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '0.5rem' }} onClick={onStart}>
        🚀 {t('quiz.startGame')}
      </button>
    </div>
  );
}
