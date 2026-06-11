'use client';

import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Resize observer hook: re-syncs the R3F renderer to its parent size.
 * Required when the canvas parent is fluid (hero, product page).
 */
export function useAutoSize() {
  const { gl, camera, size } = useThree();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        gl.setSize(width, height, false);
        if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
          (camera as THREE.PerspectiveCamera).aspect = width / height;
          (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
        }
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [gl, camera, size]);

  return ref;
}
