import { useTranslation } from 'react-i18next';
import GameCard from '../components/GameCard.jsx';

export default function Games() {
  const { t } = useTranslation();
  return (
    <div className="page">
      <div className="container">
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>{t('nav.games')}</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Choose your challenge and test your geography knowledge</p>
        <div className="grid-3">
          <GameCard title={t('games.flagsQuiz.title')} description={t('games.flagsQuiz.description')} icon="🏳️" path="/flags" color="var(--primary)" stats={[{ value: '195', label: 'Flags' }, { value: '3', label: 'Difficulty Levels' }, { value: '6', label: 'Regions' }]} />
          <GameCard title={t('games.capitalsQuiz.title')} description={t('games.capitalsQuiz.description')} icon="🏛️" path="/capitals" color="var(--secondary)" stats={[{ value: '195', label: 'Capitals' }, { value: '3', label: 'Difficulty Levels' }, { value: '6', label: 'Regions' }]} />
          <GameCard title={t('games.mapQuiz.title')} description={t('games.mapQuiz.description')} icon="🗺️" path="/map" color="var(--accent)" stats={[{ value: '195', label: 'Countries' }, { value: '6', label: 'Regions' }, { value: 'Zoom', label: 'Interactive Map' }]} />
        </div>
      </div>
    </div>
  );
}
