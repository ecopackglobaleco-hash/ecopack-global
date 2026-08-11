'use client';

/**
 * ScrollSectionWiring - Applies scroll-position-linked transitions between all 13 sections
 * Validates: Requirements 2.1, 3.1
 *
 * This component wires proportional scroll-driven entrance animations to every
 * homepage section. Each section's animation progress is mapped to the user's
 * scroll position within that section's scroll range.
 *
 * Uses GSAP ScrollTrigger with `scrub: true` to achieve proportional mapping.
 * Respects reduced-motion preferences.
 */

import { useEffect } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';

/**
 * Section IDs in sequential order matching the 13-section homepage structure.
 * The Hero section is excluded from scroll-wiring as it uses its own
 * scroll-driven pinned animation (HeroScrollAnimation).
 */
const WIRED_SECTION_IDS = [
  'brand-statement',
  'paper-water-bottles',
  'product-anatomy',
  'why-ecopack',
  'product-portfolio',
  'industries',
  'custom-branding',
  'global-supply',
  'how-it-works',
  'enquiry',
  'final-cta',
  'footer',
];

export default function ScrollSectionWiring() {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    // Small delay to ensure DOM sections are rendered (especially lazily loaded ones)
    const timeoutId = setTimeout(() => {
      const contexts: gsap.Context[] = [];

      WIRED_SECTION_IDS.forEach((id) => {
        const section = document.getElementById(id);
        if (!section) return;

        // Skip sections that already have scrub-based ScrollTrigger (e.g. ProductAnatomy)
        if (id === 'product-anatomy') return;

        const ctx = gsap.context(() => {
          // Apply a subtle scroll-position-linked entrance transition
          gsap.fromTo(
            section,
            { opacity: 0.3, y: 20 },
            {
              opacity: 1,
              y: 0,
              ease: 'none',
              scrollTrigger: {
                trigger: section,
                start: 'top 90%',
                end: 'top 60%',
                scrub: 0.5,
              },
            }
          );
        });

        contexts.push(ctx);
      });

      return () => {
        contexts.forEach((ctx) => ctx.revert());
      };
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      ScrollTrigger.getAll().forEach((st) => {
        // Only kill scroll-wiring triggers, not component-level ones
        if (st.vars && (st.vars as { id?: string }).id === 'scroll-wiring') {
          st.kill();
        }
      });
    };
  }, [prefersReducedMotion]);

  return null;
}
