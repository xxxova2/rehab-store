'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import type { AppLocale } from '@rehab/types';
import styles from './home-product-showcase.module.css';

// Hardcoded featured products — Phase 1 will pull from Medusa
const FEATURED = [
  {
    slug: 'soft-tailoring-dress',
    title: { en: 'Soft Tailoring Dress', ar: 'فستان التفصيل الناعم' },
    subtitle: { en: 'Wool-linen blend', ar: 'مزيج صوف وكتان' },
    price: { en: 'AED 1,290', ar: '١٬٢٩٠ د.إ' },
    color: '#F2D9BC',
    accent: '#D67A8A',
    badge: { en: 'New', ar: 'جديد' },
  },
  {
    slug: 'editorial-slip-dress',
    title: { en: 'Editorial Slip', ar: 'فستان سليب تحريري' },
    subtitle: { en: 'Bias-cut silk satin', ar: 'حرير ساتان بقصة مائلة' },
    price: { en: 'AED 890', ar: '٨٩٠ د.إ' },
    color: '#D67A8A',
    accent: '#F2D9BC',
    badge: { en: 'Bestseller', ar: 'الأكثر مبيعاً' },
  },
  {
    slug: 'lookbook-bone-coat',
    title: { en: 'Bone Coat', ar: 'معطف عاجي' },
    subtitle: { en: 'Double-faced wool', ar: 'صوف وجهين' },
    price: { en: 'AED 1,890', ar: '١٬٨٩٠ د.إ' },
    color: '#E8DCC4',
    accent: '#1A1A1A',
    badge: { en: 'Limited', ar: 'محدود' },
  },
];

function pick<T extends { en: string; ar: string }>(obj: T, locale: AppLocale): string {
  return obj[locale];
}

export function HomeProductShowcase() {
  const locale = (useLocale() as AppLocale) ?? 'ar';
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const shopLabel = locale === 'ar' ? 'تسوّقي الكل' : 'Shop all';

  return (
    <section className={styles.showcase} dir={dir} aria-label={locale === 'ar' ? 'منتجات مميزة' : 'Featured products'}>
      <div className={styles.cards}>
        {FEATURED.map((p, i) => (
          <Link
            key={p.slug}
            href={`/${locale}/product/${p.slug}`}
            className={styles.card}
            style={{ '--card-color': p.color, '--card-accent': p.accent, animationDelay: `${i * 0.12}s` } as React.CSSProperties}
          >
            {/* Color swatch "visual" */}
            <div className={styles.visual} aria-hidden>
              <div
                className={styles.swatch}
                style={{
                  background: `radial-gradient(ellipse at 35% 30%, ${p.color} 0%, ${p.accent}66 55%, #0a082888 100%)`,
                }}
              />
              <span className={styles.badge}>{pick(p.badge, locale)}</span>
            </div>

            {/* Product info */}
            <div className={styles.info}>
              <p className={styles.subtitle}>{pick(p.subtitle, locale)}</p>
              <h3 className={styles.title}>{pick(p.title, locale)}</h3>
              <p className={styles.price}>{pick(p.price, locale)}</p>
            </div>

            {/* Arrow */}
            <span className={styles.arrow} aria-hidden>
              {locale === 'ar' ? '←' : '→'}
            </span>
          </Link>
        ))}
      </div>

      {/* Shop all pill */}
      <Link href={`/${locale}/shop`} className={styles.shopAll}>
        {shopLabel}
        <span aria-hidden> {locale === 'ar' ? '←' : '→'}</span>
      </Link>
    </section>
  );
}
