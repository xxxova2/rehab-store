'use client';

import Spline from '@splinetool/react-spline';
import { useState } from 'react';

export function SplineBackground() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        opacity: loaded ? 0.45 : 0,
        transition: 'opacity 2s ease',
        pointerEvents: 'none',
      }}
    >
      <Spline
        scene="https://prod.spline.design/F6oc-ZbDEretRj3S/scene.splinecode"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
