'use client';

import { useLocale } from 'next-intl';
import { LocaleSwitcher } from './locale-switcher';
import { ThemeSwitcher } from './theme-switcher';
import { Link } from '../../i18n/routing';
import type { AppLocale } from '@rehab/types';
import styles from './home-tab-nav.module.css';

const COPY = {
  en: {
    brand: 'rehab.',
    home: 'Home',
    shop: 'Shop',
    lookbook: 'Lookbook',
    about: 'About',
    login: 'Log in',
    cart: 'Cart',
  },
  ar: {
    brand: 'رحاب',
    home: 'الرئيسية',
    shop: 'المتجر',
    lookbook: 'لوك بوك',
    about: 'من نحن',
    login: 'تسجيل الدخول',
    cart: 'السلة',
  },
} as const;

const TABS = [
  { key: 'home' as const, href: '/' as const },
  { key: 'shop' as const, href: '/shop' as const },
  { key: 'lookbook' as const, href: '/lookbook' as const },
  { key: 'about' as const, href: '/about' as const },
];

export function HomeTabNav() {
  const locale = (useLocale() as AppLocale) ?? 'ar';
  const t = COPY[locale] ?? COPY.en;
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <header className={styles.header} dir={dir} data-testid="top-bar">
      {/* Brand wordmark */}
      <Link href="/" className={styles.brand} aria-label={t.home}>
        {t.brand}
      </Link>

      {/* Tab bar — the main nav items as pills */}
      <nav className={styles.tabBar} aria-label="primary navigation" role="navigation">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            className={styles.tab}
            data-active={tab.key === 'home'}
          >
            {t[tab.key]}
          </Link>
        ))}
      </nav>

      {/* Right side controls */}
      <div className={styles.actions}>
        <LocaleSwitcher current={locale} />
        <ThemeSwitcher />
        <Link href="/admin/login" className={styles.loginBtn}>
          {t.login}
        </Link>
        <Link href="/cart" className={styles.cartBtn} data-testid="cart-link">
          <span aria-hidden>·</span>
          <span>{t.cart}</span>
        </Link>
      </div>
    </header>
  );
}
