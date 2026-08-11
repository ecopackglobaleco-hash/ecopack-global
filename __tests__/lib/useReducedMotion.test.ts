/**
 * Unit tests for useReducedMotion hook
 * Validates: Requirements 2.4, 8.6
 */

import { renderHook, act } from '@testing-library/react';
import { useReducedMotion } from '@/lib/useReducedMotion';

describe('useReducedMotion', () => {
  let listeners: Map<string, (event: MediaQueryListEvent) => void>;
  let matchesMock: boolean;

  beforeEach(() => {
    listeners = new Map();
    matchesMock = false;

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query: string) => ({
        matches: matchesMock,
        media: query,
        onchange: null,
        addEventListener: jest.fn((event: string, handler: (e: MediaQueryListEvent) => void) => {
          listeners.set(event, handler);
        }),
        removeEventListener: jest.fn((event: string) => {
          listeners.delete(event);
        }),
        addListener: jest.fn(),
        removeListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  it('returns false by default (no reduced-motion preference)', () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it('returns true when prefers-reduced-motion: reduce is active', () => {
    matchesMock = true;
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it('reacts to live changes when the user toggles the OS setting', () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);

    // Simulate user enabling reduced motion
    act(() => {
      const handler = listeners.get('change');
      handler?.({ matches: true } as MediaQueryListEvent);
    });

    expect(result.current).toBe(true);

    // Simulate user disabling reduced motion
    act(() => {
      const handler = listeners.get('change');
      handler?.({ matches: false } as MediaQueryListEvent);
    });

    expect(result.current).toBe(false);
  });

  it('cleans up the event listener on unmount', () => {
    const removeEventListenerSpy = jest.fn();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: removeEventListenerSpy,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    const { unmount } = renderHook(() => useReducedMotion());
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
