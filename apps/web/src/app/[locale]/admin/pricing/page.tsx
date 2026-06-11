import { getTranslations } from 'next-intl/server';

export default async function PricingPage() {
  const t = await getTranslations('admin.pricing');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '2rem' }}>
      <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>{'\u{1F4B0}'}</span>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 0.5rem' }}>{t('title') ?? 'Pricing'}</h2>
      <p style={{ color: 'var(--md-sys-color-on-surface-variant)', margin: 0 }}>Coming soon</p>
    </div>
  );
}
