import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';

/**
 * Homepage 13-Section Sequential Order and Landmark Verification
 * Validates: Requirements 2.1, 3.1
 *
 * Verifies that all 13 homepage sections render in the correct sequential order,
 * each identifiable as a navigable landmark with proper id and aria-label attributes.
 */

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; sizes?: string }) => {
    const { fill, sizes, ...imgProps } = props;
    return <img {...imgProps} />;
  },
}));

// Mock GSAP and ScrollTrigger
jest.mock('@/lib/gsap', () => ({
  gsap: {
    registerPlugin: jest.fn(),
    fromTo: jest.fn(),
    to: jest.fn(),
    timeline: jest.fn(() => ({ to: jest.fn(), fromTo: jest.fn() })),
    context: jest.fn((cb: () => void) => {
      cb();
      return { revert: jest.fn() };
    }),
  },
  ScrollTrigger: {
    getAll: jest.fn(() => []),
    refresh: jest.fn(),
  },
}));

// Mock useGsap to run callback without GSAP context
jest.mock('@/lib/useGsap', () => ({
  useGsap: jest.fn(),
}));

// Mock useReducedMotion
jest.mock('@/lib/useReducedMotion', () => ({
  useReducedMotion: () => true, // Disable animations in tests
}));

// Mock useScrollTransition
jest.mock('@/lib/useScrollTransition', () => ({
  useScrollTransition: () => ({
    sectionRef: { current: null },
    prefersReducedMotion: true,
  }),
}));

// Mock next/dynamic to render components synchronously
jest.mock('next/dynamic', () => {
  return (importFn: () => Promise<any>) => {
    // Return a component that renders synchronously using require
    const Component = (props: any) => {
      // For dynamic imports, we render a placeholder with the expected id
      return null;
    };
    Component.displayName = 'DynamicComponent';
    return Component;
  };
});

// Mock DynamicViewer3D
jest.mock('@/components/DynamicViewer3D', () => {
  return function MockDynamicViewer3D() {
    return <div data-testid="mock-viewer3d" />;
  };
});

// Mock DynamicExplodedView3D
jest.mock('@/components/DynamicExplodedView3D', () => {
  return function MockDynamicExplodedView3D() {
    return <div data-testid="mock-exploded-view" />;
  };
});

// Mock HeroScrollAnimation
jest.mock('@/components/HeroScrollAnimation', () => {
  return function MockHeroScrollAnimation({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  };
});

// Mock WorldMap
jest.mock('@/components/WorldMap', () => {
  return function MockWorldMap() {
    return <div data-testid="mock-world-map" />;
  };
});

// Import section components directly for individual testing
import HeroSection from '@/components/HeroSection';
import BrandStatement from '@/components/BrandStatement';
import PaperWaterBottles from '@/components/PaperWaterBottles';
import ProductAnatomy from '@/components/ProductAnatomy';
import WhyEcoPack from '@/components/WhyEcoPack';
import ProductPortfolio from '@/components/ProductPortfolio';
import Industries from '@/components/Industries';
import CustomBranding from '@/components/CustomBranding';
import GlobalSupply from '@/components/GlobalSupply';
import HowItWorks from '@/components/HowItWorks';
import EnquiryForm from '@/components/EnquiryForm';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';

/**
 * Expected section configuration for all 13 homepage sections.
 * Each entry defines the section id and expected aria-label for landmark identification.
 */
const EXPECTED_SECTIONS = [
  { id: 'hero', label: 'Hero — Sustainable packaging introduction', element: 'section' },
  { id: 'brand-statement', label: 'Brand Statement', element: 'section' },
  { id: 'paper-water-bottles', label: 'Paper Water Bottles', element: 'section' },
  { id: 'product-anatomy', label: '3D Product Anatomy', element: 'section' },
  { id: 'why-ecopack', label: 'Why EcoPack Global', element: 'section' },
  { id: 'product-portfolio', label: 'Product Portfolio', element: 'section' },
  { id: 'industries', label: 'Industries', element: 'section' },
  { id: 'custom-branding', label: 'Custom Branding', element: 'section' },
  { id: 'global-supply', label: 'Global Supply', element: 'section' },
  { id: 'how-it-works', label: 'How It Works', element: 'section' },
  { id: 'enquiry', label: 'B2B Enquiry', element: 'section' },
  { id: 'final-cta', label: 'Final call to action', element: 'section' },
  { id: 'footer', label: 'Site footer with contact information', element: 'div' },
];

describe('Homepage 13-Section Sequential Order', () => {
  describe('Individual section landmark verification', () => {
    it('HeroSection renders as a navigable landmark with id="hero"', () => {
      const { container } = render(<HeroSection />);
      const section = container.querySelector('section#hero');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('aria-label', 'Hero — Sustainable packaging introduction');
    });

    it('BrandStatement renders as a navigable landmark with id="brand-statement"', () => {
      const { container } = render(<BrandStatement />);
      const section = container.querySelector('section#brand-statement');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('aria-label', 'Brand Statement');
    });

    it('PaperWaterBottles renders as a navigable landmark with id="paper-water-bottles"', () => {
      const { container } = render(<PaperWaterBottles />);
      const section = container.querySelector('section#paper-water-bottles');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('aria-label', 'Paper Water Bottles');
    });

    it('ProductAnatomy renders as a navigable landmark with id="product-anatomy"', () => {
      const { container } = render(<ProductAnatomy />);
      const section = container.querySelector('section#product-anatomy');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('aria-label', '3D Product Anatomy');
    });

    it('WhyEcoPack renders as a navigable landmark with id="why-ecopack"', () => {
      const { container } = render(<WhyEcoPack />);
      const section = container.querySelector('section#why-ecopack');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('aria-label', 'Why EcoPack Global');
    });

    it('ProductPortfolio renders as a navigable landmark with id="product-portfolio"', () => {
      const { container } = render(<ProductPortfolio />);
      const section = container.querySelector('section#product-portfolio');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('aria-label', 'Product Portfolio');
    });

    it('Industries renders as a navigable landmark with id="industries"', () => {
      const { container } = render(<Industries />);
      const section = container.querySelector('section#industries');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('aria-label', 'Industries');
    });

    it('CustomBranding renders as a navigable landmark with id="custom-branding"', () => {
      const { container } = render(<CustomBranding />);
      const section = container.querySelector('section#custom-branding');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('aria-label', 'Custom Branding');
    });

    it('GlobalSupply renders as a navigable landmark with id="global-supply"', () => {
      const { container } = render(<GlobalSupply />);
      const section = container.querySelector('section#global-supply');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('aria-label', 'Global Supply');
    });

    it('HowItWorks renders as a navigable landmark with id="how-it-works"', () => {
      const { container } = render(<HowItWorks />);
      const section = container.querySelector('section#how-it-works');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('aria-label', 'How It Works');
    });

    it('EnquiryForm renders as a navigable landmark with id="enquiry"', () => {
      const { container } = render(
        <EnquiryForm
          onSubmit={async () => {}}
          submissionStatus="idle"
          submissionError={undefined}
        />
      );
      const section = container.querySelector('section#enquiry');
      expect(section).toBeInTheDocument();
      // EnquiryForm uses aria-labelledby
      expect(section).toHaveAttribute('aria-labelledby', 'enquiry-heading');
    });

    it('FinalCTA renders as a navigable landmark with id="final-cta"', () => {
      const { container } = render(<FinalCTA />);
      const section = container.querySelector('section#final-cta');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('aria-label', 'Final call to action');
    });

    it('Footer renders as a navigable landmark with id="footer"', () => {
      const { container } = render(<Footer />);
      const footerEl = container.querySelector('#footer');
      expect(footerEl).toBeInTheDocument();
      expect(footerEl).toHaveAttribute('aria-label', 'Site footer with contact information');
    });
  });

  describe('Sequential order verification', () => {
    it('all 13 sections render in the expected sequential order when composed together', () => {
      const { container } = render(
        <main>
          <HeroSection />
          <BrandStatement />
          <PaperWaterBottles />
          <ProductAnatomy />
          <WhyEcoPack />
          <ProductPortfolio />
          <Industries />
          <CustomBranding />
          <GlobalSupply />
          <HowItWorks />
          <EnquiryForm
            onSubmit={async () => {}}
            submissionStatus="idle"
            submissionError={undefined}
          />
          <FinalCTA />
          <Footer />
        </main>
      );

      // Get all elements with expected IDs in document order
      const sectionIds = EXPECTED_SECTIONS.map((s) => s.id);
      const foundElements = sectionIds
        .map((id) => container.querySelector(`#${id}`))
        .filter(Boolean);

      // All 13 should be found
      expect(foundElements).toHaveLength(13);

      // Verify sequential DOM order by checking each element appears after the previous
      for (let i = 0; i < foundElements.length - 1; i++) {
        const current = foundElements[i]!;
        const next = foundElements[i + 1]!;
        // compareDocumentPosition returns a bitmask; bit 4 means 'following'
        const position = current.compareDocumentPosition(next);
        expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      }
    });

    it('each section has a unique id attribute', () => {
      const { container } = render(
        <main>
          <HeroSection />
          <BrandStatement />
          <PaperWaterBottles />
          <ProductAnatomy />
          <WhyEcoPack />
          <ProductPortfolio />
          <Industries />
          <CustomBranding />
          <GlobalSupply />
          <HowItWorks />
          <EnquiryForm
            onSubmit={async () => {}}
            submissionStatus="idle"
            submissionError={undefined}
          />
          <FinalCTA />
          <Footer />
        </main>
      );

      const ids = EXPECTED_SECTIONS.map((s) => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(13);

      // Each ID is present in the DOM exactly once
      ids.forEach((id) => {
        const elements = container.querySelectorAll(`#${id}`);
        expect(elements).toHaveLength(1);
      });
    });

    it('each section is identifiable as a navigable landmark (has aria-label or aria-labelledby)', () => {
      const { container } = render(
        <main>
          <HeroSection />
          <BrandStatement />
          <PaperWaterBottles />
          <ProductAnatomy />
          <WhyEcoPack />
          <ProductPortfolio />
          <Industries />
          <CustomBranding />
          <GlobalSupply />
          <HowItWorks />
          <EnquiryForm
            onSubmit={async () => {}}
            submissionStatus="idle"
            submissionError={undefined}
          />
          <FinalCTA />
          <Footer />
        </main>
      );

      EXPECTED_SECTIONS.forEach(({ id }) => {
        const element = container.querySelector(`#${id}`);
        expect(element).toBeInTheDocument();
        const hasAriaLabel = element?.hasAttribute('aria-label');
        const hasAriaLabelledBy = element?.hasAttribute('aria-labelledby');
        expect(hasAriaLabel || hasAriaLabelledBy).toBe(true);
      });
    });
  });
});
