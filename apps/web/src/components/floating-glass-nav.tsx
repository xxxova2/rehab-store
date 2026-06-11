import { getTranslations } from 'next-intl/server';
import { Link } from '../../i18n/routing';
import { CartCount } from './cart-count';
import { ThemeSwitcher } from './theme-switcher';
import { LocaleSwitcher } from './locale-switcher';
import { CurrencySwitcher } from './currency-switcher';
import type { AppLocale, Currency } from '@rehab/types';
import styles from './floating-glass-nav.module.css';

const NAV = [
  { key: 'home' as const, href: '/' as const },
  { key: 'shop' as const, href: '/shop' as const },
  { key: 'lookbook' as const, href: '/lookbook' as const },
  { key: 'about' as const, href: '/about' as const },
];

export async function FloatingGlassNav({
  locale,
  currency,
}: {
  locale: AppLocale;
  currency: Currency;
}) {
  const t = await getTranslations('floatingNav');

  return (
    <header className={styles.nav} data-testid="floating-glass-nav">
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label={t('homeAria')}>
          {t('brand')}
        </Link>

        <nav aria-label={t('primary')}>
          <ul className={styles.links}>
            {NAV.map((item) => (
              <li key={item.key}>
                <Link href={item.href} className={styles.link}>
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.controls}>
          <CurrencySwitcher current={currency} locale={locale} />
          <LocaleSwitcher current={locale} />
          <ThemeSwitcher />
          <Link href="/cart" className={styles.cart} data-testid="floating-nav-cart">
            <span className={styles.cartDot} aria-hidden>·</span>
            <span>{t('cart')}</span>
            <CartCount />
          </Link>
        </div>
      </div>
    </header>
  );
}
