'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useTransition } from 'react';
import { Link, useRouter } from '../../i18n/routing';
import { LOCALE_FLAGS } from '../../i18n/routing';
import type { AppHref } from '../../i18n/routing';
import { CartCount } from './cart-count';
import type { AppLocale } from '@rehab/types';
import styles from './home-tab-nav.module.css';

const TABS = [
  { key: 'home' as const, href: '/' as const },
  { key: 'shop' as const, href: '/shop' as const },
  { key: 'about' as const, href: '/about' as const },
];

export function HomeTabNav() {
  const locale = (useLocale() as AppLocale) ?? 'ar';
  const t = useTranslations('nav');
  const pathname = usePathname();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const path = pathname.replace(/^\/(ar|en)/, '') || '/';
  const activeKey = TABS.find((tab) => path === tab.href)?.key ?? 'home';

  return (
    <header className={styles.header} dir={dir} data-testid="top-bar">
      <Link href="/" className={styles.brand} aria-label={t('homeAria')}>
        {t('brand')}
      </Link>

      <nav className={styles.tabBar} aria-label={t('primary')} role="navigation">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            className={styles.tab}
            data-active={tab.key === activeKey}
          >
            {t(tab.key)}
          </Link>
        ))}
      </nav>

      <div className={styles.actions}>
        <Link href="/admin/login" className={styles.loginBtn}>
          {t('login')}
        </Link>
        <Link href="/cart" className={styles.cartBtn} data-testid="cart-link">
          <CartCount />
          <span>{t('cart')}</span>
        </Link>
        <LangToggle locale={locale} />
      </div>
    </header>
  );
}

function LangToggle({ locale }: { locale: AppLocale }) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const nextLocale: AppLocale = locale === 'ar' ? 'en' : 'ar';

  const handleToggle = () => {
    startTransition(() => {
      const path = pathname.replace(/^\/(ar|en)/, '') || '/';
      router.replace(path as AppHref, { locale: nextLocale });
    });
  };

  return (
    <button
      type="button"
      className={styles.langToggle}
      onClick={handleToggle}
      aria-label={`Switch to ${nextLocale === 'en' ? 'English' : 'العربية'}`}
    >
      {LOCALE_FLAGS[nextLocale]}
    </button>
  );
}
