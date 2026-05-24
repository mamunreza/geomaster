import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../firebase.js';

const AuthContext = createContext(null);

const USERS_KEY = 'geomaster_users';

const defaultStats = () => ({
  gamesPlayed: 0, totalScore: 0, bestScore: 0, totalCorrect: 0, totalQuestions: 0,
});

const loadUserData = (uid) => {
  try {
    const all = JSON.parse(localStorage.getItem(USERS_KEY)) || {};
    return all[uid] || { stats: defaultStats(), scores: [] };
  } catch { return { stats: defaultStats(), scores: [] }; }
};

const saveUserData = (uid, data) => {
  try {
    const all = JSON.parse(localStorage.getItem(USERS_KEY)) || {};
    all[uid] = data;
    localStorage.setItem(USERS_KEY, JSON.stringify(all));
  } catch { /* ignore */ }
};

const mapFirebaseError = (code) => {
  switch (code) {
    case 'auth/email-already-in-use': return 'emailTaken';
    case 'auth/weak-password': return 'weakPassword';
    case 'auth/invalid-email': return 'invalidEmail';
    case 'auth/too-many-requests': return 'tooManyRequests';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential': return 'invalidCredentials';
    default: return 'genericError';
  }
};

export function AuthProvider({ children }) {
  // undefined = initializing, null = signed out, object = signed in
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userData = loadUserData(firebaseUser.uid);
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.isAnonymous ? 'Guest' : (firebaseUser.displayName || firebaseUser.email),
          email: firebaseUser.email,
          isGuest: firebaseUser.isAnonymous,
          stats: userData.stats,
          scores: userData.scores,
        });
      } else {
        setUser(null);
      }
    });
    return unsub;
  }, []);

  const register = useCallback(async (displayName, email, password) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName });
      return { success: true };
    } catch (err) {
      return { error: mapFirebaseError(err.code) };
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (err) {
      return { error: mapFirebaseError(err.code) };
    }
  }, []);

  const logout = useCallback(() => signOut(auth), []);

  const loginAsGuest = useCallback(async () => {
    try {
      await signInAnonymously(auth);
      return { success: true };
    } catch (err) {
      return { error: mapFirebaseError(err.code) };
    }
  }, []);

  const saveScore = useCallback((scoreData) => {
    if (!user || user.isGuest) return;
    const entry = { ...scoreData, date: new Date().toLocaleDateString() };
    const userData = loadUserData(user.uid);
    userData.scores = [entry, ...(userData.scores || [])].slice(0, 20);
    userData.stats.gamesPlayed += 1;
    userData.stats.totalScore += scoreData.score;
    userData.stats.bestScore = Math.max(userData.stats.bestScore, scoreData.score);
    userData.stats.totalCorrect += scoreData.correct;
    userData.stats.totalQuestions += scoreData.total;
    saveUserData(user.uid, userData);
    setUser((prev) => ({ ...prev, scores: userData.scores, stats: userData.stats }));

    const lb = JSON.parse(localStorage.getItem('geomaster_leaderboard') || '[]');
    lb.push({ username: user.displayName, ...scoreData, date: new Date().toLocaleDateString() });
    lb.sort((a, b) => b.score - a.score);
    localStorage.setItem('geomaster_leaderboard', JSON.stringify(lb.slice(0, 100)));
  }, [user]);

  const value = useMemo(
    () => ({ user, register, login, logout, loginAsGuest, saveScore }),
    [user, register, login, logout, loginAsGuest, saveScore],
  );

  if (user === undefined) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Loading...</div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
