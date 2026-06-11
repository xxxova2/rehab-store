import { HomeTabNav } from '@/components/home-tab-nav';
import { HomeProductShowcase } from '@/components/home-product-showcase';

export default async function HomePage() {
  return (
    <>
      {/* Tab bar fixed at top */}
      <HomeTabNav />

      {/* 3 featured product cards fixed at bottom — Spline BG shows in between */}
      <HomeProductShowcase />
    </>
  );
}
