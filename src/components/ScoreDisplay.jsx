import { useTranslation } from 'react-i18next';

export default function ScoreDisplay({ score, correct, total, accuracy }) {
  const { t } = useTranslation();
  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      {[
        { label: t('quiz.score'), value: score, icon: '⭐', color: 'var(--accent)' },
        { label: t('quiz.results.correct'), value: `${correct}/${total}`, icon: '✅', color: 'var(--success)' },
        { label: t('quiz.results.accuracy'), value: `${accuracy}%`, icon: '🎯', color: 'var(--secondary)' },
      ].map((item) => (
        <div key={item.label} style={{ background: 'var(--bg-card2)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1', minWidth: '100px' }}>
          <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: item.color }}>{item.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
