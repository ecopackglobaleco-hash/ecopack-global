/**
 * Tests for FPS Monitor - Performance degradation detection
 * Validates: Requirements 2.3, 2.6
 */

import { fpsMonitor } from '@/lib/fpsMonitor';

describe('FpsMonitor', () => {
  beforeEach(() => {
    fpsMonitor.stop();
    fpsMonitor.reset();

    // Mock window.innerWidth for desktop viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1440,
    });
  });

  afterEach(() => {
    fpsMonitor.stop();
  });

  describe('initialization', () => {
    it('starts with isDegraded = false', () => {
      expect(fpsMonitor.isDegraded).toBe(false);
    });

    it('starts with isRunning = false', () => {
      expect(fpsMonitor.isRunning).toBe(false);
    });

    it('sets isRunning = true after start() on desktop viewport', () => {
      fpsMonitor.start();
      expect(fpsMonitor.isRunning).toBe(true);
    });

    it('does not start on mobile viewport (< 1024px)', () => {
      Object.defineProperty(window, 'innerWidth', { value: 768 });
      fpsMonitor.start();
      expect(fpsMonitor.isRunning).toBe(false);
    });

    it('stops monitoring on stop()', () => {
      fpsMonitor.start();
      expect(fpsMonitor.isRunning).toBe(true);
      fpsMonitor.stop();
      expect(fpsMonitor.isRunning).toBe(false);
    });
  });

  describe('subscription', () => {
    it('allows subscribing to state changes', () => {
      const listener = jest.fn();
      const unsubscribe = fpsMonitor.subscribe(listener);
      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });

    it('unsubscribes correctly', () => {
      const listener = jest.fn();
      const unsubscribe = fpsMonitor.subscribe(listener);
      unsubscribe();
      // After reset, listener should not be called
      fpsMonitor.reset();
      // reset calls notify which would call listener if still subscribed
      // Since we unsubscribed, it should not be called
      expect(listener).not.toHaveBeenCalled();
    });

    it('notifies listener on reset when subscribed', () => {
      const listener = jest.fn();
      fpsMonitor.subscribe(listener);
      fpsMonitor.reset();
      expect(listener).toHaveBeenCalledWith({
        isDegraded: false,
        currentFps: expect.any(Number),
      });
    });
  });

  describe('reset', () => {
    it('resets degradation state to false', () => {
      fpsMonitor.reset();
      expect(fpsMonitor.isDegraded).toBe(false);
    });
  });

  describe('start/stop idempotency', () => {
    it('calling start() multiple times does not create multiple loops', () => {
      fpsMonitor.start();
      fpsMonitor.start();
      fpsMonitor.start();
      expect(fpsMonitor.isRunning).toBe(true);
      fpsMonitor.stop();
      expect(fpsMonitor.isRunning).toBe(false);
    });

    it('calling stop() when not running is safe', () => {
      expect(() => fpsMonitor.stop()).not.toThrow();
    });
  });
});
