import { Link } from '../../i18n/routing';
import { getAllProducts } from '@/lib/products';
import { formatPrice } from '@/lib/format';
import type { AppLocale, Currency, Category } from '@rehab/types';
import { getTranslations } from 'next-intl/server';
import styles from './product-grid.module.css';

function pick(value: { en: string; ar: string }, locale: AppLocale): string {
  return value[locale];
}

const VALID_CATEGORIES: Category[] = ['dresses', 'tops', 'bottoms', 'knitwear', 'outerwear', 'accessories', 'shoes'];

export async function ProductGrid({
  locale,
  currency,
  category,
}: {
  locale: AppLocale;
  currency: Currency;
  category?: string;
}) {
  const allProducts = await getAllProducts();
  const t = await getTranslations('product');

  const products = category === 'new'
    ? allProducts.filter((p) => {
        const created = new Date(p.createdAt);
        const daysAgo = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
        return daysAgo <= 60;
      })
    : category && VALID_CATEGORIES.includes(category as Category)
      ? allProducts.filter((p) => p.category === category)
      : allProducts;

  return (
    <div className={styles.grid} data-testid="product-grid">
      {products.map((p) => {
        const colors = p.colors.length;
        const sizes = p.sizes.length;
        return (
          <Link
            key={p.id}
            href={{ pathname: '/product/[slug]', params: { slug: p.slug } }}
            className={styles.card}
            data-testid={`product-card-${p.slug}`}
          >
            <div
              className={styles.cover}
              style={{
                background: `linear-gradient(135deg, ${p.colors[0]?.hex ?? '#1A1A1A'}, color-mix(in srgb, ${p.colors[0]?.hex ?? '#1A1A1A'} 60%, var(--md-sys-color-tertiary)))`,
              }}
              aria-hidden
            />
            <div className={styles.meta}>
              <p className={styles.eyebrow}>
                {pick(p.title, locale).split(' ').slice(-1)[0]}
              </p>
              <h3 className={styles.title}>{pick(p.title, locale)}</h3>
              <p className={styles.subtitle}>
                {p.subtitle ? pick(p.subtitle, locale) : ''}
              </p>
              <div className={styles.row}>
                <span className={styles.price}>
                  {formatPrice(p.basePriceCents, currency, locale, { westernDigits: true })}
                </span>
                <span className={styles.meta2}>
                  {colors} {t('colors')} · {sizes} {t('sizes')}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
