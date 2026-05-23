import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import i18n from '../i18n/index.js';

const LanguageContext = createContext(null);

export const LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'bn', label: 'Bangla', nativeLabel: 'বাংলা', flag: '🇧🇩', dir: 'ltr' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', flag: '🇪🇸', dir: 'ltr' },
];

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(localStorage.getItem('geomaster_lang') || 'en');

  const changeLanguage = useCallback((code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('geomaster_lang', code);
    setLanguage(code);
    document.documentElement.lang = code;
  }, []);

  const value = useMemo(() => ({ language, changeLanguage, languages: LANGUAGES }), [language, changeLanguage]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
