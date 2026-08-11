'use client';

/**
 * PaperWaterBottles - Flagship product showcase section
 * Validates: Requirements 3.1
 *
 * Highlights EcoPack's flagship paper water bottle product with the
 * actual premium product image and scroll-driven animations.
 */

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { gsap } from '@/lib/gsap';
import { useGsap } from '@/lib/useGsap';
import { useReducedMotion } from '@/lib/useReducedMotion';

export default function PaperWaterBottles() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const bottleRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const prefersReducedMotion = useReducedMotion();

  // Mouse parallax tracking
  useEffect(() => {
    if (prefersReducedMotion) return;
    const handleMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [prefersReducedMotion]);

  // Subtle mouse parallax on bottle
  useEffect(() => {
    if (prefersReducedMotion || !bottleRef.current) return;
    let animFrame: number;
    const bottleEl = bottleRef.current;
    let currentX = 0;
    let currentY = 0;

    const animate = () => {
      const targetX = mouseRef.current.x * 8;
      const targetY = mouseRef.current.y * 5;
      currentX += (targetX - currentX) * 0.03;
      currentY += (targetY - currentY) * 0.03;
      bottleEl.style.transform = `translate(${currentX}px, ${currentY}px)`;
      animFrame = requestAnimationFrame(animate);
    };
    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [prefersReducedMotion]);

  // GSAP scroll animations
  useGsap(() => {
    if (prefersReducedMotion || !sectionRef.current) return;

    // Text elements fade in
    const textElements = [headingRef.current, descriptionRef.current, featuresRef.current].filter(Boolean);
    gsap.fromTo(
      textElements,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          once: true,
        },
      }
    );

    // Bottle scroll-driven animation
    if (bottleRef.current) {
      const bottleInner = bottleRef.current.querySelector('[data-bottle-img]');
      if (bottleInner) {
        gsap.fromTo(
          bottleInner,
          { opacity: 0, scale: 0.88, y: 40 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
              end: 'center center',
              scrub: 0.6,
            },
          }
        );

        // Continue: bottle moves toward center and scales slightly as user keeps scrolling
        gsap.fromTo(
          bottleInner,
          { xPercent: 0, scale: 1 },
          {
            xPercent: -8,
            scale: 1.05,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'center center',
              end: 'bottom top',
              scrub: 0.8,
            },
          }
        );
      }
    }
  }, sectionRef, [prefersReducedMotion]);

  const features = [
    {
      title: '100% Biodegradable',
      description: 'Breaks down naturally within 90 days, leaving zero trace.',
    },
    {
      title: 'Sustainably Sourced',
      description: 'Made from FSC-certified renewable paper pulp.',
    },
    {
      title: 'Premium Design',
      description: 'Engineered for durability with a refined, modern aesthetic.',
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="paper-water-bottles"
      aria-label="Paper Water Bottles"
      className="relative py-24 tablet:py-32 bg-obsidian overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 tablet:px-12">
        {/* Section heading */}
        <h2
          ref={headingRef}
          className={`font-sora text-h2 tablet:text-h1 text-ivory mb-6 ${
            prefersReducedMotion ? '' : 'opacity-0'
          }`}
        >
          Paper Water Bottles
        </h2>

        <div className="grid grid-cols-1 desktop:grid-cols-2 gap-12 desktop:gap-16 items-center">
          {/* Product description */}
          <div
            ref={descriptionRef}
            className={prefersReducedMotion ? '' : 'opacity-0'}
          >
            <p className="font-inter text-ivory/80 text-lg leading-relaxed mb-6">
              Our flagship innovation — a fully biodegradable water bottle crafted
              entirely from paper. Designed to replace single-use plastics without
              compromising on quality, durability, or aesthetics.
            </p>
            <p className="font-inter text-ivory/60 leading-relaxed">
              Each bottle is engineered using proprietary pulp-moulding technology,
              creating a watertight vessel that performs like plastic but returns to
              the earth in weeks, not centuries.
            </p>
          </div>

          {/* Premium product bottle */}
          <div
            ref={bottleRef}
            className="relative flex items-center justify-center"
          >
            {/* Ambient glow behind bottle */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              aria-hidden="true"
            >
              <div className="w-[70%] h-[70%] rounded-full bg-forest-green/20 blur-[60px]" />
              <div className="absolute w-[40%] h-[40%] rounded-full bg-champagne-gold/8 blur-[40px]" />
            </div>

            {/* Bottle image with scroll animation target */}
            <div
              data-bottle-img
              className={`relative z-10 ${prefersReducedMotion ? '' : 'opacity-0'}`}
            >
              <Image
                src="/images/ecopack-premium-bottle.png"
                alt="EcoPack Global premium paper water bottle — 100% recyclable sustainable packaging"
                width={700}
                height={1000}
                className="object-contain w-auto h-[450px] tablet:h-[500px] desktop:h-[560px] drop-shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
                sizes="(max-width: 767px) 80vw, (max-width: 1023px) 50vw, 500px"
              />

              {/* Subtle shadow beneath bottle */}
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-4 bg-black/30 blur-xl rounded-full"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        {/* Key features */}
        <div
          ref={featuresRef}
          className={`mt-16 grid grid-cols-1 tablet:grid-cols-3 gap-8 ${
            prefersReducedMotion ? '' : 'opacity-0'
          }`}
        >
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-glass-obsidian backdrop-blur-glass border-glass rounded-glass p-6 shadow-glass"
            >
              <h3 className="font-sora text-h4 text-champagne-gold mb-2">
                {feature.title}
              </h3>
              <p className="font-inter text-ivory/70 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
