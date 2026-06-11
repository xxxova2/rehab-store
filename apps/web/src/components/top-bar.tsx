import { getTranslations } from 'next-intl/server';
import { ThemeSwitcher } from './theme-switcher';
import { LocaleSwitcher } from './locale-switcher';
import { CurrencySwitcher } from './currency-switcher';
import { Link } from '../../i18n/routing';
import { CartCount } from './cart-count';
import type { AppLocale, Currency } from '@rehab/types';
import styles from './top-bar.module.css';

type NavItem = {
  key: 'shop' | 'new' | 'dresses' | 'tops' | 'lookbook' | 'about';
  pathname: '/shop' | '/lookbook' | '/about';
  query?: { cat?: string };
};

const NAV: NavItem[] = [
  { key: 'shop', pathname: '/shop' },
  { key: 'new', pathname: '/shop', query: { cat: 'new' } },
  { key: 'dresses', pathname: '/shop', query: { cat: 'dresses' } },
  { key: 'tops', pathname: '/shop', query: { cat: 'tops' } },
  { key: 'lookbook', pathname: '/lookbook' },
  { key: 'about', pathname: '/about' },
];

export async function TopBar({
  locale,
  currency,
}: {
  locale: AppLocale;
  currency: Currency;
}) {
  const t = await getTranslations('nav');

  return (
    <header className={styles.topbar} data-testid="top-bar">
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label={t('homeAria')}>
          <span className={styles.brandMark}>R</span>
          <span className={styles.brandWord}>rehab</span>
          <span className={styles.brandTag}>store</span>
        </Link>

        <nav className={styles.nav} aria-label={t('primary')}>
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={
                item.query
                  ? { pathname: item.pathname, query: item.query }
                  : { pathname: item.pathname }
              }
              className={styles.navLink}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className={styles.right}>
          <CurrencySwitcher current={currency} locale={locale} />
          <LocaleSwitcher current={locale} />
          <ThemeSwitcher />
          <Link href="/cart" className={styles.cart} aria-label={t('cart')}>
            <span aria-hidden>·</span>
            <span className={styles.cartLabel}>{t('cart')}</span>
            <CartCount />
          </Link>
        </div>
      </div>
    </header>
  );
}
