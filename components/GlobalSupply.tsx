'use client';

/**
 * GlobalSupply - Premium cinematic global network visualization
 * Validates: Requirements 10.1, 10.2, 10.3, 10.4
 *
 * Features:
 * - Large 3D interactive globe with market markers and route arcs
 * - GSAP scroll-triggered entrance animations
 * - Floating glass-morphism information cards
 * - Responsive: full 3D on desktop, simplified on mobile
 * - Reduced motion support
 * - Lazy loading for performance
 */

import { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { gsap } from '@/lib/gsap';
import { useGsap } from '@/lib/useGsap';
import { useReducedMotion } from '@/lib/useReducedMotion';

// Dynamically import Globe3D (SSR disabled for Three.js)
const DynamicGlobe3D = dynamic(() => import('@/components/Globe3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-16 h-16 rounded-full border-2 border-champagne-gold/20 animate-pulse" />
    </div>
  ),
});

// ─── Market Data for tooltips ────────────────────────────────────────────────
const MARKET_LABELS = [
  { id: 'india', name: 'India', label: 'Primary Market' },
  { id: 'usa', name: 'USA', label: 'Target Market' },
  { id: 'uae', name: 'UAE', label: 'Target Market' },
  { id: 'uk', name: 'UK', label: 'Target Market' },
  { id: 'canada', name: 'Canada', label: 'Target Market' },
];

export default function GlobalSupply() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const globeContainerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const [scrollProgress, setScrollProgress] = useState(prefersReducedMotion ? 1 : 0);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Lazy load trigger
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // GSAP scroll-triggered animations
  useGsap(() => {
    if (prefersReducedMotion || !sectionRef.current) return;

    // Heading animation
    if (headingRef.current) {
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 40 },
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

    // Globe scale animation + scroll progress tracking
    if (globeContainerRef.current) {
      gsap.fromTo(
        globeContainerRef.current,
        { opacity: 0, scale: 0.92 },
        {
          opacity: 1,
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            end: 'center center',
            scrub: true,
            onUpdate: (self) => {
              setScrollProgress(self.progress);
            },
          },
        }
      );
    }

    // Cards slide in
    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll('[data-card]');
      gsap.fromTo(
        cards,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: globeContainerRef.current,
            start: 'top 50%',
            once: true,
          },
        }
      );
    }

    // CTA fade
    if (ctaRef.current) {
      gsap.fromTo(
        ctaRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.6,
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top 90%',
            once: true,
          },
        }
      );
    }
  }, sectionRef, [prefersReducedMotion, isVisible]);

  return (
    <section
      ref={sectionRef}
      id="global-supply"
      aria-label="Global Supply"
      className="relative bg-obsidian py-20 tablet:py-28 desktop:py-36 px-section overflow-hidden"
    >
      {/* Subtle radial glow background */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-forest-green/20 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-champagne-gold/5 blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Heading */}
        <div
          ref={headingRef}
          className={`text-center mb-12 tablet:mb-16 ${prefersReducedMotion ? '' : 'opacity-0'}`}
        >
          <h2 className="font-sora text-h2 text-ivory leading-tight">
            GLOBAL REACH.
            <br />
            <span className="text-champagne-gold">LOCAL RELEVANCE.</span>
          </h2>
          <p className="mt-4 font-inter text-ivory/70 text-base tablet:text-lg max-w-xl mx-auto">
            Built for businesses reaching markets around the world.
          </p>
        </div>

        {/* Globe + Cards composition */}
        <div className="relative">
          {/* 3D Globe */}
          <div
            ref={globeContainerRef}
            className={`relative w-full mx-auto ${
              isMobile ? 'h-[350px]' : 'h-[500px] tablet:h-[550px] desktop:h-[600px]'
            } ${prefersReducedMotion ? '' : 'opacity-0'}`}
          >
            {isVisible && (
              <DynamicGlobe3D
                prefersReducedMotion={prefersReducedMotion}
                progress={scrollProgress}
                className="w-full h-full"
              />
            )}
          </div>

          {/* Floating Information Cards */}
          <div
            ref={cardsRef}
            className={`${
              isMobile
                ? 'flex flex-col gap-3 mt-8'
                : 'absolute inset-0 pointer-events-none'
            }`}
          >
            {/* Global Markets card */}
            <div
              data-card
              className={`${
                isMobile
                  ? ''
                  : 'absolute top-8 left-4 tablet:left-8'
              } pointer-events-auto ${prefersReducedMotion ? '' : 'opacity-0'}`}
            >
              <div className="bg-glass-obsidian backdrop-blur-glass border-glass rounded-glass p-4 shadow-glass max-w-[180px]">
                <span className="block text-champagne-gold text-[10px] font-inter uppercase tracking-widest mb-2">
                  Global Markets
                </span>
                <div className="flex flex-col gap-1">
                  {MARKET_LABELS.map((m) => (
                    <span
                      key={m.id}
                      className={`font-inter text-xs ${
                        m.id === 'india' ? 'text-champagne-gold font-medium' : 'text-ivory/70'
                      }`}
                    >
                      {m.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* B2B Packaging Solutions card */}
            <div
              data-card
              className={`${
                isMobile
                  ? ''
                  : 'absolute top-12 right-4 tablet:right-8'
              } pointer-events-auto ${prefersReducedMotion ? '' : 'opacity-0'}`}
            >
              <div className="bg-glass-obsidian backdrop-blur-glass border-glass rounded-glass p-4 shadow-glass max-w-[160px]">
                <span className="block text-champagne-gold text-[10px] font-inter uppercase tracking-widest mb-1">
                  B2B Packaging
                </span>
                <span className="block text-ivory/90 text-xs font-inter">
                  Solutions
                </span>
              </div>
            </div>

            {/* Custom Branding card */}
            <div
              data-card
              className={`${
                isMobile
                  ? ''
                  : 'absolute bottom-16 right-8 tablet:right-16'
              } pointer-events-auto ${prefersReducedMotion ? '' : 'opacity-0'}`}
            >
              <div className="bg-glass-obsidian backdrop-blur-glass border-glass rounded-glass p-4 shadow-glass max-w-[150px]">
                <span className="block text-champagne-gold text-[10px] font-inter uppercase tracking-widest mb-1">
                  Custom
                </span>
                <span className="block text-ivory/90 text-xs font-inter">
                  Branding
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div
          ref={ctaRef}
          className={`text-center mt-12 tablet:mt-16 ${prefersReducedMotion ? '' : 'opacity-0'}`}
        >
          <a
            href="#enquiry"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('enquiry')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="inline-flex items-center gap-2 text-champagne-gold/80 hover:text-champagne-gold text-sm font-inter tracking-wide transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-gold"
          >
            EXPLORE GLOBAL OPPORTUNITIES →
          </a>
        </div>
      </div>
    </section>
  );
}
