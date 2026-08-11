'use client';

/**
 * ProductPortfolio - Product grid section with scroll-triggered reveal
 * Validates: Requirements 3.4, 5.1, 5.2, 5.3
 *
 * Displays six supporting products in a responsive grid layout:
 * - Desktop (1024px+): 3-column grid, all six visible without horizontal scroll
 * - Tablet (768-1023px): 2-column grid
 * - Mobile (<768px): single-column stacked layout
 *
 * Uses staggered GSAP ScrollTrigger animations for card reveals.
 * Respects reduced-motion preferences.
 */

import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useGsap } from '@/lib/useGsap';
import { useReducedMotion } from '@/lib/useReducedMotion';
import ProductCard from '@/components/ProductCard';
import type { ProductCardProps } from '@/types/product';

const products: ProductCardProps[] = [
  {
    title: 'Paper Cups',
    description:
      'Sustainably sourced paper cups with plant-based lining, fully compostable and plastic-free.',
    imageSrc: '/images/paper-cups.webp',
    imageAlt: 'Eco-friendly paper cups with plant-based lining',
  },
  {
    title: 'Tissues',
    description:
      'Soft, absorbent tissues made from responsibly harvested bamboo and recycled fibers.',
    imageSrc: '/images/tissues.png',
    imageAlt: 'Bamboo-based tissues in sustainable packaging',
  },
  {
    title: 'Compostable Food Packaging',
    description:
      'Durable food containers crafted from plant fibers that break down naturally after use.',
    imageSrc: '/images/compostable-food-packaging.png',
    imageAlt: 'Compostable food packaging containers made from plant fibers',
  },
  {
    title: 'Shopping Bags',
    description:
      'Sturdy reusable shopping bags made from recycled materials, designed to replace single-use plastic.',
    imageSrc: '/images/shopping-bags.png',
    imageAlt: 'Reusable shopping bags made from recycled materials',
  },
  {
    title: 'Garbage Bags',
    description:
      'Heavy-duty biodegradable garbage bags that decompose responsibly in landfill conditions.',
    imageSrc: '/images/garbage-bags.png',
    imageAlt: 'Biodegradable garbage bags in various sizes',
  },
  {
    title: 'Biomedical Waste Bags',
    description:
      'Certified biomedical waste bags meeting healthcare disposal standards with eco-conscious materials.',
    imageSrc: '/images/biomedical-waste-bags.png',
    imageAlt: 'Certified biomedical waste disposal bags for healthcare use',
  },
];

export default function ProductPortfolio() {
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

    // Staggered reveal for product cards
    if (gridRef.current) {
      const cards = gridRef.current.querySelectorAll('[data-product-card]');
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
      id="product-portfolio"
      aria-label="Product Portfolio"
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
          Our <span className="text-champagne-gold">Product</span> Portfolio
        </h2>

        {/* Product grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-6 tablet:gap-8"
        >
          {products.map((product) => (
            <div
              key={product.title}
              data-product-card
              className={prefersReducedMotion ? '' : 'opacity-0'}
            >
              <ProductCard
                title={product.title}
                description={product.description}
                imageSrc={product.imageSrc}
                imageAlt={product.imageAlt}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
