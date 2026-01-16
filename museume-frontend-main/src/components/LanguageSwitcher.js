// components/LanguageSwitcher.js
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ja' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  return (
    <div className="nav-language-switcher">
      <button 
        className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
        onClick={() => i18n.language !== 'en' && toggleLanguage()}
      >
        EN
      </button>
      <span className="lang-separator">|</span>
      <button 
        className={`lang-btn ${i18n.language === 'ja' ? 'active' : ''}`}
        onClick={() => i18n.language !== 'ja' && toggleLanguage()}
      >
        JP
      </button>
    </div>
  );
};

export default LanguageSwitcher;