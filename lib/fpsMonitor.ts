/**
 * FPS Monitor - Performance degradation detection for scroll animations
 * Validates: Requirements 2.3, 2.6
 *
 * Monitors frame rate using requestAnimationFrame and triggers
 * performance degradation mode when FPS drops below thresholds:
 * - FPS < 20 for 2+ consecutive seconds → degraded = true (disable non-critical parallax)
 * - FPS > 30 for 5+ consecutive seconds → degraded = false (re-enable effects)
 *
 * Only active on desktop viewports (1024px+) since mobile uses static fallbacks.
 */

/** Minimum viewport width for FPS monitoring (desktop only) */
const DESKTOP_MIN_WIDTH = 1024;

/** Minimum viewport width for tablet FPS monitoring */
const TABLET_MIN_WIDTH = 768;

/** FPS threshold below which we consider performance degraded */
const DEGRADED_FPS_THRESHOLD = 20;

/** FPS threshold above which we consider performance recovered */
const RECOVERED_FPS_THRESHOLD = 30;

/** FPS threshold for tablet 3D fallback (Req 5.2) */
export const TABLET_FPS_THRESHOLD = 24;

/** Duration (ms) of sustained low FPS before triggering degradation */
const DEGRADATION_DURATION_MS = 2000;

/** Duration (ms) of sustained good FPS before recovering */
const RECOVERY_DURATION_MS = 5000;

/** Number of frames to use for rolling average calculation */
const ROLLING_WINDOW_SIZE = 60;

export interface FpsMonitorState {
  /** Whether performance is currently degraded */
  isDegraded: boolean;
  /** Current rolling average FPS */
  currentFps: number;
}

export type FpsMonitorListener = (state: FpsMonitorState) => void;

class FpsMonitor {
  private _isDegraded = false;
  private _currentFps = 60;
  private _running = false;
  private _rafId: number | null = null;

  /** Timestamps of recent frames for rolling FPS calculation */
  private _frameTimes: number[] = [];

  /** Timestamp when degraded FPS was first detected */
  private _degradedSince: number | null = null;

  /** Timestamp when recovered FPS was first detected */
  private _recoveredSince: number | null = null;

  /** Subscribers to state changes */
  private _listeners: Set<FpsMonitorListener> = new Set();

  /** Last frame timestamp */
  private _lastFrameTime: number | null = null;

  get isDegraded(): boolean {
    return this._isDegraded;
  }

  get currentFps(): number {
    return this._currentFps;
  }

  get isRunning(): boolean {
    return this._running;
  }

  /** Subscribe to FPS monitor state changes */
  subscribe(listener: FpsMonitorListener): () => void {
    this._listeners.add(listener);
    return () => {
      this._listeners.delete(listener);
    };
  }

  /** Start FPS monitoring (only on desktop viewports) */
  start(): void {
    if (this._running) return;

    // Only monitor on desktop viewports (1024px+)
    if (typeof window === 'undefined' || window.innerWidth < DESKTOP_MIN_WIDTH) {
      return;
    }

    this._running = true;
    this._frameTimes = [];
    this._lastFrameTime = null;
    this._degradedSince = null;
    this._recoveredSince = null;
    this._tick();
  }

  /** Stop FPS monitoring and clean up */
  stop(): void {
    this._running = false;
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    this._frameTimes = [];
    this._lastFrameTime = null;
    this._degradedSince = null;
    this._recoveredSince = null;
  }

  /** Reset degradation state */
  reset(): void {
    this._isDegraded = false;
    this._degradedSince = null;
    this._recoveredSince = null;
    this._notify();
  }

  private _tick = (): void => {
    if (!this._running) return;

    const now = performance.now();

    if (this._lastFrameTime !== null) {
      this._frameTimes.push(now);

      // Keep only the rolling window of frame timestamps
      if (this._frameTimes.length > ROLLING_WINDOW_SIZE) {
        this._frameTimes.shift();
      }

      // Calculate rolling average FPS from frame timestamps
      if (this._frameTimes.length >= 2) {
        const oldest = this._frameTimes[0];
        const newest = this._frameTimes[this._frameTimes.length - 1];
        const elapsed = newest - oldest;

        if (elapsed > 0) {
          this._currentFps = Math.round(
            ((this._frameTimes.length - 1) / elapsed) * 1000
          );
        }
      }

      // Evaluate thresholds
      this._evaluateThresholds(now);
    }

    this._lastFrameTime = now;
    this._rafId = requestAnimationFrame(this._tick);
  };

  private _evaluateThresholds(now: number): void {
    if (!this._isDegraded) {
      // Check if we should enter degraded mode
      if (this._currentFps < DEGRADED_FPS_THRESHOLD) {
        if (this._degradedSince === null) {
          this._degradedSince = now;
        } else if (now - this._degradedSince >= DEGRADATION_DURATION_MS) {
          this._isDegraded = true;
          this._degradedSince = null;
          this._recoveredSince = null;
          this._notify();
        }
      } else {
        // FPS recovered above degraded threshold, reset timer
        this._degradedSince = null;
      }
    } else {
      // Currently degraded — check if we should recover
      if (this._currentFps > RECOVERED_FPS_THRESHOLD) {
        if (this._recoveredSince === null) {
          this._recoveredSince = now;
        } else if (now - this._recoveredSince >= RECOVERY_DURATION_MS) {
          this._isDegraded = false;
          this._recoveredSince = null;
          this._degradedSince = null;
          this._notify();
        }
      } else {
        // FPS dropped back below recovery threshold, reset timer
        this._recoveredSince = null;
      }
    }
  }

  private _notify(): void {
    const state: FpsMonitorState = {
      isDegraded: this._isDegraded,
      currentFps: this._currentFps,
    };
    this._listeners.forEach((listener) => listener(state));
  }
}

/** Singleton FPS monitor instance */
export const fpsMonitor = new FpsMonitor();
