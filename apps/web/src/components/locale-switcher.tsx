'use client';

import { useTransition } from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from '../../i18n/routing';
import { routing, type AppLocale, LOCALE_LABELS } from '../../i18n/routing';
import type { AppHref } from '../../i18n/routing';
import styles from './locale-switcher.module.css';

export function LocaleSwitcher({ current }: { current: AppLocale }) {
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const handleSwitch = (next: AppLocale) => {
    if (next === current) return;
    startTransition(() => {
      const path = pathname.replace(/^\/(ar|en)/, '') || '/';
      router.replace(path as AppHref, { locale: next });
    });
  };

  return (
    <div
      className={styles.switcher}
      role="group"
      aria-label="Language"
      data-testid="locale-switcher"
    >
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          className={styles.option}
          data-active={loc === current}
          aria-pressed={loc === current}
          onClick={() => handleSwitch(loc)}
          data-locale={loc}
        >
          {LOCALE_LABELS[loc]}
        </button>
      ))}
    </div>
  );
}
