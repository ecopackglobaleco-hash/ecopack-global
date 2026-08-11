'use client';

/**
 * Shared scroll progress store for communicating scroll position
 * between GSAP ScrollTrigger (outside Canvas) and React Three Fiber (inside Canvas).
 *
 * Uses a mutable ref object so useFrame can read the value every frame
 * without triggering React re-renders.
 *
 * Validates: Requirements 1.2
 */

/** Mutable scroll progress value (0 to 1) driven by GSAP ScrollTrigger */
export const scrollProgress = { current: 0 };
