import { getTranslations } from 'next-intl/server';
import styles from './trusted-by-footer.module.css';

const LOGOS = [
  { id: 'vogue', file: '/logos/vogue.svg' },
  { id: 'elle', file: '/logos/elle.svg' },
  { id: 'harpers', file: '/logos/harpers.svg' },
  { id: 'another', file: '/logos/another.svg' },
  { id: 'dazed', file: '/logos/dazed.svg' },
] as const;

export async function TrustedByFooter() {
  const t = await getTranslations('trustedBy');

  return (
    <section className={styles.footer} data-testid="trusted-by-footer">
      <div className={styles.inner}>
        <p className={styles.title}>{t('title')}</p>
        <div className={styles.logos} role="list" aria-label={t('logosAlt')}>
          {LOGOS.map((logo) => (
            <span
              key={logo.id}
              className={styles.logo}
              role="listitem"
              aria-label={logo.id}
            >
              <img src={logo.file} alt="" loading="lazy" />
            </span>
          ))}
        </div>

        <div className={styles.social}>
          <a
            href="https://www.facebook.com/rehab.kamal.3762"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
            aria-label="Facebook"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
