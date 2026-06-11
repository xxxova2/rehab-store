'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { AppLocale } from '@rehab/types';
import styles from './layout.module.css';

type NavItem = {
  key: string;
  pathname: string;
  label: string;
};

type PageTitles = Record<string, string>;

interface AdminShellProps {
  locale: AppLocale;
  email: string | null;
  navItems: readonly NavItem[];
  sidebarLabel: string;
  logoutLabel: string;
  userUnknown: string;
  pageTitles: PageTitles;
  children: React.ReactNode;
}

export function AdminShell({
  locale,
  email,
  navItems,
  sidebarLabel,
  logoutLabel,
  userUnknown,
  pageTitles,
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('admin');

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push(`/${locale}/admin/login`);
    router.refresh();
  };

  const handleNavigate = (href: string) => {
    router.push(href);
    router.refresh();
  };

  const getPageTitle = (path: string): string => {
    const segment = path.split('/').pop() ?? 'dashboard';
    return pageTitles[segment] ?? pageTitles.dashboard ?? t('pageTitle.dashboard');
  };

  const getNavIcon = (key: string): string => {
    const icons: Record<string, string> = {
      dashboard: '\u{1F4CA}',
      products: '\u{1F457}',
      inventory: '\u{1F4E6}',
      pricing: '\u{1F4B0}',
      orders: '\u{1F9FE}',
      collections: '\u{1F4C1}',
      customers: '\u{1F465}',
      settings: '\u{2699}\u{FE0F}',
      adminUsers: '\u{1F510}',
    };
    return icons[key] ?? '\u2022';
  };

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar} aria-label={sidebarLabel}>
        <div className={styles.sidebarHeader}>
          <a
            href={`/${locale}/admin/dashboard`}
            className={styles.brand}
            onClick={(e) => {
              e.preventDefault();
              handleNavigate(`/${locale}/admin/dashboard`);
            }}
          >
            <span className={styles.brandMark}>R</span>
            <span className={styles.brandWord}>rehab</span>
            <span className={styles.brandTag}>admin</span>
          </a>
        </div>
        <nav className={styles.sidebarNav}>
          <ul className={styles.navList} role="list">
            {navItems.map((item) => {
              const isActive = pathname?.startsWith(item.pathname) ?? false;
              return (
                <li key={item.key}>
                  <a
                    href={item.pathname}
                    className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigate(item.pathname);
                    }}
                  >
                    <span className={styles.navIcon} aria-hidden="true">{getNavIcon(item.key)}</span>
                    <span className={styles.navLabel}>{t(item.label)}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <div className={styles.mainWrapper}>
        <header className={styles.topbar} role="banner">
          <div className={styles.topbarInner}>
            <h1 className={styles.pageTitle}>{getPageTitle(pathname ?? '/admin/dashboard')}</h1>
            <div className={styles.topbarActions}>
              <div className={styles.userMenu}>
                <span className={styles.userEmail}>{email ?? userUnknown}</span>
                <button
                  type="button"
                  className={styles.logoutBtn}
                  onClick={handleLogout}
                  aria-label={logoutLabel}
                >
                  {logoutLabel}
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className={styles.main} id="admin-main" role="main">
          {children}
        </main>
      </div>
    </div>
  );
}
