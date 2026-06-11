import { getTranslations } from 'next-intl/server';
import { getStoreSettings } from './actions';
import { SettingsForm } from './SettingsForm';

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('admin.settings');
  const settings = await getStoreSettings();

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 0.25rem' }}>{t('title')}</h2>
      <p style={{ color: 'var(--md-sys-color-on-surface-variant)', margin: '0 0 1.5rem', fontSize: '0.875rem' }}>
        {t('subtitle')}
      </p>
      <SettingsForm locale={locale} settings={settings} />
    </div>
  );
}
