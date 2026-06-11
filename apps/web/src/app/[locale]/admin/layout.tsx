import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import type { AppLocale } from '@rehab/types';
import { AdminShell } from './AdminShell';
import { AuthGuard } from './AuthGuard';
import { ToastProvider } from './_components/ToastContext';

const ADMIN_HIDE_TOPBAR = `[data-testid="top-bar"] { display: none !important; }`;

const ADMIN_NAV = [
  { key: 'dashboard', pathname: '/admin/dashboard', label: 'admin.nav.dashboard' },
  { key: 'products', pathname: '/admin/products', label: 'admin.nav.products' },
  { key: 'inventory', pathname: '/admin/inventory', label: 'admin.nav.inventory' },
  { key: 'pricing', pathname: '/admin/pricing', label: 'admin.nav.pricing' },
  { key: 'orders', pathname: '/admin/orders', label: 'admin.nav.orders' },
  { key: 'collections', pathname: '/admin/collections', label: 'admin.nav.collections' },
  { key: 'customers', pathname: '/admin/customers', label: 'admin.nav.customers' },
  { key: 'settings', pathname: '/admin/settings', label: 'admin.nav.settings' },
  { key: 'adminUsers', pathname: '/admin/users', label: 'admin.nav.adminUsers' },
] as const;

async function getAdminToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('rehab_admin_token')?.value ?? null;
}

async function getAdminEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('rehab_admin_email')?.value ?? null;
}

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const token = await getAdminToken();
  const email = await getAdminEmail();
  const t = await getTranslations('admin');

  if (!token) {
    return (
      <AuthGuard isAuthenticated={false} locale={locale}>
        <style>{ADMIN_HIDE_TOPBAR}</style>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1.5rem',
          }}
        >
          {children}
        </div>
      </AuthGuard>
    );
  }

  return (
    <>
      <style>{ADMIN_HIDE_TOPBAR}</style>
      <ToastProvider>
        <AdminShell
        locale={locale as AppLocale}
        email={email}
        navItems={ADMIN_NAV}
        sidebarLabel={t('layout.sidebarLabel')}
        logoutLabel={t('logout')}
        userUnknown={t('userUnknown')}
        pageTitles={{
          dashboard: t('pageTitle.dashboard'),
          products: t('pageTitle.products'),
          inventory: t('pageTitle.inventory'),
          pricing: t('pageTitle.pricing'),
          orders: t('pageTitle.orders'),
          collections: t('pageTitle.collections'),
          customers: t('pageTitle.customers'),
          settings: t('pageTitle.settings'),
          users: t('pageTitle.users'),
        }}
      >
          {children}
        </AdminShell>
      </ToastProvider>
    </>
  );
}
