import type { ReactNode } from 'react';
import { HomeTabNav } from '@/components/home-tab-nav';

export default async function MainLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <HomeTabNav />
      {children}
    </>
  );
}
