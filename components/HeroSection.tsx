'use client';

/**
 * HeroSection - Full-viewport cinematic hero with scroll-animated product image
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5
 *
 * Uses the actual EcoPack paper water bottle PNG as the primary visual.
 * GSAP ScrollTrigger controls the bottle's position, scale, and opacity
 * as the user scrolls through the hero section.
 *
 * Architecture:
 * - Real product PNG animated with GSAP scroll-driven motion
 * - Pinned section with scrub for smooth reversible animation
 * - Falls back to static presentation with prefers-reduced-motion
 */

import { useRef } from 'react';
import Image from 'next/image';
import { useGsap } from '@/lib/useGsap';
import { gsap } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';

export default function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const bottleRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Scroll-driven animation
  useGsap(() => {
    if (prefersReducedMotion || !sectionRef.current || !bottleRef.current || !textRef.current) return;

    const mm = gsap.matchMedia();

    // Desktop / Tablet: full scroll animation
    mm.add('(min-width: 768px)', () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=100%',
          pin: true,
          pinSpacing: true,
          scrub: 0.8,
        },
      });

      // Bottle: move toward center, scale up, translate up slightly
      tl.fromTo(
        bottleRef.current,
        { xPercent: 0, yPercent: 0, scale: 1 },
        { xPercent: -15, yPercent: -5, scale: 1.15, ease: 'power1.inOut', duration: 1 },
        0
      );

      // Text: fade and move up as bottle takes focus
      tl.fromTo(
        textRef.current,
        { opacity: 1, yPercent: 0 },
        { opacity: 0.3, yPercent: -8, ease: 'power1.in', duration: 1 },
        0.3
      );
    });

    // Mobile: simpler scroll animation
    mm.add('(max-width: 767px)', () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=60%',
          pin: true,
          pinSpacing: true,
          scrub: 0.5,
        },
      });

      tl.fromTo(
        bottleRef.current,
        { scale: 1, yPercent: 0 },
        { scale: 1.08, yPercent: -3, ease: 'power1.out', duration: 1 },
        0
      );
    });
  }, sectionRef, [prefersReducedMotion]);

  return (
    <div ref={sectionRef}>
      <section
        id="hero"
        aria-label="Hero — Sustainable packaging introduction"
        className="relative w-full min-h-screen bg-obsidian flex items-center overflow-hidden"
      >
        <div className="relative z-10 w-full max-w-[1400px] mx-auto grid grid-cols-1 tablet:grid-cols-2 items-center gap-8 tablet:gap-12 px-6 tablet:px-12 desktop:px-20 py-24 tablet:py-0">
          {/* Left column — Headline, supporting text & CTAs */}
          <div
            ref={textRef}
            className="flex flex-col justify-center gap-5 tablet:gap-6 pt-16 tablet:pt-0 max-w-[560px]"
          >
            {/* Champagne Gold accent line */}
            <span
              aria-hidden="true"
              className="block w-12 h-[3px] bg-champagne-gold rounded-full"
            />

            {/* Primary heading */}
            <h1 className="font-sora text-[clamp(32px,5vw,50px)] text-ivory leading-[1.1] tracking-tight">
              THE NEXT GENERATION
              <br />
              OF WATER PACKAGING.
            </h1>

            {/* Supporting text */}
            <p className="font-inter text-base tablet:text-lg text-ivory/80 leading-relaxed max-w-[480px]">
              Premium paper-based water bottles and sustainable packaging solutions for modern businesses.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col tablet:flex-row gap-3 tablet:gap-4 mt-2">
              <a
                href="#enquiry"
                onClick={(e) => handleSmoothScroll(e, 'enquiry')}
                className="inline-flex items-center justify-center px-7 py-3.5 bg-champagne-gold text-obsidian font-sora text-sm font-semibold rounded-full transition-all hover:bg-champagne-gold/90 hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-gold active:scale-[0.98]"
              >
                REQUEST A QUOTE →
              </a>
              <a
                href="#paper-water-bottles"
                onClick={(e) => handleSmoothScroll(e, 'paper-water-bottles')}
                className="inline-flex items-center justify-center px-7 py-3.5 border-2 border-champagne-gold/60 text-ivory font-sora text-sm font-medium rounded-full transition-all hover:border-champagne-gold hover:bg-champagne-gold/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-gold active:scale-[0.98]"
              >
                EXPLORE PRODUCTS ↓
              </a>
            </div>
          </div>

          {/* Right column — Product bottle with scroll animation */}
          <div
            ref={bottleRef}
            data-hero-viewer
            className="relative flex items-center justify-center w-full h-[50vh] tablet:h-[70vh] desktop:h-[80vh] min-h-[320px] max-h-[700px] will-change-transform"
          >
            {/* Subtle ambient glow */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              aria-hidden="true"
            >
              <div className="w-[50%] h-[50%] rounded-full bg-champagne-gold/5 blur-3xl" />
            </div>

            {/* Actual EcoPack paper water bottle */}
            <Image
              src="/images/paper-water-bottle.png"
              alt="EcoPack Global paper water bottle — premium sustainable packaging"
              width={600}
              height={900}
              className="object-contain w-auto h-[80%] max-h-[580px] tablet:max-h-[480px] desktop:max-h-[580px] drop-shadow-[0_20px_60px_rgba(200,169,107,0.15)] relative z-10"
              priority
              sizes="(max-width: 767px) 70vw, (max-width: 1023px) 40vw, 450px"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
