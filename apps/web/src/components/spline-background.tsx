'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

const SplineScene = dynamic(() => import('./spline-scene').then((m) => m.SplineScene), { ssr: false });

export function SplineBackground() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        opacity: loaded ? 1 : 0,
        transition: 'opacity 2s ease',
        pointerEvents: 'none',
        background: 'var(--md-sys-color-surface)',
      }}
    >
      <SplineScene
        scene="https://prod.spline.design/F6oc-ZbDEretRj3S/scene.splinecode"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
