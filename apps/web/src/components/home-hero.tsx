import { getTranslations } from 'next-intl/server';
import { Link } from '../../i18n/routing';
import styles from './home-hero.module.css';

const STAR_PATH =
  'M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.58L12 17.77l-5.9 3.1 1.13-6.58L2.45 9.44l6.6-.96L12 2.5z';

function Star({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      focusable="false"
    >
      <path d={STAR_PATH} />
    </svg>
  );
}

export async function HomeHero() {
  const t = await getTranslations('home');

  return (
    <section className={styles.hero} data-testid="home-hero">
      <div className={styles.bg} aria-hidden>
        <div className={`${styles.glow} ${styles.glowOne}`} />
        <div className={`${styles.glow} ${styles.glowTwo}`} />
      </div>

      <div className={styles.content}>
        <div className={styles.left}>
          <div
            className={styles.socialProof}
            role="img"
            aria-label={t('starsAria')}
          >
            <span className={styles.stars} aria-hidden>
              <Star className={styles.star} />
              <Star className={styles.star} />
              <Star className={styles.star} />
              <Star className={styles.star} />
              <Star className={styles.star} />
            </span>
            <span>{t('socialProof')}</span>
          </div>

          <h1 className={styles.headline}>{t('headline')}</h1>

          <p className={styles.sub}>{t('sub')}</p>

          <Link href="/shop" className={styles.cta} data-testid="home-cta">
            <span>{t('ctaPrimary')}</span>
            <span className={styles.ctaIcon} aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="M13 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
        </div>

        <div className={styles.right} aria-hidden>
          <div className={styles.orbWrap}>
            <video
              className={styles.orb}
              src="https://future.co/images/homepage/glassy-orb/orb-purple.webm"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
