'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

const Spline = dynamic(() => import('@splinetool/react-spline'), { ssr: false });

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
      <Spline
        scene="https://prod.spline.design/F6oc-ZbDEretRj3S/scene.splinecode"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
