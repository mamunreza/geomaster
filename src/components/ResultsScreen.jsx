import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ScoreDisplay from './ScoreDisplay.jsx';

export default function ResultsScreen({ score, correct, total, accuracy, gameType, onPlayAgain }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, saveScore } = useAuth();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!user || user.isGuest) { navigate('/auth'); return; }
    saveScore({ score, correct, total, accuracy, gameType });
    setSaved(true);
  };

  const grade = accuracy >= 90 ? { label: '🏆 Excellent!', color: 'var(--accent)' }
    : accuracy >= 70 ? { label: '🎯 Great job!', color: 'var(--success)' }
    : accuracy >= 50 ? { label: '👍 Good effort!', color: 'var(--secondary)' }
    : { label: '📚 Keep learning!', color: 'var(--text-muted)' };

  return (
    <div className="card bounce-in" style={{ maxWidth: '520px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ fontSize: '2.25rem', marginBottom: '0.35rem' }}>🎉</div>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.2rem' }}>{t('quiz.results.title')}</h2>
      <div style={{ fontSize: '0.9rem', color: grade.color, fontWeight: 600, marginBottom: '1.1rem' }}>{grade.label}</div>
      <ScoreDisplay score={score} correct={correct} total={total} accuracy={accuracy} />
      <div style={{ display: 'flex', gap: '0.55rem', marginTop: '1.1rem', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={onPlayAgain}>🔄 {t('quiz.playAgain')}</button>
        {!saved ? (
          <button className="btn btn-success" style={{ flex: 1 }} onClick={handleSave}>💾 {t('quiz.results.saveScore')}</button>
        ) : (
          <span className="btn" style={{ flex: 1, background: 'rgba(16,185,129,0.2)', color: 'var(--success)', cursor: 'default' }}>✅ Saved!</span>
        )}
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/')}>🏠 {t('quiz.backHome')}</button>
      </div>
    </div>
  );
}
