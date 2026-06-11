import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getProductBySlug, getRelatedProducts } from '@/lib/products';
import { formatPrice } from '@/lib/format';
import { ProductOptions } from '@/components/product-options';
import type { AppLocale, Currency, Product } from '@rehab/types';
import styles from './product.module.css';

function pick(value: { en: string; ar: string }, locale: AppLocale): string {
  return value[locale];
}

export async function generateStaticParams() {
  const { getAllProducts } = await import('@/lib/products');
  const products = await getAllProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Not found' };
  const title = pick(product.title, locale as AppLocale);
  return {
    title: title,
    description: pick(product.description, locale as AppLocale),
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const { cookies } = await import('next/headers');
  const store = await cookies();
  const cookie = store.get('REHAB_CURRENCY')?.value as Currency | undefined;
  const currency: Currency = (cookie && ['AED', 'SAR', 'KWD', 'EGP', 'USD', 'EUR', 'GBP'].includes(cookie))
    ? cookie
    : 'AED';

  const t = await getTranslations('product');
  const tCommon = await getTranslations('common');
  const tNav = await getTranslations('nav');
  const related = await getRelatedProducts(product.id, 4);

  return (
    <article className={styles.page} data-testid="product-page">
      <nav className={styles.crumbs} aria-label="Breadcrumb">
        <a href={`/${locale}`}>{tCommon('appName')}</a>
        <span aria-hidden> / </span>
        <a href={`/${locale}/shop`}>{tNav('shop')}</a>
        <span aria-hidden> / </span>
        <span className={styles.crumbCurrent}>{pick(product.title, locale as AppLocale)}</span>
      </nav>

      <div className={styles.layout}>
        <div className={styles.viewer}>
          {product.images[0] ? (
            <img
              src={product.images[0].url}
              alt={pick(product.images[0].alt, locale as AppLocale)}
              className={styles.productImage}
            />
          ) : (
            <div
              className={styles.cover}
              style={{
                background: `linear-gradient(135deg, ${product.colors[0]?.hex}, color-mix(in srgb, ${product.colors[0]?.hex} 50%, var(--md-sys-color-tertiary)))`,
              }}
            />
          )}
        </div>

        <div className={styles.info}>
          <p className={styles.eyebrow}>{product.category}</p>
          <h1 className={styles.title}>{pick(product.title, locale as AppLocale)}</h1>
          {product.subtitle && (
            <p className={styles.subtitle}>{pick(product.subtitle, locale as AppLocale)}</p>
          )}
          <p className={styles.price}>
            {formatPrice(product.basePriceCents, currency, locale as AppLocale, {
              westernDigits: true,
            })}
          </p>

          <p className={styles.description}>
            {pick(product.description, locale as AppLocale)}
          </p>

          <ProductOptions product={product} locale={locale} />

          {product.materials.length > 0 && (
            <section className={styles.details}>
              <h3 className={styles.detailsTitle}>{t('materials')}</h3>
              <ul className={styles.detailsList}>
                {product.materials.map((m, i) => (
                  <li key={i}>{pick(m, locale as AppLocale)}</li>
                ))}
              </ul>
            </section>
          )}

          {product.care && product.care.length > 0 && (
            <section className={styles.details}>
              <h3 className={styles.detailsTitle}>{t('care')}</h3>
              <ul className={styles.detailsList}>
                {product.care.map((c, i) => (
                  <li key={i}>{pick(c, locale as AppLocale)}</li>
                ))}
              </ul>
            </section>
          )}

          {product.fitNotes && (
            <section className={styles.details}>
              <h3 className={styles.detailsTitle}>{t('fitNotes')}</h3>
              <p className={styles.fitNotes}>
                {pick(product.fitNotes, locale as AppLocale)}
              </p>
            </section>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className={styles.related}>
          <h2 className={styles.relatedTitle}>{tCommon('viewMore')}</h2>
          <ul className={styles.relatedList}>
            {related.map((p: Product) => (
              <li key={p.id}>
                <a
                  href={`/${locale}/product/${p.slug}`}
                  className={styles.relatedLink}
                >
                  <div
                    className={styles.relatedCover}
                    style={{
                      background: `linear-gradient(135deg, ${p.colors[0]?.hex}, color-mix(in srgb, ${p.colors[0]?.hex} 50%, var(--md-sys-color-tertiary)))`,
                    }}
                  />
                  <span className={styles.relatedName}>
                    {pick(p.title, locale as AppLocale)}
                  </span>
                  <span className={styles.relatedPrice}>
                    {formatPrice(p.basePriceCents, currency, locale as AppLocale, {
                      westernDigits: true,
                    })}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
