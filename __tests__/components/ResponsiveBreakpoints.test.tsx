import '@testing-library/jest-dom';
import { render, screen, act } from '@testing-library/react';

// ─── Mock PaperBottlePlaceholder3D ───────────────────────────────────────────
jest.mock('@/components/PaperBottlePlaceholder3D', () => {
  return function MockPaperBottlePlaceholder3D() {
    return <div data-testid="mock-paper-bottle-placeholder" />;
  };
});

// ─── Mock modelConfig ────────────────────────────────────────────────────────
jest.mock('@/lib/3d-assets', () => ({
  HERO_BOTTLE_ASSET: {
    path: '/models/bottle.glb',
    available: false,
    fallbackImage: '/images/bottle-fallback.svg',
    alt: 'EcoPack Global paper water bottle',
  },
  EXPLODED_BOTTLE_ASSET: {
    path: '/models/bottle-exploded.glb',
    available: false,
    fallbackImage: '/images/bottle-exploded-fallback.svg',
    alt: 'Exploded view of EcoPack paper water bottle',
  },
}));

// ─── Mock @react-three/fiber ─────────────────────────────────────────────────
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="r3f-canvas">{children}</div>
  ),
  useFrame: jest.fn(),
}));

// ─── Mock @react-three/drei ──────────────────────────────────────────────────
jest.mock('@react-three/drei', () => ({
  useGLTF: jest.fn(() => ({
    scene: { traverse: jest.fn() },
  })),
  OrbitControls: () => null,
}));

// ─── Mock three ──────────────────────────────────────────────────────────────
jest.mock('three', () => ({
  MeshStandardMaterial: jest.fn(),
  Group: jest.fn(),
}));

// ─── Mock scrollProgress ─────────────────────────────────────────────────────
jest.mock('@/lib/scrollProgress', () => ({
  scrollProgress: { current: 0 },
}));

// ─── Mock useReducedMotion ───────────────────────────────────────────────────
jest.mock('@/lib/useReducedMotion', () => ({
  useReducedMotion: () => false,
}));

// ─── Mock useTabletPerformance ───────────────────────────────────────────────
jest.mock('@/lib/useTabletPerformance', () => ({
  useTabletPerformance: () => ({
    isTablet: false,
    shouldUseFallback: false,
    currentFps: 60,
  }),
}));

// ─── Mock react-hook-form (for EnquiryForm) ──────────────────────────────────
jest.mock('react-hook-form', () => ({
  useForm: () => ({
    register: (name: string) => ({ name, ref: jest.fn() }),
    handleSubmit: (fn: any) => (e: any) => { e?.preventDefault?.(); },
    formState: { errors: {} },
  }),
}));

jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: () => jest.fn(),
}));

import Navigation from '@/components/Navigation';
import Viewer3D from '@/components/Viewer3D';
import EnquiryForm from '@/components/EnquiryForm';

// ─── Access MockIntersectionObserver from jest.setup.ts ───────────────────────
const MockIntersectionObserver = (global as any).MockIntersectionObserver as {
  instances: Array<{
    observe: jest.Mock;
    disconnect: jest.Mock;
    trigger: (entries: Partial<IntersectionObserverEntry>[]) => void;
  }>;
};

// ─── Helper: mock canvas getContext for WebGL detection ──────────────────────
let webglSupported = true;
const originalCreateElement = document.createElement.bind(document);

// Helper: create mock section elements in the DOM for Navigation
function createMockSections() {
  const sectionIds = [
    'hero', 'paper-water-bottles', 'why-ecopack', 'product-portfolio',
    'industries', 'custom-branding', 'global-supply', 'how-it-works', 'enquiry',
  ];
  sectionIds.forEach((id) => {
    const el = document.createElement('div');
    el.id = id;
    document.body.appendChild(el);
  });
}

function cleanupMockSections() {
  const sectionIds = [
    'hero', 'paper-water-bottles', 'why-ecopack', 'product-portfolio',
    'industries', 'custom-branding', 'global-supply', 'how-it-works', 'enquiry',
  ];
  sectionIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });
}

beforeEach(() => {
  MockIntersectionObserver.instances = [];
  webglSupported = true;

  jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
    const el = originalCreateElement(tagName);
    if (tagName === 'canvas') {
      el.getContext = (contextId: string) => {
        if (contextId === 'webgl2' || contextId === 'webgl') {
          return webglSupported ? ({} as any) : null;
        }
        return null;
      };
    }
    return el;
  });

  createMockSections();
});

afterEach(() => {
  cleanupMockSections();
  jest.restoreAllMocks();
});

describe('Responsive Breakpoint Behavior', () => {
  describe('3D fallback on mobile viewport (Req 5.2, 5.3)', () => {
    it('shows fallback image when window.innerWidth < 768px', () => {
      // Mock mobile viewport width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <Viewer3D
          modelPath="/models/bottle.glb"
          fallbackImage="/images/bottle-fallback.webp"
          alt="EcoPack bottle mobile fallback"
        />
      );

      // On mobile, static fallback image should be rendered
      const fallbackImg = screen.getByAltText('EcoPack bottle mobile fallback');
      expect(fallbackImg).toBeInTheDocument();
      expect(fallbackImg).toHaveAttribute('src', '/images/bottle-fallback.webp');
    });

    it('does not render 3D canvas on mobile viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320,
      });

      render(
        <Viewer3D
          modelPath="/models/bottle.glb"
          fallbackImage="/images/bottle-fallback.webp"
          alt="EcoPack bottle"
        />
      );

      // 3D Canvas should NOT be rendered on mobile
      expect(screen.queryByTestId('r3f-canvas')).not.toBeInTheDocument();
    });

    it('renders 3D canvas when viewport is at or above 768px', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(
        <Viewer3D
          modelPath="/models/bottle.glb"
          fallbackImage="/images/bottle-fallback.webp"
          alt="EcoPack bottle"
        />
      );

      // Trigger IntersectionObserver to simulate in view
      const observer = MockIntersectionObserver.instances[0];
      act(() => {
        observer.trigger([{ isIntersecting: true, intersectionRatio: 1 }]);
      });

      // Canvas should be rendered at tablet+ breakpoint
      expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument();
      // Fallback should NOT be shown
      expect(screen.queryByAltText('EcoPack bottle')).not.toBeInTheDocument();
    });
  });

  describe('Navigation transforms to hamburger on mobile (Req 5.4)', () => {
    it('desktop nav has "hidden" and "tablet:block" classes (hidden on mobile, visible on tablet+)', () => {
      render(<Navigation />);

      const desktopNav = screen.getByLabelText('Main navigation');
      expect(desktopNav).toBeInTheDocument();
      expect(desktopNav).toHaveClass('hidden');
      expect(desktopNav).toHaveClass('tablet:block');
    });

    it('mobile hamburger container has "tablet:hidden" class (visible on mobile, hidden on tablet+)', () => {
      render(<Navigation />);

      // The mobile wrapper contains the hamburger button
      const hamburgerButton = screen.getByLabelText('Open navigation menu');
      // The mobile container is the grandparent with `tablet:hidden`
      const mobileContainer = hamburgerButton.closest('.tablet\\:hidden');
      expect(mobileContainer).toBeInTheDocument();
    });

    it('hamburger button exists with correct aria-label', () => {
      render(<Navigation />);

      const hamburger = screen.getByLabelText('Open navigation menu');
      expect(hamburger).toBeInTheDocument();
      expect(hamburger.tagName).toBe('BUTTON');
    });

    it('hamburger button has aria-expanded attribute', () => {
      render(<Navigation />);

      const hamburger = screen.getByLabelText('Open navigation menu');
      expect(hamburger).toHaveAttribute('aria-expanded', 'false');
    });

    it('hamburger button has aria-controls pointing to mobile menu', () => {
      render(<Navigation />);

      const hamburger = screen.getByLabelText('Open navigation menu');
      expect(hamburger).toHaveAttribute('aria-controls', 'mobile-navigation-menu');
    });
  });

  describe('Form stacks vertically on mobile (Req 5.3, 5.7)', () => {
    it('form uses flex flex-col layout for vertical stacking', () => {
      render(
        <EnquiryForm
          onSubmit={jest.fn()}
          submissionStatus="idle"
        />
      );

      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
      expect(form).toHaveClass('flex');
      expect(form).toHaveClass('flex-col');
    });

    it('all input fields have w-full class for full-width layout', () => {
      render(
        <EnquiryForm
          onSubmit={jest.fn()}
          submissionStatus="idle"
        />
      );

      // Get all input, select, and textarea elements
      const inputs = document.querySelectorAll('input, select, textarea');
      expect(inputs.length).toBeGreaterThan(0);

      inputs.forEach((input) => {
        expect(input).toHaveClass('w-full');
      });
    });

    it('form section has overflow-x-hidden to prevent horizontal scrolling', () => {
      render(
        <EnquiryForm
          onSubmit={jest.fn()}
          submissionStatus="idle"
        />
      );

      const section = document.querySelector('section#enquiry');
      expect(section).toBeInTheDocument();
      expect(section).toHaveClass('overflow-x-hidden');
    });

    it('each field wrapper uses flex flex-col for vertical label/input arrangement', () => {
      render(
        <EnquiryForm
          onSubmit={jest.fn()}
          submissionStatus="idle"
        />
      );

      // Each field wrapper div inside the form should be flex flex-col
      const form = document.querySelector('form');
      const fieldWrappers = form?.querySelectorAll(':scope > div');
      expect(fieldWrappers!.length).toBeGreaterThan(0);

      fieldWrappers!.forEach((wrapper) => {
        expect(wrapper).toHaveClass('flex');
        expect(wrapper).toHaveClass('flex-col');
      });
    });
  });
});
