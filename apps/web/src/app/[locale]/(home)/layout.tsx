import { SplineBackground } from '@/components/spline-background';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SplineBackground />
      {children}
    </>
  );
}
