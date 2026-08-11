'use client';

/**
 * WhyEcoPack - Why EcoPack Global section with four visual blocks
 * Validates: Requirements 3.3
 *
 * Presents four glass-morphism cards highlighting key value propositions:
 * Sustainability, Premium Design, Custom Branding, and Global B2B.
 * Uses scroll-triggered staggered reveal animations via GSAP ScrollTrigger.
 * Respects reduced-motion preferences.
 */

import { useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useGsap } from '@/lib/useGsap';
import { useReducedMotion } from '@/lib/useReducedMotion';

interface ValueBlock {
  title: string;
  description: string;
}

const VALUE_BLOCKS: ValueBlock[] = [
  {
    title: 'Sustainability',
    description:
      'Eco-friendly packaging crafted from renewable materials, reducing environmental impact without compromising quality.',
  },
  {
    title: 'Premium Design',
    description:
      'Elevated aesthetics that position your brand at the forefront of modern, conscious packaging design.',
  },
  {
    title: 'Custom Branding',
    description:
      'Fully tailored packaging solutions that bring your brand identity to life with precision and consistency.',
  },
  {
    title: 'Global B2B',
    description:
      'Scalable manufacturing and logistics partnerships serving businesses across international markets.',
  },
];

export default function WhyEcoPack() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useGsap(() => {
    if (prefersReducedMotion || !sectionRef.current) {
      return;
    }

    // Animate the section heading
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

    // Staggered reveal for the four cards
    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll('[data-card]');
      gsap.fromTo(
        cards,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: cardsRef.current,
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
      id="why-ecopack"
      aria-label="Why EcoPack Global"
      className="relative py-20 tablet:py-28 desktop:py-32 bg-obsidian"
    >
      <div className="max-w-6xl mx-auto px-6">
        <h2
          ref={headingRef}
          className={`font-sora text-h2 text-ivory text-center mb-12 tablet:mb-16 ${
            prefersReducedMotion ? '' : 'opacity-0'
          }`}
        >
          Why EcoPack Global
        </h2>

        <div
          ref={cardsRef}
          className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-4 gap-6"
        >
          {VALUE_BLOCKS.map((block) => (
            <article
              key={block.title}
              data-card
              className={`glass-card p-6 tablet:p-8 flex flex-col gap-4 ${
                prefersReducedMotion ? '' : 'opacity-0'
              }`}
            >
              <h3 className="font-sora text-h3 text-champagne-gold">
                {block.title}
              </h3>
              <p className="font-inter text-ivory/80 leading-relaxed">
                {block.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
