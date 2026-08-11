'use client';

/**
 * useReducedMotion - Detects the user's reduced-motion preference
 * Validates: Requirements 2.4, 8.6
 *
 * Listens to the `prefers-reduced-motion: reduce` media query and
 * returns a boolean indicating whether reduced motion is preferred.
 *
 * - SSR-safe: defaults to false on the server (no window available)
 * - Reacts to live changes (e.g., user toggles OS setting while page is open)
 */

import { useState, useEffect } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Returns `true` when the user's OS/browser has reduced-motion enabled.
 * Updates reactively if the preference changes at runtime.
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(QUERY);
    // Set initial value on mount
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, []);

  return prefersReducedMotion;
}
