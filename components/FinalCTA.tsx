'use client';

/**
 * Final CTA Section
 * Displays "READY TO MOVE FORWARD?" headline with a prominent button
 * that smooth-scrolls to the B2B Enquiry section.
 * Validates: Requirements 2.1, 3.7, 3.8
 *
 * Uses scroll-position-linked transitions via useScrollTransition hook.
 */

import { useScrollTransition } from '@/lib/useScrollTransition';

export default function FinalCTA() {
  const { sectionRef, prefersReducedMotion } = useScrollTransition({
    targets: '[data-scroll-animate]',
    start: 'top 85%',
    end: 'top 50%',
    fromY: 30,
  });

  const handleClick = () => {
    const enquirySection = document.getElementById('enquiry');
    if (enquirySection) {
      enquirySection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={sectionRef}
      id="final-cta"
      aria-label="Final call to action"
      className="w-full px-section py-24 bg-obsidian"
    >
      <div className="mx-auto max-w-3xl flex flex-col items-center text-center gap-8">
        <h2
          data-scroll-animate
          className={`font-sora text-h2 text-ivory ${prefersReducedMotion ? '' : 'opacity-0'}`}
        >
          READY TO MOVE FORWARD?
        </h2>
        <button
          type="button"
          data-scroll-animate
          onClick={handleClick}
          className={`rounded-glass border-2 border-champagne-gold bg-transparent px-10 py-4 font-sora text-base font-semibold text-champagne-gold transition-all hover:bg-champagne-gold hover:text-obsidian focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-gold min-h-[44px] ${prefersReducedMotion ? '' : 'opacity-0'}`}
        >
          Send Enquiry
        </button>
      </div>
    </section>
  );
}
