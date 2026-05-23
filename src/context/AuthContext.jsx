import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'geomaster_users';
const SESSION_KEY = 'geomaster_session';

const loadUsers = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
};

const saveUsers = (users) => localStorage.setItem(STORAGE_KEY, JSON.stringify(users));

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)) || null; }
    catch { return null; }
  });

  const register = useCallback((username, password) => {
    const users = loadUsers();
    if (users[username]) return { error: 'usernameTaken' };
    const newUser = { username, password, createdAt: Date.now(), scores: [], stats: { gamesPlayed: 0, totalScore: 0, bestScore: 0, totalCorrect: 0, totalQuestions: 0 } };
    users[username] = newUser;
    saveUsers(users);
    const sessionUser = { username, stats: newUser.stats, scores: [] };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
    return { success: true };
  }, []);

  const login = useCallback((username, password) => {
    const users = loadUsers();
    if (!users[username] || users[username].password !== password) return { error: 'invalidCredentials' };
    const u = users[username];
    const sessionUser = { username, stats: u.stats, scores: u.scores || [] };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const loginAsGuest = useCallback(() => {
    const guestUser = { username: 'Guest', isGuest: true, stats: { gamesPlayed: 0, totalScore: 0, bestScore: 0, totalCorrect: 0, totalQuestions: 0 }, scores: [] };
    setUser(guestUser);
  }, []);

  const saveScore = useCallback((scoreData) => {
    if (!user) return;
    const users = loadUsers();
    const entry = { ...scoreData, date: new Date().toLocaleDateString() };
    if (!user.isGuest && users[user.username]) {
      const u = users[user.username];
      u.scores = [entry, ...(u.scores || [])].slice(0, 20);
      u.stats.gamesPlayed += 1;
      u.stats.totalScore += scoreData.score;
      u.stats.bestScore = Math.max(u.stats.bestScore, scoreData.score);
      u.stats.totalCorrect += scoreData.correct;
      u.stats.totalQuestions += scoreData.total;
      saveUsers(users);
    }
    const updatedUser = {
      ...user,
      scores: [entry, ...(user.scores || [])].slice(0, 20),
      stats: {
        ...user.stats,
        gamesPlayed: (user.stats.gamesPlayed || 0) + 1,
        totalScore: (user.stats.totalScore || 0) + scoreData.score,
        bestScore: Math.max(user.stats.bestScore || 0, scoreData.score),
        totalCorrect: (user.stats.totalCorrect || 0) + scoreData.correct,
        totalQuestions: (user.stats.totalQuestions || 0) + scoreData.total,
      },
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);

    // Save to global leaderboard
    const lb = JSON.parse(localStorage.getItem('geomaster_leaderboard') || '[]');
    lb.push({ username: user.username, ...scoreData, date: new Date().toLocaleDateString() });
    lb.sort((a, b) => b.score - a.score);
    localStorage.setItem('geomaster_leaderboard', JSON.stringify(lb.slice(0, 100)));
  }, [user]);

  const value = useMemo(() => ({ user, register, login, logout, loginAsGuest, saveScore }), [user, register, login, logout, loginAsGuest, saveScore]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
