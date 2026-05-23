import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import useQuiz, { QUIZ_STATES } from '../hooks/useQuiz.js';
import QuizSettings from '../components/QuizSettings.jsx';
import QuizTimer from '../components/QuizTimer.jsx';
import ResultsScreen from '../components/ResultsScreen.jsx';

const DEFAULT_SETTINGS = { difficulty: 'medium', region: 'all', count: 15, timeLimit: 15 };

export default function CapitalsQuiz() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const quiz = useQuiz({ region: settings.region, count: settings.count, timeLimit: settings.timeLimit, type: 'capitals' });

  if (quiz.state === QUIZ_STATES.IDLE) {
    return (
      <div className="page">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏛️</div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{t('games.capitalsQuiz.title')}</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem' }}>{t('games.capitalsQuiz.description')}</p>
          </div>
          <QuizSettings settings={settings} onChange={setSettings} onStart={() => quiz.startGame()} />
        </div>
      </div>
    );
  }

  if (quiz.state === QUIZ_STATES.FINISHED) {
    return (
      <div className="page">
        <div className="container">
          <ResultsScreen score={quiz.score} correct={quiz.correctCount} total={quiz.questions.length} accuracy={quiz.accuracy} gameType="Capitals Quiz" onPlayAgain={() => quiz.reset()} />
        </div>
      </div>
    );
  }

  const q = quiz.currentQuestion;
  if (!q) return null;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '640px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{t('quiz.question')} {quiz.currentIndex + 1} {t('quiz.of')} {quiz.questions.length}</div>
          <QuizTimer timeLeft={quiz.timeLeft} total={settings.timeLimit} />
          <div style={{ fontWeight: 700, color: 'var(--accent)' }}>⭐ {quiz.score}</div>
        </div>

        <div className="progress-bar" style={{ marginBottom: '1.5rem' }}>
          <div className="progress-fill" style={{ width: `${(quiz.currentIndex / quiz.questions.length) * 100}%` }} />
        </div>

        <div className="card fade-in" style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '0.75rem', fontSize: '0.95rem' }}>{t('quiz.whichCapital')}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{t(`countries.${q.correct.id}`, q.correct.name)}</h2>
          </div>
        </div>

        <div className="grid-2" style={{ gap: '0.75rem' }}>
          {q.options.map((opt) => {
            let bg = 'var(--bg-card)', border = 'var(--border)', color = 'var(--text)';
            if (quiz.state === QUIZ_STATES.ANSWER) {
              if (opt.id === q.correct.id) { bg = 'rgba(16,185,129,0.2)'; border = 'var(--success)'; color = 'var(--success)'; }
              else if (opt.id === quiz.selected) { bg = 'rgba(239,68,68,0.2)'; border = 'var(--danger)'; color = 'var(--danger)'; }
            }
            return (
              <button key={opt.id} onClick={() => quiz.answer(opt.id)} disabled={quiz.state === QUIZ_STATES.ANSWER}
                style={{ background: bg, border: `2px solid ${border}`, borderRadius: 'var(--radius)', padding: '0.9rem 1rem', color, fontWeight: 600, fontSize: '0.95rem', textAlign: 'center', transition: 'all 0.2s', cursor: quiz.state === QUIZ_STATES.ANSWER ? 'default' : 'pointer' }}
                onMouseEnter={(e) => { if (quiz.state === QUIZ_STATES.PLAYING) e.currentTarget.style.borderColor = 'var(--secondary)'; }}
                onMouseLeave={(e) => { if (quiz.state === QUIZ_STATES.PLAYING) e.currentTarget.style.borderColor = 'var(--border)'; }}>
                🏙️ {t(`capitals.${opt.id}`, opt.capital)}
              </button>
            );
          })}
        </div>

        {quiz.state === QUIZ_STATES.ANSWER && (
          <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', background: quiz.selected === q.correct.id ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: quiz.selected === q.correct.id ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
              {quiz.selected === q.correct.id ? `✅ ${t('quiz.correct')}` : `❌ ${t('quiz.wrong')} — ${t(`capitals.${q.correct.id}`, q.correct.capital)}`}
            </span>
            <button className="btn btn-primary btn-sm" onClick={quiz.next}>
              {quiz.currentIndex + 1 >= quiz.questions.length ? t('quiz.finish') : t('quiz.next')} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
