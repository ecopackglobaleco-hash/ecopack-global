'use client';

/**
 * BrandStatement - Scroll-triggered tagline reveal section
 * Validates: Requirements 3.2
 *
 * Displays the brand tagline "PACKAGING SHOULD MOVE FORWARD" with a
 * scroll-triggered fade/reveal animation using GSAP ScrollTrigger.
 * Respects reduced-motion preferences by showing content immediately.
 */

import { useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useGsap } from '@/lib/useGsap';
import { useReducedMotion } from '@/lib/useReducedMotion';

export default function BrandStatement() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useGsap(() => {
    if (prefersReducedMotion || !headingRef.current || !sectionRef.current) {
      return;
    }

    gsap.fromTo(
      headingRef.current,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          end: 'top 30%',
          scrub: false,
          once: true,
        },
      }
    );
  }, sectionRef, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="brand-statement"
      aria-label="Brand Statement"
      className="relative flex items-center justify-center min-h-[60vh] bg-obsidian"
    >
      <h2
        ref={headingRef}
        className={`font-sora text-h2 tablet:text-h1 text-ivory text-center max-w-4xl px-6 ${
          prefersReducedMotion ? '' : 'opacity-0'
        }`}
      >
        PACKAGING SHOULD MOVE FORWARD
      </h2>
    </section>
  );
}
