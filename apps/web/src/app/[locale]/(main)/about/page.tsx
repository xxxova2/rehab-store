import { getTranslations, setRequestLocale } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });
  return { title: t('title') };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('about');
  return (
    <section className="section" data-testid="about-page" style={{ maxWidth: 760 }}>
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          fontSize: '0.72rem',
          color: 'var(--md-sys-color-on-surface-variant)',
        }}
      >
        {t('title')}
      </p>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2rem, 5vw, 3.25rem)',
          margin: '0.5rem 0 1.5rem',
          fontWeight: 500,
          letterSpacing: '-0.015em',
          textWrap: 'balance',
        }}
      >
        {t('headline')}
      </h2>
      <p
        style={{
          fontSize: '1.05rem',
          lineHeight: 1.8,
          color: 'var(--md-sys-color-on-surface-variant)',
        }}
      >
        {t('p1')}
      </p>
      <p
        style={{
          fontSize: '1.05rem',
          lineHeight: 1.8,
          color: 'var(--md-sys-color-on-surface-variant)',
        }}
      >
        {t('p2')}
      </p>
    </section>
  );
}
