import { HomeTabNav } from '@/components/home-tab-nav';
import { RecentlyAdded } from '@/components/recently-added';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <HomeTabNav />
      <RecentlyAdded locale={locale} />
    </>
  );
}
