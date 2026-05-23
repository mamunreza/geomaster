import { useState, useCallback, useRef, useEffect } from 'react';
import { generateQuizQuestions } from '../data/countries.js';

export const QUIZ_STATES = { IDLE: 'idle', PLAYING: 'playing', ANSWER: 'answer', FINISHED: 'finished' };

export default function useQuiz({ region = 'all', count = 10, timeLimit = 15, type = 'flags' } = {}) {
  const [state, setState] = useState(QUIZ_STATES.IDLE);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState([]);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const timerRef = useRef(null);

  const clearTimer = () => { if (timerRef.current) clearInterval(timerRef.current); };

  const startTimer = useCallback(() => {
    clearTimer();
    setTimeLeft(timeLimit);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearTimer();
          // auto-submit wrong on timeout
          setSelected('__timeout__');
          setState(QUIZ_STATES.ANSWER);
          setResults((r) => [...r, { correct: false, timedOut: true }]);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, [timeLimit]);

  useEffect(() => () => clearTimer(), []);

  const startGame = useCallback(() => {
    const qs = generateQuizQuestions(region, count, type);
    setQuestions(qs);
    setCurrentIndex(0);
    setResults([]);
    setSelected(null);
    setState(QUIZ_STATES.PLAYING);
    startTimer();
  }, [region, count, type, startTimer]);

  const answer = useCallback((optionId) => {
    clearTimer();
    if (state !== QUIZ_STATES.PLAYING) return;
    const q = questions[currentIndex];
    const isCorrect = optionId === q.correct.id;
    setSelected(optionId);
    setResults((r) => [...r, { correct: isCorrect, answer: optionId, correctId: q.correct.id }]);
    setState(QUIZ_STATES.ANSWER);
  }, [state, questions, currentIndex]);

  const next = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= questions.length) {
      setState(QUIZ_STATES.FINISHED);
    } else {
      setCurrentIndex(nextIndex);
      setSelected(null);
      setState(QUIZ_STATES.PLAYING);
      startTimer();
    }
  }, [currentIndex, questions.length, startTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setQuestions([]);
    setCurrentIndex(0);
    setResults([]);
    setSelected(null);
    setTimeLeft(timeLimit);
    setState(QUIZ_STATES.IDLE);
  }, [timeLimit]);

  const correctCount = results.filter((r) => r.correct).length;
  const score = results.reduce((acc, r, i) => acc + (r.correct ? Math.max(10, Math.round((questions[i] ? timeLimit : 0) * 10)) : 0), 0);
  const accuracy = results.length ? Math.round((correctCount / results.length) * 100) : 0;

  return {
    state, questions, currentIndex, currentQuestion: questions[currentIndex],
    selected, results, timeLeft, correctCount, score, accuracy,
    startGame, answer, next, reset,
    progress: questions.length ? ((currentIndex + (state === QUIZ_STATES.FINISHED ? 1 : 0)) / questions.length) * 100 : 0,
  };
}
