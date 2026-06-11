'use client';

import { useTranslations } from 'next-intl';
import { useTheme, type ThemeMode } from './theme-provider';
import styles from './theme-switcher.module.css';

export function ThemeSwitcher() {
  const t = useTranslations('theme');
  const { theme, setTheme } = useTheme();
  return (
    <div
      className={styles.switcher}
      role="radiogroup"
      aria-label={t('label')}
      data-testid="theme-switcher"
    >
      {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
        <button
          key={mode}
          type="button"
          role="radio"
          aria-checked={theme === mode}
          className={styles.option}
          data-active={theme === mode}
          data-theme-value={mode}
          onClick={() => setTheme(mode)}
        >
          {t(mode)}
        </button>
      ))}
    </div>
  );
}
