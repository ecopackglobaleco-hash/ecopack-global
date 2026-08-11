'use client';

/**
 * HowItWorks - Four-step process section with scroll-triggered reveal
 * Validates: Requirements 3.6
 *
 * Displays the four sequential steps of working with EcoPack Global:
 * 1. Tell Us, 2. Develop, 3. Confirm, 4. Deliver.
 * Uses an ordered list (<ol>) for semantic structure.
 * Steps are revealed sequentially with stagger on scroll via GSAP ScrollTrigger.
 * Respects reduced-motion preferences.
 */

import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useGsap } from '@/lib/useGsap';
import { useReducedMotion } from '@/lib/useReducedMotion';

interface Step {
  number: string;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    number: '01',
    title: 'Tell Us',
    description:
      'Share your packaging needs, branding requirements, and quantity goals with our team.',
  },
  {
    number: '02',
    title: 'Develop',
    description:
      'Our designers create custom prototypes tailored to your exact specifications.',
  },
  {
    number: '03',
    title: 'Confirm',
    description:
      'Review samples, approve designs, and finalize your sustainable packaging order.',
  },
  {
    number: '04',
    title: 'Deliver',
    description:
      'We manufacture and ship your branded packaging to any market worldwide.',
  },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useGsap(() => {
    if (prefersReducedMotion || !sectionRef.current) {
      return;
    }

    // Animate heading
    if (headingRef.current) {
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            once: true,
          },
        }
      );
    }

    // Staggered reveal for each step
    if (listRef.current) {
      const steps = listRef.current.querySelectorAll('[data-step]');
      gsap.fromTo(
        steps,
        { opacity: 0, y: 50, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: 'power2.out',
          stagger: 0.2,
          scrollTrigger: {
            trigger: listRef.current,
            start: 'top 75%',
            once: true,
          },
        }
      );

      // Animate connecting lines
      const connectors = listRef.current.querySelectorAll('[data-connector]');
      gsap.fromTo(
        connectors,
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.2,
          delay: 0.3,
          scrollTrigger: {
            trigger: listRef.current,
            start: 'top 75%',
            once: true,
          },
        }
      );
    }
  }, sectionRef, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      aria-label="How It Works"
      className="relative bg-forest-green py-20 tablet:py-28 desktop:py-32 px-section"
    >
      <div className="max-w-5xl mx-auto">
        {/* Section heading */}
        <h2
          ref={headingRef}
          className={`font-sora text-h2 text-ivory text-center mb-16 tablet:mb-20 ${
            prefersReducedMotion ? '' : 'opacity-0'
          }`}
        >
          How It <span className="text-champagne-gold">Works</span>
        </h2>

        {/* Steps as ordered list for semantic structure */}
        <ol
          ref={listRef}
          className="relative list-none p-0 m-0 grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-4 gap-8 tablet:gap-6"
        >
          {STEPS.map((step, index) => (
            <li
              key={step.number}
              data-step
              className={`relative flex flex-col items-center text-center ${
                prefersReducedMotion ? '' : 'opacity-0'
              }`}
            >
              {/* Connecting line between steps (desktop only) */}
              {index < STEPS.length - 1 && (
                <div
                  data-connector
                  aria-hidden="true"
                  className="hidden desktop:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-[2px] bg-champagne-gold/30 origin-left"
                  style={{ transformOrigin: 'left center', transform: prefersReducedMotion ? 'scaleX(1)' : undefined }}
                />
              )}

              {/* Step number circle */}
              <div className="relative flex items-center justify-center w-20 h-20 rounded-full border-2 border-champagne-gold/40 bg-glass-obsidian backdrop-blur-glass mb-6">
                <span className="font-sora text-h3 text-champagne-gold font-bold">
                  {step.number}
                </span>
                {/* Decorative dot at top of circle */}
                <span
                  aria-hidden="true"
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-champagne-gold"
                />
              </div>

              {/* Step title */}
              <h3 className="font-sora text-h4 text-ivory mb-3">
                {step.title}
              </h3>

              {/* Step description */}
              <p className="font-inter text-ivory/75 text-sm leading-relaxed max-w-[240px]">
                {step.description}
              </p>

              {/* Mobile/tablet vertical connector */}
              {index < STEPS.length - 1 && (
                <div
                  data-connector
                  aria-hidden="true"
                  className="desktop:hidden mt-6 w-[2px] h-8 bg-champagne-gold/30 origin-top"
                  style={{ transformOrigin: 'top center', transform: prefersReducedMotion ? 'scaleY(1)' : undefined }}
                />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
