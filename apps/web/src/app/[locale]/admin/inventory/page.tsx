import { getTranslations } from 'next-intl/server';

export default async function InventoryPage() {
  const t = await getTranslations('admin.inventory');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '2rem' }}>
      <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>{'\u{1F4E6}'}</span>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 0.5rem' }}>{t('title') ?? 'Inventory'}</h2>
      <p style={{ color: 'var(--md-sys-color-on-surface-variant)', margin: 0 }}>Coming soon</p>
    </div>
  );
}
