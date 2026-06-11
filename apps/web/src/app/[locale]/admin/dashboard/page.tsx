import { getTranslations } from 'next-intl/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import styles from './dashboard.module.css';

export const dynamic = 'force-dynamic';

function formatCurrency(amountCents: number, locale: string): string {
  const formatter = new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(amountCents / 100);
}

interface DashboardStats {
  productCount: number;
}

async function getStats(): Promise<DashboardStats> {
  try {
    const { count } = await getSupabaseAdmin()
      .from('products')
      .select('*', { count: 'exact', head: true });
    return { productCount: count ?? 0 };
  } catch {
    return { productCount: 0 };
  }
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('admin.dashboard');
  const stats = await getStats();

  return (
    <div className={styles.page}>
      <div className={styles.statsGrid}>
        <article className={styles.statCard}>
          <span className={styles.statLabel}>Products</span>
          <span className={styles.statValue}>{stats.productCount}</span>
          <span className={styles.statTrend}>Total products in store</span>
        </article>

        <article className={styles.statCard}>
          <span className={styles.statLabel}>Orders</span>
          <span className={styles.statValue}>0</span>
          <span className={styles.statTrend}>Orders will appear after checkout is set up</span>
        </article>

        <article className={styles.statCard}>
          <span className={styles.statLabel}>Collections</span>
          <span className={styles.statValue}>0</span>
          <span className={styles.statTrend}>Coming soon</span>
        </article>

        <article className={styles.statCard}>
          <span className={styles.statLabel}>Status</span>
          <span className={styles.statValue} style={{ color: 'var(--md-sys-color-primary, #6750A4)' }}>
            Live
          </span>
          <span className={styles.statTrend}>Storefront is running</span>
        </article>
      </div>

      <div className={styles.contentGrid}>
        <section className={styles.sectionCard}>
          <header className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Getting Started</h2>
          </header>
          <div style={{ padding: '1.5rem' }}>
            <ol style={{ lineHeight: 2, margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>Add products</strong> — Go to{' '}
                <a href={`/${locale}/admin/products`} style={{ color: 'var(--md-sys-color-primary, #6750A4)' }}>
                  Products
                </a>{' '}
                to add your first product.
              </li>
              <li>Set up a Medusa backend to enable orders, customers, and checkout.</li>
              <li>Configure your store settings in the Settings page.</li>
            </ol>
          </div>
        </section>

        <section className={styles.sectionCard} style={{ height: 'fit-content' }}>
          <header className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Quick Links</h2>
          </header>
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <a href={`/${locale}/admin/products`} className={styles.sectionLink}>
              + Add new product
            </a>
            <a href={`/${locale}/admin/settings`} className={styles.sectionLink}>
              Store settings
            </a>
            <a href={`/${locale}`} className={styles.sectionLink}>
              View storefront
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
