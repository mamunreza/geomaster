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

    </div>
  );
}
