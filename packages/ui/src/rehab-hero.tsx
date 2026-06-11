'use client';

import { useLocale } from 'next-intl';
import Link from 'next/link';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { ThemeSwitcher } from '@/components/theme-switcher';
import type { AppLocale } from '@rehab/types';
import styles from './rehab-hero.module.css';

const COPY = {
  en: {
    brand: 'rehab.',
    home: 'Home',
    shop: 'Shop',
    lookbook: 'Lookbook',
    about: 'About',
    cart: 'Cart',
    social: 'Loved by 2,700+ women',
    headline: 'Wear the recovery.',
    sub: 'Editorial womenswear built around the rituals of getting dressed on the other side of something. Bone-and-rose palette, 3D garment viewer, AR try-on.',
    ctaLabel: 'Shop the drop',
    ctaTitle: 'New season — now live',
    ctaMeta: 'SS26 · REHAB',
    tag: 'New Season',
    login: 'Log in',
  },
  ar: {
    brand: 'رحاب',
    home: 'الرئيسية',
    shop: 'المتجر',
    lookbook: 'لوك بوك',
    about: 'من نحن',
    cart: 'السلة',
    social: 'محبوب لدى +2,700 سيدة',
    headline: 'ارتدي التأهيل.',
    sub: 'أزياء نسائية تحريرية مبنية على طقوس الارتداء بعد التعافي. لوحة عاج ووردي، عارض ثلاثي الأبعاد، تجربة واقع معزز.',
    ctaLabel: 'تسوّقي الإصدار',
    ctaTitle: 'الموسم الجديد — متاح الآن',
    ctaMeta: 'SS26 · رحاب',
    tag: 'الموسم الجديد',
    login: 'تسجيل الدخول',
  },
} as const;

const NAV = [
  { key: 'home' as const, href: '/' as const },
  { key: 'shop' as const, href: '/shop' as const },
  { key: 'lookbook' as const, href: '/lookbook' as const },
  { key: 'about' as const, href: '/about' as const },
];

export function RehabHero() {
  const locale = (useLocale() as 'en' | 'ar') ?? 'en';
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const t = COPY[locale] ?? COPY.en;
  const localeTag = locale as AppLocale;

  return (
    <section className={styles.rehabHero} dir={dir} data-testid="rehab-hero">
      <div className={styles.glass}>
        {/* Top glass nav, rendered as a client component to avoid
            pulling the server-only FloatingGlassNav into a 'use client' tree. */}
        <nav className={styles.nav} aria-label={t.brand}>
          <Link href="/" className={styles.brand} aria-label={t.home}>
            {t.brand}
          </Link>

          <ul className={styles.links}>
            {NAV.map((item) => (
              <li key={item.key}>
                <Link href={item.href} className={styles.link}>
                  {t[item.key]}
                </Link>
              </li>
            ))}
          </ul>

          <div className={styles.controls}>
            <LocaleSwitcher current={localeTag} />
            <ThemeSwitcher />
            <Link href="/admin/login" className={styles.login}>
              {t.login}
            </Link>
            <Link href="/cart" className={styles.cart} data-testid="floating-nav-cart">
              <span className={styles.cartDot} aria-hidden>·</span>
              <span>{t.cart}</span>
            </Link>
          </div>
        </nav>

        <div className={styles.left}>
          <div className={styles.socialProof} role="note" aria-label={t.social}>
            <span className={styles.stars} aria-hidden>
              <Star />
              <Star />
              <Star />
              <Star />
              <Star />
            </span>
            <span>{t.social}</span>
          </div>

          <h1 className={styles.headline}>{t.headline}</h1>
          <p className={styles.sub}>{t.sub}</p>
        </div>

        <div className={styles.right} aria-hidden>
          <div className={styles.rightContent} />
        </div>

        <Link
          href={`/${locale}/shop`}
          className={styles.cta}
          data-testid="home-cta"
        >
          <span className={styles.ctaTitle}>{t.ctaLabel}</span>
          <span className={styles.ctaMeta}>
            <span className={styles.ctaTag}>
              {t.ctaMeta}
            </span>
            <span className={styles.ctaTagDot} aria-hidden />
          </span>
        </Link>
      </div>
    </section>
  );
}

function Star() {
  return (
    <svg
      className={styles.star}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      focusable="false"
    >
      <path d="M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.58L12 17.77l-5.9 3.1 1.13-6.58L2.45 9.44l6.6-.96L12 2.5z" />
    </svg>
  );
}

export const RehabHeroDemo = RehabHero;
