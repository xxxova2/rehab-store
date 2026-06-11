import { getTranslations } from 'next-intl/server';
import { getAllProducts } from '@/lib/products';
import { getCurrentCurrency } from '@/lib/currency-server';
import { ProductCard } from './product-card';
import type { AppLocale } from '@rehab/types';
import styles from './recently-added.module.css';

export async function RecentlyAdded({ locale }: { locale: string }) {
  const t = await getTranslations('home');
  const currency = await getCurrentCurrency(locale as AppLocale);

  const allProducts = await getAllProducts();

  const hasDates = allProducts.every((p) => p.createdAt);
  let recent;
  if (hasDates) {
    recent = [...allProducts]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 4);
  } else {
    recent = [...allProducts].reverse().slice(0, 4);
  }

  if (recent.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <h2 className={styles.titleAr}>وصل حديثاً</h2>
        <p className={styles.titleEn}>Just Arrived</p>
      </div>
      <div className={styles.strip}>
        {recent.map((product) => (
          <div key={product.id} className={styles.stripItem}>
            <ProductCard
              product={product}
              locale={locale as AppLocale}
              currency={currency}
              viewLabel={t('view')}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
