import { getTranslations } from 'next-intl/server';
import { getStoreSettings } from './actions';
import { SettingsForm } from './SettingsForm';
import styles from './settings.module.css';

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('admin.settings');
  const settings = await getStoreSettings();

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>{t('title')}</h2>
      <p className={styles.subtitle}>{t('subtitle')}</p>
      <SettingsForm locale={locale} settings={settings} />
    </div>
  );
}
