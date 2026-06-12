import { getTranslations } from 'next-intl/server';
import { getAllProducts } from '@/lib/products';
import styles from './dashboard.module.css';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('admin.dashboard');
  const products = await getAllProducts();

  const totalProducts = products.length;
  const inStock = products.filter(p => p.inStock !== false).length;
  const outOfStock = products.filter(p => p.inStock === false).length;

  return (
    <div className={styles.page}>
      <div className={styles.statsGrid}>
        <article className={styles.statCard}>
          <span className={styles.statLabel}>Total Products</span>
          <span className={styles.statValue}>{totalProducts}</span>
          <span className={styles.statTrend}>In catalog</span>
        </article>

        <article className={styles.statCard}>
          <span className={styles.statLabel}>In Stock</span>
          <span className={styles.statValue} style={{ color: '#065F46' }}>{inStock}</span>
          <span className={styles.statTrend}>Available for purchase</span>
        </article>

        <article className={styles.statCard}>
          <span className={styles.statLabel}>Out of Stock</span>
          <span className={styles.statValue} style={{ color: outOfStock > 0 ? '#991B1B' : '#065F46' }}>{outOfStock}</span>
          <span className={styles.statTrend}>Need restocking</span>
        </article>

        <article className={styles.statCard}>
          <span className={styles.statLabel}>Status</span>
          <span className={styles.statValue} style={{ color: '#5A4A3A' }}>Live</span>
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
                <a href={`/${locale}/admin/products`} style={{ color: '#5A4A3A', fontWeight: 500 }}>
                  Products
                </a>{' '}
                to add your first product.
              </li>
              <li>Upload product images and set pricing in the Products section.</li>
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
