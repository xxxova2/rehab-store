'use client';

import { useTransition } from 'react';
import { useRouter } from '../../i18n/routing';
import { CURRENCIES, CURRENCY_LABELS } from '@/lib/format';
import type { Currency, AppLocale } from '@rehab/types';
import styles from './currency-switcher.module.css';

export function CurrencySwitcher({
  current,
  locale,
}: {
  current: Currency;
  locale: AppLocale;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const handle = (next: Currency) => {
    if (next === current) return;
    document.cookie = `REHAB_CURRENCY=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div
      className={styles.switcher}
      role="group"
      aria-label="Currency"
      data-testid="currency-switcher"
    >
      {CURRENCIES.map((c) => (
        <button
          key={c}
          type="button"
          className={styles.option}
          data-active={c === current}
          aria-pressed={c === current}
          onClick={() => handle(c)}
          data-currency={c}
        >
          {c}
        </button>
      ))}
      <span className={styles.label} aria-hidden>
        {CURRENCY_LABELS[current][locale]}
      </span>
    </div>
  );
}
