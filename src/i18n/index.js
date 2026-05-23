import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import bn from './bn.json';
import es from './es.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    bn: { translation: bn },
    es: { translation: es },
  },
  lng: localStorage.getItem('geomaster_lang') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
