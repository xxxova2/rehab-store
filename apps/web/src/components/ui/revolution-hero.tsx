import Image from 'next/image';
import { FloatingGlassNav } from '@/components/floating-glass-nav';
import { getLocale } from 'next-intl/server';
import { getCurrentCurrency } from '@/lib/currency-server';

const COPY = {
  ar: { cta: 'تسوّقي الآن', lookbook: 'لوك بوك', tag: 'مجموعة جديدة' },
  en: { cta: 'Shop Now', lookbook: 'Lookbook', tag: 'New Season' },
} as const;

export async function Component() {
  const locale = ((await getLocale()) as 'ar' | 'en') ?? 'en';
  const currency = await getCurrentCurrency(locale);
  const t = COPY[locale] ?? COPY.en;

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100svh',
        overflow: 'hidden',
        background: '#1e1b4b',
        direction: locale === 'ar' ? 'rtl' : 'ltr',
        isolation: 'isolate',
      }}
    >
      {/* 3D-text background image */}
      <Image
        src="/hero-3dtext.jpg"
        alt="Rehab Store 3D glass world"
        fill
        priority
        sizes="100vw"
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
          zIndex: 0,
        }}
      />

      {/* Subtle darken + indigo wash so glass UI on top stays readable */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background:
            'linear-gradient(180deg, rgba(30,27,75,0.45) 0%, rgba(46,36,190,0.25) 45%, rgba(46,27,75,0.55) 100%)',
        }}
      />

      {/* Top glass nav floats above the scene */}
      <div style={{ position: 'relative', zIndex: 3 }}>
        <FloatingGlassNav locale={locale} currency={currency} />
      </div>

      {/* Bottom gradient + glass CTA bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          insetInline: 0,
          zIndex: 10,
          padding: '0 32px 56px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          background:
            'linear-gradient(to top, rgba(30,27,75,0.75) 0%, rgba(30,27,75,0.0) 100%)',
        }}
      >
        <span
          className="glass-strong"
          style={{
            display: 'inline-block',
            padding: '6px 20px',
            borderRadius: '999px',
            color: 'rgba(255,255,255,0.92)',
            fontSize: '13px',
            letterSpacing: '0.08em',
            fontFamily: 'var(--font-display)',
          }}
        >
          {t.tag}
        </span>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <a
            href={`/${locale}/shop`}
            className="glass-btn-primary"
            style={{
              height: '52px',
              padding: '0 36px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.6)',
            }}
          >
            {t.cta}
          </a>
          <a
            href={`/${locale}/lookbook`}
            className="glass-btn"
            style={{
              height: '52px',
              padding: '0 36px',
              border: '1px solid rgba(255,255,255,0.28)',
            }}
          >
            {t.lookbook}
          </a>
        </div>
      </div>
    </div>
  );
}
