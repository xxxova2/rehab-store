import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { adminFetch, AdminAuthError } from '../_lib/api';
import styles from './dashboard.module.css';

export const dynamic = 'force-dynamic';

interface MedusaOrder {
  id: string;
  display_id: number;
  customer?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  total: number;
  created_at: string;
  payment_status: string;
  fulfillment_status: string;
  items: Array<{ quantity: number }>;
}

interface MedusaProduct {
  id: string;
  status: string;
  variants: Array<{
    id: string;
    title: string;
    inventory_quantity: number;
    options: Array<{ value: string }>;
  }>;
}

interface MedusaResponse<T> {
  data: T[];
  count?: number;
}

interface CustomerResponse {
  count: number;
}

function formatCurrency(amountCents: number, locale: string): string {
  const formatter = new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(amountCents / 100);
}

function formatDate(dateString: string, locale: string): string {
  const formatter = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-AE' : 'en-AE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  return formatter.format(new Date(dateString));
}

function isThisMonth(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

function getStatusBadgeClass(status: string): string {
  const statusLower = status.toLowerCase();
  if (statusLower === 'pending') return 'pending';
  if (statusLower === 'processing') return 'processing';
  if (statusLower === 'shipped') return 'shipped';
  if (statusLower === 'delivered') return 'delivered';
  if (statusLower === 'completed') return 'completed';
  if (statusLower === 'cancelled') return 'cancelled';
  if (statusLower === 'refunded') return 'refunded';
  return 'pending';
}

async function safeFetch<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof AdminAuthError) {
      throw error;
    }
    console.error('Fetch error:', error);
    return null;
  }
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('admin.dashboard');

  let ordersResult: MedusaResponse<MedusaOrder> | null;
  let allOrdersResult: MedusaResponse<MedusaOrder> | null;
  let productsResult: MedusaResponse<MedusaProduct> | null;
  let customersResult: CustomerResponse | null;

  try {
    [ordersResult, allOrdersResult, productsResult, customersResult] = await Promise.all([
      safeFetch(adminFetch<MedusaResponse<MedusaOrder>>('/admin/orders', {
        query: { limit: '5', order: '-created_at', expand: 'customer,items' },
      })),
      safeFetch(adminFetch<MedusaResponse<MedusaOrder>>('/admin/orders', {
        query: { fields: 'id,total,payment_status,created_at', limit: '100' },
      })),
      safeFetch(adminFetch<MedusaResponse<MedusaProduct>>('/admin/products', {
        query: { fields: 'id,status,variants', limit: '100' },
      })),
      safeFetch(adminFetch<CustomerResponse>('/admin/customers', {
        query: { limit: '1' },
      })),
    ]);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      const cookieStore = await cookies();
      cookieStore.delete('rehab_admin_token');
      cookieStore.delete('rehab_admin_email');
      redirect(`/${locale}/admin/login`);
    }
    ordersResult = null;
    allOrdersResult = null;
    productsResult = null;
    customersResult = null;
  }

  if (!ordersResult || !allOrdersResult || !productsResult || !customersResult) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <p className={styles.errorStateTitle}>{t('error')}</p>
          <p className={styles.errorStateText}>{t('loading')}</p>
        </div>
      </div>
    );
  }

  const recentOrders = ordersResult.data ?? [];
  const allOrders = allOrdersResult.data ?? [];
  const products = productsResult.data ?? [];
  const totalCustomers = customersResult.count ?? 0;

  const thisMonthOrders = allOrders.filter((order: MedusaOrder) =>
    order.payment_status === 'captured' && isThisMonth(order.created_at)
  );

  const revenueMTDCents = thisMonthOrders.reduce((sum: number, order: MedusaOrder) => sum + (order.total ?? 0), 0);
  const ordersThisMonthCount = thisMonthOrders.length;

  const publishedProducts = products.filter((p: MedusaProduct) => p.status === 'published');
  const activeProductsCount = publishedProducts.length;

  let lowStockVariants = 0;
  const lowStockItems: Array<{
    productTitle: string;
    variantTitle: string;
    quantity: number;
  }> = [];

  for (const product of publishedProducts) {
    for (const variant of product.variants) {
      if (variant.inventory_quantity < 10) {
        lowStockVariants++;
        const optionValues = variant.options.map((o: { value: string }) => o.value).join(' / ');
        lowStockItems.push({
          productTitle: product.id,
          variantTitle: optionValues || variant.title,
          quantity: variant.inventory_quantity,
        });
      }
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.statsGrid}>
        <article className={styles.statCard}>
          <span className={styles.statLabel}>{t('revenueMTD')}</span>
          <span className={styles.statValue}>{formatCurrency(revenueMTDCents, locale)}</span>
          <span className={styles.statTrend}>{ordersThisMonthCount} {t('ordersThisMonth').toLowerCase()}</span>
        </article>

        <article className={styles.statCard}>
          <span className={styles.statLabel}>{t('ordersThisMonth')}</span>
          <span className={styles.statValue}>{ordersThisMonthCount}</span>
          <span className={styles.statTrend}>{allOrdersResult.count ?? 0} total</span>
        </article>

        <article className={styles.statCard}>
          <span className={styles.statLabel}>{t('activeProducts')}</span>
          <span className={styles.statValue}>{activeProductsCount}</span>
          <span className={styles.statTrend}>{products.length} total</span>
        </article>

        <article className={`${styles.statCard} ${lowStockVariants > 0 ? styles.lowStock : ''}`}>
          <span className={styles.statLabel}>{t('lowStockAlerts')}</span>
          <span className={styles.statValue}>{lowStockVariants}</span>
          <span className={styles.statTrend}>
            {lowStockVariants > 0 ? '\u26A0\uFE0F Needs attention' : '\u2713 All healthy'}
          </span>
        </article>
      </div>

      <div className={styles.contentGrid}>
        <section className={styles.sectionCard}>
          <header className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('recentOrders')}</h2>
            <a href={`/${locale}/admin/orders`} className={styles.sectionLink}>
              {t('viewAllOrders')}
            </a>
          </header>
          <div className={styles.tableWrapper}>
            {ordersResult === null ? (
              <div className={styles.errorState}>
                <p className={styles.errorStateTitle}>{t('error')}</p>
                <p className={styles.errorStateText}>{t('loading')}</p>
              </div>
            ) : recentOrders.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyStateIcon}>{'\uD83D\uDCE6'}</span>
                <p className={styles.emptyStateTitle}>No orders yet</p>
                <p className={styles.emptyStateText}>Orders will appear here when customers purchase</p>
              </div>
            ) : (
              <table className={styles.ordersTable} role="table">
                <thead>
                  <tr>
                    <th scope="col">{t('columns.orderId')}</th>
                    <th scope="col">{t('columns.customer')}</th>
                    <th scope="col">{t('columns.items')}</th>
                    <th scope="col">{t('columns.total')}</th>
                    <th scope="col">{t('columns.date')}</th>
                    <th scope="col">{t('columns.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order: MedusaOrder) => (
                    <tr key={order.id}>
                      <td className={styles.orderId}>#{order.display_id}</td>
                      <td className={styles.customerName}>
                        {order.customer?.first_name ?? '\u2014'} {order.customer?.last_name ?? ''}
                        {order.customer?.email && (
                          <>
                            <br />
                            <span style={{ fontSize: '0.75rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                              {order.customer.email}
                            </span>
                          </>
                        )}
                      </td>
                      <td className={styles.itemsCount}>
                        {order.items?.reduce((sum: number, item: { quantity: number }) => sum + (item.quantity ?? 0), 0) ?? 0}
                      </td>
                      <td className={styles.orderTotal}>
                        {formatCurrency(order.total, locale)}
                      </td>
                      <td className={styles.orderDate}>
                        {formatDate(order.created_at, locale)}
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles[getStatusBadgeClass(order.fulfillment_status ?? order.payment_status)]}`}>
                          {t(`status.${getStatusBadgeClass(order.fulfillment_status ?? order.payment_status)}`)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <aside className={styles.sectionCard} style={{ height: 'fit-content' }}>
          <header className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('lowStockPanel')}</h2>
            <a href={`/${locale}/admin/inventory`} className={styles.sectionLink}>
              {t('manageInventory')}
            </a>
          </header>
          {productsResult === null ? (
            <div className={styles.errorState}>
              <p className={styles.errorStateTitle}>{t('error')}</p>
              <p className={styles.errorStateText}>{t('loading')}</p>
            </div>
          ) : lowStockItems.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyStateIcon}>{'\u2705'}</span>
              <p className={styles.emptyStateTitle}>{t('noLowStock')}</p>
              <p className={styles.emptyStateText}>All variants have 10+ units in stock</p>
            </div>
          ) : (
            <div className={styles.lowStockList}>
              {lowStockItems.slice(0, 10).map((item, index) => (
                <div key={index} className={styles.lowStockItem}>
                  <div className={styles.lowStockInfo}>
                    <span className={styles.lowStockProductTitle}>{item.productTitle}</span>
                    <span className={styles.lowStockVariantTitle}>{item.variantTitle}</span>
                  </div>
                  <span className={`${styles.lowStockQty} ${item.quantity === 0 ? styles.critical : styles.low}`}>
                    {item.quantity}
                  </span>
                </div>
              ))}
              {lowStockItems.length > 10 && (
                <a href={`/${locale}/admin/inventory`} className={styles.sectionLink} style={{ textAlign: 'center', display: 'block', marginTop: '0.5rem' }}>
                  +{lowStockItems.length - 10} more
                </a>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
