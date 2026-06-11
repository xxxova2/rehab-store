import { Link } from '../../i18n/routing';
import { formatPrice } from '@/lib/format';
import type { Product, AppLocale, Currency } from '@rehab/types';
import styles from './product-card.module.css';

export function ProductCard({
  product,
  locale,
  currency,
  viewLabel = 'View',
}: {
  product: Product;
  locale: AppLocale;
  currency: Currency;
  viewLabel?: string;
}) {
  return (
    <article className={styles.card}>
      <div
        className={styles.cover}
        style={{
          background: `linear-gradient(135deg, ${product.colors[0]?.hex ?? '#1A1A1A'}, ${product.colors[1]?.hex ?? product.colors[0]?.hex ?? '#1A1A1A'})`,
        }}
      />
      <div className={styles.info}>
        <h3 className={styles.titleAr}>{product.title.ar}</h3>
        <p className={styles.titleEn}>{product.title.en}</p>
        <p className={styles.price}>
          {formatPrice(product.basePriceCents, currency, locale, { westernDigits: true })}
        </p>
        <Link
          href={{ pathname: '/product/[slug]', params: { slug: product.slug } }}
          className={styles.viewBtn}
        >
          {viewLabel}
        </Link>
      </div>
    </article>
  );
}
