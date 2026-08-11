'use client';

/**
 * ProductAnatomy - Premium scroll-driven exploded view section
 * Validates: Requirements 2.1, 2.2, 3.1
 *
 * Shows the assembled EcoPack bottle initially, then on scroll progressively
 * separates the bottle into its structural layers using the exploded reference
 * image with independent Y-translation per layer via clip-path regions.
 *
 * GSAP ScrollTrigger with pin + scrub controls the animation timeline.
 * Scrolling up reverses everything.
 */

import { useRef } from 'react';
import Image from 'next/image';
import { useGsap } from '@/lib/useGsap';
import { gsap } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';

// ─── Layer Configuration ─────────────────────────────────────────────────────
// Each layer is a vertical slice of the exploded image, animated independently.
// clipTop/clipBottom are percentages of the image height.
const LAYERS = [
  { id: 'cap', name: 'Paper Cap / Closure', clipTop: 0, clipBottom: 18, yOffset: -50 },
  { id: 'seal', name: 'Inner Seal', clipTop: 18, clipBottom: 30, yOffset: -25 },
  { id: 'body', name: 'Outer Paper Structure', clipTop: 30, clipBottom: 60, yOffset: 0 },
  { id: 'barrier', name: 'Barrier Layer', clipTop: 60, clipBottom: 78, yOffset: 25 },
  { id: 'contact', name: 'Inner Contact Layer', clipTop: 78, clipBottom: 100, yOffset: 50 },
];

export default function ProductAnatomy() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinContainerRef = useRef<HTMLDivElement>(null);
  const assembledRef = useRef<HTMLDivElement>(null);
  const layersContainerRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useGsap(() => {
    if (prefersReducedMotion) return;
    if (!sectionRef.current || !pinContainerRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        pin: pinContainerRef.current,
        pinSpacing: false,
        scrub: 0.5,
      },
    });

    // Phase 1 (0–0.1): Assembled bottle visible
    // (no-op, it starts visible)

    // Phase 2 (0.1–0.3): Assembled fades out, layer container fades in
    tl.to(assembledRef.current, { opacity: 0, scale: 1.02, duration: 0.2, ease: 'none' }, 0.1);
    tl.fromTo(
      layersContainerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.15, ease: 'none' },
      0.15
    );

    // Phase 3 (0.25–0.7): Each layer separates via translateY
    if (layersContainerRef.current) {
      const layerEls = layersContainerRef.current.querySelectorAll('[data-layer]');
      layerEls.forEach((el, i) => {
        const offset = LAYERS[i].yOffset;
        tl.fromTo(
          el,
          { y: 0 },
          { y: offset, duration: 0.4, ease: 'none' },
          0.25 + i * 0.08
        );
      });
    }

    // Phase 4 (0.5–1.0): Labels fade in staggered
    if (labelsRef.current) {
      const labels = labelsRef.current.querySelectorAll('[data-label]');
      tl.fromTo(
        labels,
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.06, ease: 'none' },
        0.5
      );
    }
  }, sectionRef, [prefersReducedMotion]);

  return (
    <section
      id="product-anatomy"
      ref={sectionRef}
      className="relative bg-obsidian overflow-x-hidden"
      style={{ minHeight: '200vh' }}
      aria-label="3D Product Anatomy"
    >
      <div
        ref={pinContainerRef}
        className="w-full h-screen flex flex-col items-center justify-center px-section"
      >
        {/* Section Heading */}
        <div className="absolute top-8 left-0 right-0 z-10 text-center px-section">
          <h2 className="font-sora text-h2 text-ivory">
            PRODUCT <span className="text-champagne-gold">ANATOMY</span>
          </h2>
          <p className="mt-3 font-inter text-ivory/70 text-base max-w-md mx-auto">
            Scroll to explore the structure of our sustainable packaging
          </p>
        </div>

        {/* Visual composition — absolute positioned for precise alignment */}
        <div data-anatomy-viewer className="absolute inset-0 top-20">
          {/* ASSEMBLED bottle (initial state) — true center with slight left offset for labels */}
          <div
            ref={assembledRef}
            className="absolute z-10 flex items-center justify-center"
            style={{ left: '45%', top: '50%', transform: 'translate(-50%, -50%)', height: '80%' }}
          >
            <Image
              src="/images/paper-water-bottle.png"
              alt="EcoPack Global paper water bottle — assembled"
              width={360}
              height={900}
              className="object-contain h-full w-auto max-h-[600px] tablet:max-h-[560px] drop-shadow-[0_12px_40px_rgba(200,169,107,0.1)]"
              sizes="(max-width: 767px) 50vw, (max-width: 1023px) 40vw, 320px"
              priority
            />
          </div>

          {/* EXPLODED layers container (starts invisible) — same position as assembled */}
          <div
            ref={layersContainerRef}
            className={`absolute z-10 ${prefersReducedMotion ? '' : 'opacity-0'}`}
            style={{ left: '45%', top: '50%', transform: 'translate(-50%, -50%)', height: '80%' }}
          >
            <div className="relative h-full max-h-[600px]" style={{ aspectRatio: '0.38' }}>
              {LAYERS.map((layer) => (
                <div
                  key={layer.id}
                  data-layer
                  className="absolute inset-0 will-change-transform"
                  style={{
                    clipPath: `inset(${layer.clipTop}% 0 ${100 - layer.clipBottom}% 0)`,
                  }}
                >
                  <img
                    src="/images/product-anatomy-exploded.png"
                    alt=""
                    className="w-full h-full object-contain"
                    aria-hidden="true"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Labels — aligned with bottle component vertical positions */}
          <div
            ref={labelsRef}
            className="absolute z-20 pointer-events-none"
            style={{ left: '68%', top: '50%', transform: 'translateY(-50%)', height: '80%', maxHeight: '600px' }}
          >
            {/* Desktop labels */}
            <div className="relative h-full hidden tablet:block">
              {LAYERS.map((layer) => {
                const midPercent = (layer.clipTop + layer.clipBottom) / 2;
                return (
                  <div
                    key={layer.id}
                    data-label
                    className={`absolute flex items-center gap-3 ${prefersReducedMotion ? '' : 'opacity-0'}`}
                    style={{ top: `${midPercent}%`, transform: 'translateY(-50%)' }}
                  >
                    <div className="w-8 desktop:w-14 h-px bg-champagne-gold/50 shrink-0" />
                    <span className="text-ivory/90 text-[11px] desktop:text-xs font-sora font-medium tracking-wider uppercase whitespace-nowrap">
                      {layer.name}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Mobile labels */}
            <div className="tablet:hidden flex flex-col gap-2 items-center pt-4">
              {LAYERS.map((layer) => (
                <div
                  key={`m-${layer.id}`}
                  data-label
                  className={`flex items-center gap-2 ${prefersReducedMotion ? '' : 'opacity-0'}`}
                >
                  <div className="w-5 h-px bg-champagne-gold/50" />
                  <span className="text-ivory/90 text-[9px] font-sora font-medium tracking-wider uppercase whitespace-nowrap">
                    {layer.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="w-px h-12 bg-champagne-gold/20 mx-auto" />
          <span className="block mt-2 text-ivory/40 text-[10px] font-inter uppercase tracking-widest">
            {prefersReducedMotion ? 'Exploded View' : 'Scroll to explore'}
          </span>
        </div>
      </div>
    </section>
  );
}
