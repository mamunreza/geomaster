export default function QuizTimer({ timeLeft, total }) {
  const pct = (timeLeft / total) * 100;
  const color = pct > 50 ? 'var(--success)' : pct > 25 ? 'var(--warning)' : 'var(--danger)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{ position: 'relative', width: '48px', height: '48px' }}>
        <svg width="48" height="48" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="24" cy="24" r="20" fill="none" stroke="var(--border)" strokeWidth="4" />
          <circle cx="24" cy="24" r="20" fill="none" stroke={color} strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 20}`}
            strokeDashoffset={`${2 * Math.PI * 20 * (1 - pct / 100)}`}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }} />
        </svg>
        <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, color }}>{timeLeft}</span>
      </div>
    </div>
  );
}
