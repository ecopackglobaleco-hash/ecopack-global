'use client';

/**
 * HeroScrollAnimation - Scroll-driven bottle animation for the Hero section
 * Validates: Requirements 1.2, 2.3, 2.5, 2.6
 *
 * Creates a GSAP ScrollTrigger animation pinned to the Hero section that:
 * - Rotates the 3D bottle 360° around its vertical axis (via shared scrollProgress ref)
 * - Translates the 3D viewer container from the right side to horizontal center
 * - Scales the container progressively (close-in zoom effect)
 *
 * Performance degradation (Req 2.6):
 * - Monitors FPS via usePerformanceMonitor
 * - If degraded: disables non-critical parallax (translateX) while preserving
 *   critical content visibility (scale + rotation remain for 3D reveal)
 * - If recovered: re-enables all effects
 *
 * Animation constraints (Req 2.5):
 * - Max 3 animated elements per section
 * - All animations reveal content (3D model, text), not purely decorative
 */

import { useRef, useEffect, useState } from 'react';
import { useGsap } from '@/lib/useGsap';
import { gsap } from '@/lib/gsap';
import { scrollProgress } from '@/lib/scrollProgress';
import { usePerformanceMonitor } from '@/lib/usePerformanceMonitor';
import {
  MAX_SIMULTANEOUS_ELEMENTS,
  type AnimationElement,
  createAnimationElement,
} from '@/lib/animationConstraints';

interface HeroScrollAnimationProps {
  children: React.ReactNode;
}

/**
 * Hero section animation elements — all content-revealing, max 3 simultaneous.
 * 1. 3D bottle rotation (critical — reveals product from all angles)
 * 2. Viewer translateX (non-critical parallax — moves viewer to center)
 * 3. Viewer scale (critical — progressive zoom reveals detail)
 */
const HERO_ANIMATION_ELEMENTS: AnimationElement[] = [
  createAnimationElement({
    id: 'hero-3d-rotation',
    selector: '[data-hero-viewer]',
    contentType: '3d-model',
    isCritical: true,
    contentDescription: '360° rotation reveals full product form factor',
  }),
  createAnimationElement({
    id: 'hero-viewer-translate',
    selector: '[data-hero-viewer]',
    contentType: '3d-model',
    isCritical: false,
    contentDescription: 'Translates 3D viewer to center for focused viewing',
  }),
  createAnimationElement({
    id: 'hero-viewer-scale',
    selector: '[data-hero-viewer]',
    contentType: '3d-model',
    isCritical: true,
    contentDescription: 'Progressive zoom reveals product material detail',
  }),
];

// Validate at module load that we don't exceed constraints
if (HERO_ANIMATION_ELEMENTS.length > MAX_SIMULTANEOUS_ELEMENTS) {
  console.warn(
    `[HeroScrollAnimation] ${HERO_ANIMATION_ELEMENTS.length} elements defined, ` +
      `but max ${MAX_SIMULTANEOUS_ELEMENTS} allowed simultaneously.`
  );
}

export default function HeroScrollAnimation({ children }: HeroScrollAnimationProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { isDegraded } = usePerformanceMonitor();
  const [degraded, setDegraded] = useState(false);

  // Track degradation changes to update animations
  useEffect(() => {
    setDegraded(isDegraded);
  }, [isDegraded]);

  useGsap(() => {
    if (!wrapperRef.current) return;

    const viewerEl = wrapperRef.current.querySelector<HTMLElement>(
      '[data-hero-viewer]'
    );
    if (!viewerEl) return;

    const mm = gsap.matchMedia();

    // ─── Desktop / Tablet: Full scroll-driven animation ─────────────────────
    mm.add('(min-width: 768px)', () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: 'top top',
          end: '+=100%',
          pin: true,
          pinSpacing: true,
          scrub: true,
          onUpdate: (self) => {
            // Update shared scroll progress for 3D rotation inside Canvas
            scrollProgress.current = self.progress;
          },
        },
      });

      if (degraded) {
        // Degraded mode: only critical animations (scale + rotation via scrollProgress)
        // Disable non-critical parallax (translateX) to reduce GPU load
        tl.fromTo(
          viewerEl,
          { scale: 1 },
          { scale: 1.4, ease: 'power1.inOut', duration: 1 }
        );
      } else {
        // Normal mode: full animation set (translate + scale + rotation)
        tl.fromTo(
          viewerEl,
          { xPercent: 0, scale: 1 },
          { xPercent: -25, scale: 1.4, ease: 'power1.inOut', duration: 1 }
        );
      }

      return () => {
        // Cleanup is handled by gsap.context revert
      };
    });

    // ─── Mobile: Simpler animation (no full 3D, uses fallback image) ────────
    mm.add('(max-width: 767px)', () => {
      gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: 'top top',
          end: '+=50%',
          pin: true,
          pinSpacing: true,
          scrub: true,
          onUpdate: (self) => {
            scrollProgress.current = self.progress;
          },
        },
      }).fromTo(
        viewerEl,
        { scale: 1, opacity: 0.8 },
        { scale: 1.15, opacity: 1, ease: 'power1.out', duration: 1 }
      );
    });
  }, wrapperRef, [degraded]);

  return (
    <div ref={wrapperRef}>
      {children}
    </div>
  );
}
