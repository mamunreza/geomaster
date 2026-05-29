import { useNavigate } from 'react-router-dom';

export default function GameCard({ title, description, icon, path, color = 'var(--primary)', stats }) {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate(path)}
      style={{ background: '#ffffff', border: `2px solid ${color}44`, borderRadius: 'var(--radius)', padding: '1.5rem 1.3rem', cursor: 'pointer', transition: 'all 0.25s', position: 'relative', overflow: 'hidden', boxShadow: `0 4px 16px ${color}22` }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)'; e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 12px 36px ${color}44`; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = `${color}44`; e.currentTarget.style.boxShadow = `0 4px 16px ${color}22`; }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, ${color}, ${color}88)`, borderRadius: 'var(--radius) var(--radius) 0 0' }} />
      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.7rem', marginBottom: '0.75rem' }}>{icon}</div>
      <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.3rem', color: 'var(--text)' }}>{title}</h3>
      <p style={{ color: '#7c3aed', fontSize: '0.85rem', lineHeight: 1.4, fontWeight: 500 }}>{description}</p>
      {stats && <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: `2px solid ${color}22`, display: 'flex', gap: '0.75rem' }}>
        {stats.map((s) => (
          <div key={s.label}>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color }}>{s.value}</div>
            <div style={{ fontSize: '0.7rem', color: '#7c3aed', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>}
    </div>
  );
}
