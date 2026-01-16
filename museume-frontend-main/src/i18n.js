// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import Japanese translations
import jaTranslation from './locales/ja/translation.json';

// Define English translations (you can create a separate file for this too)

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ja: {
        translation: jaTranslation
      }
    },
    lng: localStorage.getItem('language') || 'ja', // get from localStorage or default to Japanese
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;