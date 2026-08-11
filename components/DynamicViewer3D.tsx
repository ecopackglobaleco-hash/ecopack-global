'use client';

/**
 * DynamicViewer3D - Dynamic import wrapper for the Viewer3D component
 * Validates: Requirements 6.1, 6.3, 16.3
 *
 * Uses next/dynamic with ssr: false to ensure 3D components (which depend
 * on WebGL and browser APIs) are only loaded on the client side. This
 * prevents SSR errors and reduces initial bundle size.
 */

import dynamic from 'next/dynamic';
import type { Viewer3DComponentProps } from '@/components/Viewer3D';

/**
 * Dynamically imported Viewer3D with SSR disabled.
 * React Three Fiber requires browser APIs (WebGL, canvas) that are
 * not available during server-side rendering.
 */
const DynamicViewer3D = dynamic(
  () => import('@/components/Viewer3D'),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex items-center justify-center w-full h-full bg-obsidian"
        role="status"
        aria-label="Loading 3D viewer"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-champagne-gold/30 animate-pulse" />
          <span className="text-ivory/60 text-sm font-inter">
            Loading 3D viewer…
          </span>
        </div>
      </div>
    ),
  }
);

export default DynamicViewer3D;
export type { Viewer3DComponentProps };
