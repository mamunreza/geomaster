import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import GameCard from '../components/GameCard.jsx';

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loginAsGuest } = useAuth();

  const handleStart = () => {
    if (!user) { loginAsGuest(); }
    navigate('/games');
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)' }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(160deg, #fdf4ff 0%, #ede9fe 40%, #e0f2fe 100%)', padding: '5rem 1rem 4rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(168,85,247,0.18) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(56,189,248,0.18) 0%, transparent 50%), radial-gradient(circle at 50% 100%, rgba(251,191,36,0.12) 0%, transparent 50%)' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div style={{ fontSize: '5rem', marginBottom: '1rem', animation: 'pulse 2.5s infinite', filter: 'drop-shadow(0 4px 12px rgba(168,85,247,0.3))' }}>🌍</div>
          <div className="badge badge-primary" style={{ marginBottom: '1.2rem', fontSize: '0.9rem', padding: '0.4rem 1rem' }}>🎮 {t('home.tagline')}</div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 900, marginBottom: '1rem', lineHeight: 1.1, background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {t('home.title')}
          </h1>
          <p style={{ color: '#7c3aed', fontSize: '1.15rem', maxWidth: '520px', margin: '0 auto 2rem', fontWeight: 600 }}>{t('home.subtitle')}</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={handleStart}>🚀 {t('home.playNow')}</button>
            {!user && <button className="btn btn-secondary btn-lg" onClick={() => navigate('/auth')}>👤 {t('auth.registerBtn')}</button>}
          </div>
        </div>
      </section>

      {/* Games */}
      <section className="page">
        <div className="container">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', textAlign: 'center' }}>{t('home.chooseGame')}</h2>
          <div className="grid-3" style={{ marginBottom: '3rem' }}>
            <GameCard title={t('games.flagsQuiz.title')} description={t('games.flagsQuiz.description')} icon="🏳️" path="/flags" color="var(--primary)" stats={[{ value: '195', label: 'Flags' }, { value: '3', label: 'Levels' }]} />
            <GameCard title={t('games.capitalsQuiz.title')} description={t('games.capitalsQuiz.description')} icon="🏛️" path="/capitals" color="var(--secondary)" stats={[{ value: '195', label: 'Capitals' }, { value: '3', label: 'Levels' }]} />
            <GameCard title={t('games.mapQuiz.title')} description={t('games.mapQuiz.description')} icon="🗺️" path="/map" color="var(--accent)" stats={[{ value: '195', label: 'Countries' }, { value: '6', label: 'Regions' }]} />
          </div>

        </div>
      </section>
    </div>
  );
}
