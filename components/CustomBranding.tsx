'use client';

/**
 * CustomBranding - Custom branding section with headline, description, and CTA
 * Validates: Requirements 11.1, 11.2, 11.3, 11.4
 *
 * Displays a two-column layout (text left, visual right on desktop) showcasing
 * EcoPack Global's custom branding capabilities. Includes a CTA button that
 * smooth-scrolls to the Enquiry Form section.
 * Uses scroll-triggered GSAP animations. Respects reduced-motion preferences.
 */

import { useRef } from 'react';
import Image from 'next/image';
import { gsap } from '@/lib/gsap';
import { useGsap } from '@/lib/useGsap';
import { useReducedMotion } from '@/lib/useReducedMotion';

export default function CustomBranding() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
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

    // Staggered reveal for content elements
    if (contentRef.current) {
      const elements = contentRef.current.querySelectorAll('[data-animate]');
      gsap.fromTo(
        elements,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: contentRef.current,
            start: 'top 75%',
            once: true,
          },
        }
      );
    }
  }, sectionRef, [prefersReducedMotion]);

  const handleCTAClick = () => {
    const enquirySection = document.getElementById('enquiry');
    enquirySection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      id="custom-branding"
      aria-label="Custom Branding"
      className="relative bg-forest-green py-20 tablet:py-28 desktop:py-32 px-section"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section heading */}
        <h2
          ref={headingRef}
          className={`font-sora text-h2 text-ivory text-center mb-12 tablet:mb-16 ${
            prefersReducedMotion ? '' : 'opacity-0'
          }`}
        >
          YOUR BRAND. YOUR PACKAGING.
        </h2>

        {/* Two-column layout */}
        <div
          ref={contentRef}
          className="grid grid-cols-1 tablet:grid-cols-2 gap-8 tablet:gap-12 items-center"
        >
          {/* Text column */}
          <div
            data-animate
            className={`flex flex-col gap-6 ${
              prefersReducedMotion ? '' : 'opacity-0'
            }`}
          >
            <p className="font-inter text-ivory/90 text-lg leading-relaxed">
              EcoPack Global offers fully custom branding on all packaging
              products, helping your business stand out with sustainable
              solutions that reflect your identity. Our customization options
              include:
            </p>

            <ul className="font-inter text-ivory/80 space-y-3 list-none">
              <li className="flex items-start gap-3">
                <span className="text-champagne-gold mt-1">●</span>
                <span>
                  <strong className="text-ivory">Logo placement</strong> —
                  Position your logo prominently on any surface for maximum
                  brand visibility
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-champagne-gold mt-1">●</span>
                <span>
                  <strong className="text-ivory">Brand colors</strong> —
                  Match your exact brand palette with precision color printing
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-champagne-gold mt-1">●</span>
                <span>
                  <strong className="text-ivory">Packaging shape</strong> —
                  Custom structural design tailored to your product dimensions
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-champagne-gold mt-1">●</span>
                <span>
                  <strong className="text-ivory">Finishing options</strong> —
                  Matte, gloss, embossing, and foil accents for a premium feel
                </span>
              </li>
            </ul>

            {/* CTA Button */}
            <button
              onClick={handleCTAClick}
              className="mt-4 inline-flex items-center justify-center px-8 py-4 bg-champagne-gold text-obsidian font-sora font-semibold rounded-lg hover:bg-champagne-gold/90 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-gold w-fit"
            >
              Start Your Custom Order
            </button>
          </div>

          {/* Visual column */}
          <div
            data-animate
            className={`relative ${prefersReducedMotion ? '' : 'opacity-0'}`}
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-[20px]">
              <Image
                src="/images/custom-branding-showcase.png"
                alt="EcoPack Global custom branded sustainable packaging collection including bags, cups, bottles, boxes, and containers"
                fill
                className="object-cover scale-[1.05]"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
