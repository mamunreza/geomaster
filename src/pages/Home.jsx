import { useTranslation } from 'react-i18next';
import GameCard from '../components/GameCard.jsx';
import CountrySearch from '../components/CountrySearch.jsx';
import AdSlot from '../components/AdSlot.jsx';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)' }}>
      {/* Country explorer search + info panel */}
      <CountrySearch />

      {/* Ad slot — leaderboard (728×90 desktop / responsive mobile)
          Space reserved via min-height to prevent CLS per Google guidelines */}
      <div className="container" style={{ padding: '1rem 0.75rem 0' }}>
        <AdSlot format="leaderboard" />
      </div>

      {/* Games section */}
      <section className="page" style={{ paddingTop: '1.5rem' }}>
        <div className="container">
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.1rem', textAlign: 'center' }}>
            {t('home.chooseGame')}
          </h2>
          <div className="grid-3">
            <GameCard
              title={t('games.flagsQuiz.title')}
              description={t('games.flagsQuiz.description')}
              icon="🏳️" path="/flags" color="var(--primary)"
              stats={[{ value: '195', label: 'Flags' }, { value: '3', label: 'Levels' }]}
            />
            <GameCard
              title={t('games.capitalsQuiz.title')}
              description={t('games.capitalsQuiz.description')}
              icon="🏛️" path="/capitals" color="var(--secondary)"
              stats={[{ value: '195', label: 'Capitals' }, { value: '3', label: 'Levels' }]}
            />
            <GameCard
              title={t('games.mapQuiz.title')}
              description={t('games.mapQuiz.description')}
              icon="🗺️" path="/map" color="var(--accent)"
              stats={[{ value: '195', label: 'Countries' }, { value: '6', label: 'Regions' }]}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
