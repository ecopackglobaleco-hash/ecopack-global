/**
 * usePerformanceMonitor - React hook for FPS-based performance degradation
 * Validates: Requirements 2.3, 2.6
 *
 * Wraps the FPS monitor singleton for React usage. Starts monitoring on mount
 * (desktop viewports only) and stops on unmount. Returns reactive degradation state.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { fpsMonitor, type FpsMonitorState } from '@/lib/fpsMonitor';

export interface PerformanceMonitorResult {
  /** Whether performance is currently degraded (FPS < 20 for 2+ seconds) */
  isDegraded: boolean;
  /** Current rolling average FPS */
  currentFps: number;
}

/**
 * Hook that monitors frame rate and provides degradation state.
 * Only activates on desktop viewports (1024px+).
 *
 * Usage:
 * ```tsx
 * const { isDegraded, currentFps } = usePerformanceMonitor();
 * // When isDegraded is true, disable non-critical parallax effects
 * ```
 */
export function usePerformanceMonitor(): PerformanceMonitorResult {
  const [state, setState] = useState<PerformanceMonitorResult>({
    isDegraded: false,
    currentFps: 60,
  });

  const handleStateChange = useCallback((monitorState: FpsMonitorState) => {
    setState({
      isDegraded: monitorState.isDegraded,
      currentFps: monitorState.currentFps,
    });
  }, []);

  useEffect(() => {
    // Subscribe to state changes from the FPS monitor
    const unsubscribe = fpsMonitor.subscribe(handleStateChange);

    // Start monitoring (will only activate on desktop viewports)
    fpsMonitor.start();

    return () => {
      unsubscribe();
      fpsMonitor.stop();
    };
  }, [handleStateChange]);

  return state;
}
