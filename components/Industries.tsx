'use client';

/**
 * Industries - Target industries section with scroll-triggered reveal
 * Validates: Requirements 3.5
 *
 * Presents seven target industries served by EcoPack Global:
 * Hotels, Restaurants, Corporate, Events, Retail, Healthcare, and Travel.
 * Each industry is displayed as a glass-card with an SVG icon and description.
 * Uses staggered GSAP ScrollTrigger animations for card reveals.
 * Respects reduced-motion preferences.
 */

import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useGsap } from '@/lib/useGsap';
import { useReducedMotion } from '@/lib/useReducedMotion';

interface Industry {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const INDUSTRIES: Industry[] = [
  {
    title: 'Hotels',
    description:
      'Elegant, branded amenities and packaging solutions that elevate guest experiences while meeting sustainability goals.',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-10 h-10"
        aria-hidden="true"
      >
        <rect x="8" y="16" width="32" height="24" rx="2" />
        <path d="M12 16V10a2 2 0 0 1 2-2h20a2 2 0 0 1 2 2v6" />
        <path d="M20 16v-4h8v4" />
        <line x1="8" y1="40" x2="40" y2="40" />
        <line x1="16" y1="24" x2="16" y2="32" />
        <line x1="24" y1="24" x2="24" y2="32" />
        <line x1="32" y1="24" x2="32" y2="32" />
      </svg>
    ),
  },
  {
    title: 'Restaurants',
    description:
      'Compostable food containers, cups, and cutlery that align with eco-conscious dining without sacrificing presentation.',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-10 h-10"
        aria-hidden="true"
      >
        <path d="M16 8v12a4 4 0 0 0 4 4h0a4 4 0 0 0 4-4V8" />
        <line x1="20" y1="24" x2="20" y2="40" />
        <path d="M32 8v6c0 3.3-2 6-4 8v18" />
        <line x1="16" y1="14" x2="24" y2="14" />
      </svg>
    ),
  },
  {
    title: 'Corporate',
    description:
      'Custom-branded office supplies, event materials, and sustainable packaging that reinforce corporate responsibility.',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-10 h-10"
        aria-hidden="true"
      >
        <rect x="10" y="12" width="28" height="28" rx="2" />
        <path d="M18 12V8h12v4" />
        <line x1="10" y1="24" x2="38" y2="24" />
        <rect x="20" y="20" width="8" height="8" rx="1" />
      </svg>
    ),
  },
  {
    title: 'Events',
    description:
      'Branded disposable solutions for conferences, weddings, and large-scale gatherings with minimal environmental footprint.',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-10 h-10"
        aria-hidden="true"
      >
        <path d="M12 40V20l12-12 12 12v20" />
        <rect x="18" y="28" width="12" height="12" rx="1" />
        <circle cx="24" cy="18" r="4" />
        <path d="M8 40h32" />
      </svg>
    ),
  },
  {
    title: 'Retail',
    description:
      'Eye-catching sustainable shopping bags, wrapping, and point-of-sale packaging that drives brand loyalty.',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-10 h-10"
        aria-hidden="true"
      >
        <path d="M12 16h24l-2 22H14L12 16z" />
        <path d="M18 16v-4a6 6 0 0 1 12 0v4" />
        <line x1="12" y1="24" x2="36" y2="24" />
      </svg>
    ),
  },
  {
    title: 'Healthcare',
    description:
      'Certified biomedical waste bags and hygienic disposable packaging meeting strict healthcare compliance standards.',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-10 h-10"
        aria-hidden="true"
      >
        <rect x="12" y="12" width="24" height="24" rx="4" />
        <line x1="24" y1="18" x2="24" y2="30" />
        <line x1="18" y1="24" x2="30" y2="24" />
      </svg>
    ),
  },
  {
    title: 'Travel',
    description:
      'Lightweight, portable eco-packaging for airlines, trains, and travel retail that reduces waste on the go.',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-10 h-10"
        aria-hidden="true"
      >
        <path d="M40 24c0-8.8-7.2-16-16-16S8 15.2 8 24s7.2 16 16 16 16-7.2 16-16z" />
        <ellipse cx="24" cy="24" rx="6" ry="16" />
        <line x1="8" y1="24" x2="40" y2="24" />
        <path d="M11 16h26" />
        <path d="M11 32h26" />
      </svg>
    ),
  },
];

export default function Industries() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
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

    // Staggered reveal for industry cards
    if (gridRef.current) {
      const cards = gridRef.current.querySelectorAll('[data-industry-card]');
      gsap.fromTo(
        cards,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.12,
          scrollTrigger: {
            trigger: gridRef.current,
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
      id="industries"
      aria-label="Industries"
      className="relative bg-obsidian py-20 tablet:py-28 desktop:py-32 px-section"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section heading */}
        <h2
          ref={headingRef}
          className={`font-sora text-h2 text-ivory text-center mb-12 tablet:mb-16 ${
            prefersReducedMotion ? '' : 'opacity-0'
          }`}
        >
          Industries We <span className="text-champagne-gold">Serve</span>
        </h2>

        {/* Industries grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-6 tablet:gap-8"
        >
          {INDUSTRIES.map((industry) => (
            <article
              key={industry.title}
              data-industry-card
              className={`glass-card p-6 tablet:p-8 flex flex-col gap-4 ${
                prefersReducedMotion ? '' : 'opacity-0'
              }`}
            >
              <div className="text-champagne-gold">{industry.icon}</div>
              <h3 className="font-sora text-h4 text-ivory">
                {industry.title}
              </h3>
              <p className="font-inter text-ivory/80 leading-relaxed text-sm">
                {industry.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
