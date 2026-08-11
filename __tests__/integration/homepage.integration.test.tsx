import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { execSync } from 'child_process';
import path from 'path';
import React from 'react';

/**
 * Homepage Integration Tests
 * Validates: Requirements 3.1, 4.3, 8.1, 14.3
 *
 * Comprehensive integration tests verifying:
 * 1. All 13 sections render in correct sequential order
 * 2. Form end-to-end submission flow through EnquiryFormWrapper
 * 3. axe-core accessibility audit (WCAG compliance)
 * 4. No placeholder text in production build
 */

expect.extend(toHaveNoViolations);

// --- Mocks ---

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; sizes?: string; priority?: boolean }) => {
    const { fill, sizes, priority, ...imgProps } = props;
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

// Mock useGsap
jest.mock('@/lib/useGsap', () => ({
  useGsap: jest.fn(),
}));

// Mock useReducedMotion
jest.mock('@/lib/useReducedMotion', () => ({
  useReducedMotion: () => true,
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
    return null;
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

// Import section components directly
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
import EnquiryFormWrapper from '@/components/EnquiryFormWrapper';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';

// --- Section Order Tests ---

const EXPECTED_SECTION_IDS = [
  'hero',
  'brand-statement',
  'paper-water-bottles',
  'product-anatomy',
  'why-ecopack',
  'product-portfolio',
  'industries',
  'custom-branding',
  'global-supply',
  'how-it-works',
  'enquiry',
  'final-cta',
  'footer',
];

function renderFullHomepage() {
  return render(
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
      <EnquiryFormWrapper />
      <FinalCTA />
      <Footer />
    </main>
  );
}

describe('Homepage Integration – 13 Sections Sequential Order (Req 3.1)', () => {
  it('renders all 13 sections in the correct DOM order', () => {
    const { container } = renderFullHomepage();

    const foundElements = EXPECTED_SECTION_IDS
      .map((id) => container.querySelector(`#${id}`))
      .filter(Boolean);

    expect(foundElements).toHaveLength(13);

    // Verify sequential DOM order
    for (let i = 0; i < foundElements.length - 1; i++) {
      const current = foundElements[i]!;
      const next = foundElements[i + 1]!;
      const position = current.compareDocumentPosition(next);
      expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
  });

  it('each section has a unique id attribute', () => {
    const { container } = renderFullHomepage();

    EXPECTED_SECTION_IDS.forEach((id) => {
      const elements = container.querySelectorAll(`#${id}`);
      expect(elements).toHaveLength(1);
    });
  });

  it('each section has an accessible landmark (aria-label or aria-labelledby)', () => {
    const { container } = renderFullHomepage();

    EXPECTED_SECTION_IDS.forEach((id) => {
      const element = container.querySelector(`#${id}`);
      expect(element).toBeInTheDocument();
      const hasAriaLabel = element?.hasAttribute('aria-label');
      const hasAriaLabelledBy = element?.hasAttribute('aria-labelledby');
      expect(hasAriaLabel || hasAriaLabelledBy).toBe(true);
    });
  });
});

// --- Form End-to-End Submission Tests ---

describe('Homepage Integration – Form E2E Submission (Req 4.3)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  async function fillAndSubmitForm(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByLabelText(/^name/i), 'Jane Smith');
    await user.type(screen.getByLabelText(/^company/i), 'GreenPack Ltd');
    await user.type(screen.getByLabelText(/^email/i), 'jane@greenpack.com');
    await user.selectOptions(screen.getByLabelText(/^country/i), 'United States');
    await user.selectOptions(screen.getByLabelText(/product interest/i), 'Paper Cups');
    await user.click(screen.getByRole('button', { name: /submit enquiry/i }));
  }

  it('successful form submission shows acknowledgment message', async () => {
    const user = userEvent.setup();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        message: 'Thank you! Your enquiry has been received.',
      }),
    });

    render(<EnquiryFormWrapper />);
    await fillAndSubmitForm(user);

    await waitFor(() => {
      expect(screen.getByText(/enquiry has been received/i)).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/enquiry', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }));
  });

  it('network error shows error message and preserves form data', async () => {
    const user = userEvent.setup();
    global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    render(<EnquiryFormWrapper />);
    await fillAndSubmitForm(user);

    await waitFor(() => {
      expect(screen.getByText(/unable to connect/i)).toBeInTheDocument();
    });

    // Verify form data is preserved
    expect(screen.getByLabelText(/^name/i)).toHaveValue('Jane Smith');
    expect(screen.getByLabelText(/^company/i)).toHaveValue('GreenPack Ltd');
    expect(screen.getByLabelText(/^email/i)).toHaveValue('jane@greenpack.com');
  });
});

// --- Accessibility Audit ---

describe('Homepage Integration – Accessibility Audit (Req 8.1)', () => {
  it('passes axe-core accessibility checks on rendered sections', async () => {
    const { container } = renderFullHomepage();

    const results = await axe(container, {
      rules: {
        // Disable color-contrast check since we're in JSDOM without real CSS rendering
        'color-contrast': { enabled: false },
        // Disable landmark-unique since we have multiple generic regions
        'landmark-unique': { enabled: false },
      },
    });

    expect(results).toHaveNoViolations();
  });
});

// --- No Placeholder Text in Production Build ---

describe('Homepage Integration – No Placeholder Text (Req 14.3)', () => {
  it('check-placeholders script passes (exits 0) confirming no placeholder text', () => {
    const projectRoot = path.resolve(__dirname, '../..');
    const scriptPath = path.join(projectRoot, 'scripts/check-placeholders.js');

    const result = execSync(`node ${scriptPath}`, {
      cwd: projectRoot,
      encoding: 'utf-8',
    });

    expect(result).toContain('No placeholder content found');
  });
});
