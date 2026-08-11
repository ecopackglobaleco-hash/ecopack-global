'use client';

/**
 * useTabletPerformance - React hook for tablet FPS-based 3D fallback
 * Validates: Requirement 5.2
 *
 * Monitors frame rate on tablet viewports (768-1023px) and triggers
 * a static fallback when FPS drops below 24fps for 2+ consecutive seconds.
 * On non-tablet viewports, returns shouldUseFallback: false.
 *
 * The hook also exposes `isTablet` to allow components to apply
 * reduced polygon count rendering when on tablet without fallback.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

const TABLET_MIN_WIDTH = 768;
const TABLET_MAX_WIDTH = 1023;
const TABLET_FPS_THRESHOLD = 24;
const DEGRADATION_DURATION_MS = 2000;
const ROLLING_WINDOW_SIZE = 60;

export interface TabletPerformanceResult {
  /** Whether the viewport is currently at tablet breakpoint (768-1023px) */
  isTablet: boolean;
  /** Whether 3D should be replaced with static fallback (FPS < 24 for 2+ seconds) */
  shouldUseFallback: boolean;
  /** Current rolling average FPS (only tracked on tablet) */
  currentFps: number;
}

export function useTabletPerformance(): TabletPerformanceResult {
  const [isTablet, setIsTablet] = useState(false);
  const [shouldUseFallback, setShouldUseFallback] = useState(false);
  const [currentFps, setCurrentFps] = useState(60);

  const rafIdRef = useRef<number | null>(null);
  const frameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef<number | null>(null);
  const degradedSinceRef = useRef<number | null>(null);
  const runningRef = useRef(false);

  const checkIsTablet = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= TABLET_MIN_WIDTH && window.innerWidth <= TABLET_MAX_WIDTH;
  }, []);

  const stopMonitoring = useCallback(() => {
    runningRef.current = false;
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    frameTimesRef.current = [];
    lastFrameTimeRef.current = null;
    degradedSinceRef.current = null;
  }, []);

  const tick = useCallback(() => {
    if (!runningRef.current) return;

    const now = performance.now();

    if (lastFrameTimeRef.current !== null) {
      frameTimesRef.current.push(now);

      if (frameTimesRef.current.length > ROLLING_WINDOW_SIZE) {
        frameTimesRef.current.shift();
      }

      if (frameTimesRef.current.length >= 2) {
        const oldest = frameTimesRef.current[0];
        const newest = frameTimesRef.current[frameTimesRef.current.length - 1];
        const elapsed = newest - oldest;

        if (elapsed > 0) {
          const fps = Math.round(((frameTimesRef.current.length - 1) / elapsed) * 1000);
          setCurrentFps(fps);

          // Check if FPS has been below threshold for long enough
          if (fps < TABLET_FPS_THRESHOLD) {
            if (degradedSinceRef.current === null) {
              degradedSinceRef.current = now;
            } else if (now - degradedSinceRef.current >= DEGRADATION_DURATION_MS) {
              setShouldUseFallback(true);
              stopMonitoring();
              return;
            }
          } else {
            degradedSinceRef.current = null;
          }
        }
      }
    }

    lastFrameTimeRef.current = now;
    rafIdRef.current = requestAnimationFrame(tick);
  }, [stopMonitoring]);

  const startMonitoring = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    frameTimesRef.current = [];
    lastFrameTimeRef.current = null;
    degradedSinceRef.current = null;
    rafIdRef.current = requestAnimationFrame(tick);
  }, [tick]);

  useEffect(() => {
    const handleResize = () => {
      const tablet = checkIsTablet();
      setIsTablet(tablet);

      if (tablet && !shouldUseFallback) {
        startMonitoring();
      } else {
        stopMonitoring();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      stopMonitoring();
    };
  }, [checkIsTablet, startMonitoring, stopMonitoring, shouldUseFallback]);

  return { isTablet, shouldUseFallback, currentFps };
}
