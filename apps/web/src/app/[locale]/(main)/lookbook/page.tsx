import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getAllProducts, getAllCollections } from '@/lib/products';
import type { AppLocale } from '@rehab/types';
import { Link } from '@/../i18n/routing';

function pick(value: { en: string; ar: string }, locale: AppLocale): string {
  return value[locale];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'lookbook' });
  return { title: t('title') };
}

export default async function LookbookPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('lookbook');
  const products = await getAllProducts();
  const collections = await getAllCollections();

  const lookbookCollection = collections.find((c) => c.slug === 'lookbook-01');
  const lookbookProducts = lookbookCollection
    ? products.filter((p) => lookbookCollection.productIds.includes(p.id))
    : [];
  const otherProducts = products.filter((p) => !lookbookCollection?.productIds.includes(p.id));

  return (
    <section className="section" data-testid="lookbook-page">
      <style>{`.lookbook-card:hover { transform: scale(1.02); }`}</style>
      <div className="section__head">
        <h2 className="section__title">{t('title')}</h2>
        <p style={{ color: 'var(--md-sys-color-on-surface-variant)', margin: 0 }}>
          {lookbookCollection ? pick(lookbookCollection.description, locale as AppLocale) : t('lede')}
        </p>
      </div>

      {lookbookProducts.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {lookbookProducts.map((product, i) => (
            <Link
              key={product.id}
              href={{ pathname: '/product/[slug]', params: { slug: product.slug } }}
              style={{
                display: 'block',
                textDecoration: 'none',
                color: 'inherit',
                gridColumn: i === 0 ? '1 / -1' : undefined,
              }}
            >
              <div
                className="lookbook-card"
                style={{
                  aspectRatio: i === 0 ? '16 / 9' : '3 / 4',
                  borderRadius: 'var(--radius-lg)',
                  background: `linear-gradient(135deg, ${product.colors[0]?.hex ?? '#1A1A1A'}, color-mix(in srgb, ${product.colors[0]?.hex ?? '#1A1A1A'} 50%, var(--md-sys-color-tertiary)))`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '1.5rem',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 300ms ease',
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.6)',
                  marginBottom: '0.25rem',
                }}>
                  {t('lookLabel')} {String(i + 1).padStart(2, '0')}
                </span>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.35rem',
                  fontWeight: 500,
                  color: '#fff',
                  margin: 0,
                  textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}>
                  {pick(product.title, locale as AppLocale)}
                </h3>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                  color: 'rgba(255,255,255,0.7)',
                  margin: '0.25rem 0 0',
                }}>
                  {product.subtitle ? pick(product.subtitle, locale as AppLocale) : ''}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {otherProducts.length > 0 && (
        <>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            fontWeight: 500,
            marginBottom: '1.25rem',
          }}>
            More looks
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {otherProducts.map((product, i) => (
              <Link
                key={product.id}
                href={{ pathname: '/product/[slug]', params: { slug: product.slug } }}
                style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
              >
                <div
                  className="lookbook-card"
                  style={{
                    aspectRatio: '3 / 4',
                    borderRadius: 'var(--radius-md)',
                    background: `linear-gradient(135deg, ${product.colors[0]?.hex ?? '#1A1A1A'}, color-mix(in srgb, ${product.colors[0]?.hex ?? '#1A1A1A'} 50%, var(--md-sys-color-tertiary)))`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: '1rem',
                    transition: 'transform 300ms ease',
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.5)',
                    marginBottom: '0.25rem',
                  }}>
                    {t('lookLabel')} {String(lookbookProducts.length + i + 1).padStart(2, '0')}
                  </span>
                  <h4 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1rem',
                    fontWeight: 500,
                    color: '#fff',
                    margin: 0,
                    textShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  }}>
                    {pick(product.title, locale as AppLocale)}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
