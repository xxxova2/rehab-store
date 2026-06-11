import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getCurrentCurrency } from '@/lib/currency-server';
import { CartContent } from '@/components/cart-content';
import type { AppLocale, Currency } from '@rehab/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'cart' });
  return { title: t('title') };
}

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('cart');
  const currency = await getCurrentCurrency(locale as AppLocale);

  return (
    <section className="section" data-testid="cart-page">
      <div className="section__head">
        <h2 className="section__title">{t('title')}</h2>
        <p style={{ color: 'var(--md-sys-color-on-surface-variant)', margin: 0 }}>
          {t('lede')}
        </p>
      </div>
      <CartContent locale={locale} currency={currency as Currency} />
    </section>
  );
}
