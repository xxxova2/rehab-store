import { getTranslations } from 'next-intl/server';
import { Link } from '../../../i18n/routing';

export default async function NotFound() {
  const t = await getTranslations('notFound');
  return (
    <section className="section" style={{ textAlign: 'center', padding: '8rem 1.5rem' }}>
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.2em',
          color: 'var(--md-sys-color-on-surface-variant)',
        }}
      >
        {t('title')}
      </p>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          margin: '0.5rem 0 1rem',
          fontWeight: 500,
        }}
      >
        {t('headline')}
      </h2>
      <p style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>{t('body')}</p>
      <p style={{ marginTop: '1.5rem' }}>
        <Link href="/" style={{ color: 'var(--md-sys-color-primary)' }}>
          {t('backHome')}
        </Link>
      </p>
    </section>
  );
}
