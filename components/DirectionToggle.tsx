'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

export default function DirectionToggle() {
  const { t } = useTranslation();
  const [dir, setDir] = useState<'rtl' | 'ltr'>(() =>
    typeof document !== 'undefined' && document.documentElement.dir === 'ltr'
      ? 'ltr'
      : 'rtl',
  );

  useEffect(() => {
    document.documentElement.dir = dir;
    localStorage.setItem('dir', dir);
  }, [dir]);

  useEffect(() => {
    const saved =
      typeof localStorage !== 'undefined' ? localStorage.getItem('dir') : null;
    if (saved === 'ltr' || saved === 'rtl') {
      setDir(saved);
    }
  }, []);

  return (
    <button
      type="button"
      onClick={() => setDir(dir === 'rtl' ? 'ltr' : 'rtl')}
      className="fixed top-2 end-2 btn btn-ghost h-8 px-3"
      aria-label={t('toggleDir')}
    >
      {dir === 'rtl' ? 'LTR' : 'RTL'}
    </button>
  );
}
