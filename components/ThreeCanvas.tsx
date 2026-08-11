'use client';

/**
 * ThreeCanvas - Reusable React Three Fiber Canvas wrapper
 * Validates: Requirements 16.3
 *
 * Provides a pre-configured Canvas with performance settings optimized
 * for the EcoPack website. Uses demand-based frameloop to only render
 * when the scene changes, and limits DPR to [1, 2] for performance.
 */

import { Canvas, type CanvasProps } from '@react-three/fiber';
import { type ReactNode } from 'react';

export interface ThreeCanvasProps {
  /** Child 3D scene elements */
  children: ReactNode;
  /** Optional CSS class for the canvas container */
  className?: string;
  /** Optional camera configuration overrides */
  camera?: CanvasProps['camera'];
  /** Optional additional Canvas props */
  canvasProps?: Partial<Omit<CanvasProps, 'children' | 'dpr' | 'frameloop' | 'camera'>>;
}

export default function ThreeCanvas({
  children,
  className,
  camera = { fov: 45, near: 0.1, far: 100, position: [0, 0, 5] },
  canvasProps,
}: ThreeCanvasProps) {
  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <Canvas
        dpr={[1, 2]}
        frameloop="demand"
        camera={camera}
        {...canvasProps}
      >
        {children}
      </Canvas>
    </div>
  );
}
