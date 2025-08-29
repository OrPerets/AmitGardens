import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import he from '@/locales/he.json';
import en from '@/locales/en.json';

const lng =
  typeof window !== 'undefined' ? localStorage.getItem('lang') || 'he' : 'he';

i18n.use(initReactI18next).init({
  resources: {
    he: { translation: he },
    en: { translation: en },
  },
  lng,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
