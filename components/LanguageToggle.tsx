'use client';

import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

export default function LanguageToggle() {
  const { i18n, t } = useTranslation();
  const toggle = () => {
    const next = i18n.language === 'he' ? 'en' : 'he';
    i18n.changeLanguage(next);
    localStorage.setItem('lang', next);
  };
  return (
    <button
      type="button"
      onClick={toggle}
      className="fixed top-2 end-20 btn btn-ghost h-8 px-3"
      aria-label={t('toggleLang')}
    >
      {i18n.language === 'he' ? 'EN' : 'HE'}
    </button>
  );
}
