'use client';

/**
 * DynamicExplodedView3D - Dynamic import wrapper for the ExplodedView3D component
 * Validates: Requirement 2.2
 *
 * Uses next/dynamic with ssr: false to ensure 3D components (which depend
 * on WebGL and browser APIs) are only loaded on the client side. This
 * prevents SSR errors and reduces initial bundle size.
 */

import dynamic from 'next/dynamic';
import type { ExplodedView3DProps } from '@/types/viewer3d';

/**
 * Dynamically imported ExplodedView3D with SSR disabled.
 * React Three Fiber requires browser APIs (WebGL, canvas) that are
 * not available during server-side rendering.
 */
const DynamicExplodedView3D = dynamic(
  () => import('@/components/ExplodedView3D'),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex items-center justify-center w-full h-full bg-obsidian"
        role="status"
        aria-label="Loading exploded view"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-champagne-gold/30 animate-pulse" />
          <span className="text-ivory/60 text-sm font-inter">
            Loading exploded view…
          </span>
        </div>
      </div>
    ),
  }
);

export default DynamicExplodedView3D;
export type { ExplodedView3DProps };
