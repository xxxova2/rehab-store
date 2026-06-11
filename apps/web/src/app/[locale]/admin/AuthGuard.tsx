'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function AuthGuard({
  isAuthenticated,
  locale,
  children,
}: {
  isAuthenticated: boolean;
  locale: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) return;
    if (pathname.endsWith('/login')) return;
    router.replace(`/${locale}/admin/login`);
  }, [isAuthenticated, pathname, locale, router]);

  return <>{children}</>;
}
