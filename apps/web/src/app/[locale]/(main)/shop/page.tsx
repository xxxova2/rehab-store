import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ProductGrid } from '@/components/product-grid';
import type { AppLocale, Currency } from '@rehab/types';

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
  searchParams: Promise<{ cat?: string }>;
}) {
  const { locale } = await params;
  const { cat } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('shop');

  const { cookies } = await import('next/headers');
  const store = await cookies();
  const cookie = store.get('REHAB_CURRENCY')?.value as Currency | undefined;
  const currency: Currency = (cookie && ['AED', 'SAR', 'KWD', 'EGP', 'USD', 'EUR', 'GBP'].includes(cookie))
    ? cookie
    : 'AED';

  return (
    <section className="section" data-testid="shop-page">
      <div className="section__head">
        <h2 className="section__title">{t('title')}</h2>
        <p style={{ color: 'var(--md-sys-color-on-surface-variant)', margin: 0 }}>
          {t('lede')}
        </p>
      </div>
      <ProductGrid locale={locale as AppLocale} currency={currency} category={cat} />
    </section>
  );
}
