'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, type ReactNode } from 'react';

export type StageProps = {
  children?: ReactNode;
  camera?: { position?: [number, number, number]; fov?: number };
  frameloop?: 'always' | 'demand' | 'never';
  className?: string;
  dpr?: [number, number];
  shadows?: boolean;
};

/**
 * Rehab 3D Stage — R3F Canvas with safe defaults for editorial 3D.
 * - dpr capped at [1, 2] for retina
 * - Suspense with a 3D-friendly fallback
 * - frameloop 'demand' for perf on static product shots
 */
export function Stage({
  children,
  camera = { position: [0, 0, 4], fov: 35 },
  frameloop = 'always',
  className,
  dpr = [1, 2],
  shadows = true,
}: StageProps) {
  return (
    <div
      className={className}
      style={{ position: 'relative', width: '100%', height: '100%' }}
      data-testid="rehab-stage"
    >
      <Canvas
        dpr={dpr}
        frameloop={frameloop}
        shadows={shadows}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        camera={camera}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  );
}
