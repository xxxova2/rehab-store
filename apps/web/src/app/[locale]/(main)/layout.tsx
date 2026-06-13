import type { ReactNode } from 'react';
import { HomeTabNav } from '@/components/home-tab-nav';
import { SplineBackground } from '@/components/spline-background';

export default async function MainLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <HomeTabNav />
      <SplineBackground />
      {children}
    </>
  );
}
