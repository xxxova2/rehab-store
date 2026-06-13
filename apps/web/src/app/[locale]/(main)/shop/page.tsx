import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getAllProducts, getAllCollections } from '@/lib/products';
import { getCurrentCurrency } from '@/lib/currency-server';
import { Link } from '../../../../../i18n/routing';
import { ProductCard } from '@/components/product-card';
import type { AppLocale, Currency } from '@rehab/types';
import styles from './shop.module.css';

function pick(value: { en: string; ar: string } | undefined, locale: AppLocale, fallback = ''): string {
  if (!value) return fallback;
  return value[locale] ?? value.en ?? fallback;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'shop' });
  return { title: t('title') };
}

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ collection?: string }>;
}) {
  const { locale } = await params;
  const { collection } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('shop');
  const currency = await getCurrentCurrency(locale as AppLocale);

  const allProducts = await getAllProducts();
  const allCollections = await getAllCollections();

  const products = collection
    ? allProducts.filter((p) => p.collection === collection)
    : allProducts;

  return (
    <section className="section" data-testid="shop-page">
      <div className="section__head">
        <h2 className="section__title">{t('title')}</h2>
        <p style={{ color: 'var(--md-sys-color-on-surface-variant)', margin: 0 }}>
          {t('lede')}
        </p>
      </div>

      <div className={styles.filterBar}>
        <Link
          href="/shop"
          className={`${styles.filterBtn} ${!collection ? styles.filterActive : ''}`}
        >
          {t('filterAll')}
        </Link>
        {allCollections.map((col) => {
          const isActive = collection === col.slug;
          return (
            <Link
              key={col.slug}
              // @ts-expect-error — next-intl Href doesn't type query strings, but they work at runtime
              href={isActive ? '/shop' : `/shop?collection=${col.slug}`}
              className={`${styles.filterBtn} ${isActive ? styles.filterActive : ''}`}
            >
              {pick(col.title, locale as AppLocale)}
            </Link>
          );
        })}
      </div>

      <div className={styles.grid}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            locale={locale as AppLocale}
            currency={currency}
            viewLabel={t('view')}
          />
        ))}
      </div>
    </section>
  );
}
