'use client';

/**
 * useScrollTransition - Applies scroll-position-linked entrance animations
 * Validates: Requirements 2.1, 3.1
 *
 * Provides a proportional scroll-driven animation for section content,
 * where animation progress is mapped to the user's scroll position within
 * the section's scroll range. Uses GSAP ScrollTrigger with scrub for
 * smooth, scroll-linked transitions.
 *
 * Respects reduced-motion preferences (disables animation, shows content immediately).
 */

import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useGsap } from '@/lib/useGsap';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface ScrollTransitionOptions {
  /** CSS selector for elements within the section to animate */
  targets?: string;
  /** Start position relative to trigger (default: 'top 85%') */
  start?: string;
  /** End position relative to trigger (default: 'top 35%') */
  end?: string;
  /** Initial Y offset in pixels (default: 40) */
  fromY?: number;
  /** Initial opacity (default: 0) */
  fromOpacity?: number;
  /** Stagger delay between elements in seconds (default: 0.1) */
  stagger?: number;
}

/**
 * Hook that wires scroll-position-linked transitions to a section.
 * Animation progress is proportionally mapped to scroll position within the section's range.
 *
 * @param options Configuration for the scroll transition
 * @returns Ref to attach to the section element
 */
export function useScrollTransition(options: ScrollTransitionOptions = {}) {
  const {
    targets = '[data-scroll-animate]',
    start = 'top 85%',
    end = 'top 35%',
    fromY = 40,
    fromOpacity = 0,
    stagger = 0.1,
  } = options;

  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useGsap(() => {
    if (prefersReducedMotion || !sectionRef.current) {
      return;
    }

    const elements = sectionRef.current.querySelectorAll(targets);
    if (elements.length === 0) return;

    gsap.fromTo(
      elements,
      { opacity: fromOpacity, y: fromY },
      {
        opacity: 1,
        y: 0,
        stagger,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start,
          end,
          scrub: true,
        },
      }
    );
  }, sectionRef, [prefersReducedMotion]);

  return { sectionRef, prefersReducedMotion };
}
