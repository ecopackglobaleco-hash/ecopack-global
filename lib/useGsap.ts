import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

/**
 * Custom hook for using GSAP animations in React components.
 * Provides a scoped gsap.context for automatic cleanup on unmount.
 *
 * Usage:
 * ```tsx
 * 'use client';
 * import { useGsap } from '@/lib/useGsap';
 * import { gsap } from '@/lib/gsap';
 *
 * function MyComponent() {
 *   const containerRef = useRef<HTMLDivElement>(null);
 *
 *   useGsap(() => {
 *     gsap.to('.box', { x: 100, scrollTrigger: { trigger: '.box' } });
 *   }, containerRef);
 *
 *   return <div ref={containerRef}><div className="box">Animated</div></div>;
 * }
 * ```
 */
export function useGsap(
  callback: () => void,
  scope?: React.RefObject<HTMLElement | null>,
  deps: React.DependencyList = []
): void {
  const contextRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    const ctx = gsap.context(callback, scope?.current ?? undefined);
    contextRef.current = ctx;

    return () => {
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
