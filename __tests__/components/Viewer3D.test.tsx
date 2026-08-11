import '@testing-library/jest-dom';
import { render, screen, act } from '@testing-library/react';
import Viewer3D from '@/components/Viewer3D';

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
    available: true, // Set to true so tests can exercise the model loading path
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
  DoubleSide: 2,
  Vector2: jest.fn(),
}));

// ─── Mock scrollProgress ─────────────────────────────────────────────────────
jest.mock('@/lib/scrollProgress', () => ({
  scrollProgress: { current: 0 },
}));

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

beforeEach(() => {
  MockIntersectionObserver.instances = [];
  webglSupported = true;

  // Mock fetch for model availability check (HEAD request)
  global.fetch = jest.fn().mockResolvedValue({ ok: true });

  jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
    const el = originalCreateElement(tagName);
    if (tagName === 'canvas') {
      (el as HTMLCanvasElement).getContext = ((contextId: string) => {
        if (contextId === 'webgl2' || contextId === 'webgl') {
          return webglSupported ? ({} as any) : null;
        }
        return null;
      }) as any;
    }
    return el;
  });
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
  (global.fetch as jest.Mock)?.mockRestore?.();
});

describe('Viewer3D Component', () => {
  describe('WebGL unsupported scenario shows static fallback (Req 1.5)', () => {
    it('displays fallback image immediately when WebGL is not supported', () => {
      webglSupported = false;

      render(
        <Viewer3D
          modelPath="/models/bottle.glb"
          fallbackImage="/images/bottle-fallback.webp"
          alt="EcoPack bottle"
        />
      );

      const fallbackImg = screen.getByAltText('EcoPack bottle');
      expect(fallbackImg).toBeInTheDocument();
      expect(fallbackImg).toHaveAttribute('src', '/images/bottle-fallback.webp');
    });

    it('does not render the 3D canvas when WebGL is unsupported', () => {
      webglSupported = false;

      render(
        <Viewer3D
          modelPath="/models/bottle.glb"
          fallbackImage="/images/bottle-fallback.webp"
          alt="EcoPack bottle"
        />
      );

      expect(screen.queryByTestId('r3f-canvas')).not.toBeInTheDocument();
    });

    it('calls onLoadingStateChange with "error" when WebGL is not supported', () => {
      webglSupported = false;
      const onStateChange = jest.fn();

      render(
        <Viewer3D
          modelPath="/models/bottle.glb"
          fallbackImage="/images/bottle-fallback.webp"
          alt="EcoPack bottle"
          onLoadingStateChange={onStateChange}
        />
      );

      expect(onStateChange).toHaveBeenCalledWith('error');
    });
  });

  describe('10-second timeout shows fallback image (Req 6.3)', () => {
    it('uses 3D placeholder after 10-second timeout when model is available but slow', async () => {
      jest.useFakeTimers();
      // Model returns 200 on HEAD but never actually loads in time
      global.fetch = jest.fn().mockResolvedValue({ ok: true });

      render(
        <Viewer3D
          modelPath="/models/bottle.glb"
          fallbackImage="/images/bottle-fallback.webp"
          alt="EcoPack bottle"
        />
      );

      // Trigger IntersectionObserver to simulate component coming into view
      const observer = MockIntersectionObserver.instances[0];
      await act(async () => {
        observer.trigger([{ isIntersecting: true, intersectionRatio: 1 }]);
      });

      // Wait for HEAD request to resolve
      await act(async () => {
        await Promise.resolve();
      });

      // Advance time by 10 seconds
      act(() => {
        jest.advanceTimersByTime(10_000);
      });

      // Should show the 3D placeholder (not static fallback)
      expect(screen.getByTestId('mock-paper-bottle-placeholder')).toBeInTheDocument();
    });

    it('calls onLoadingStateChange with "loaded" after timeout (falls back to placeholder)', async () => {
      jest.useFakeTimers();
      const onStateChange = jest.fn();
      global.fetch = jest.fn().mockResolvedValue({ ok: true });

      render(
        <Viewer3D
          modelPath="/models/bottle.glb"
          fallbackImage="/images/bottle-fallback.webp"
          alt="EcoPack bottle"
          onLoadingStateChange={onStateChange}
        />
      );

      const observer = MockIntersectionObserver.instances[0];
      await act(async () => {
        observer.trigger([{ isIntersecting: true, intersectionRatio: 1 }]);
      });

      // Wait for HEAD request
      await act(async () => {
        await Promise.resolve();
      });

      act(() => {
        jest.advanceTimersByTime(10_000);
      });

      expect(onStateChange).toHaveBeenCalledWith('loaded');
    });

    it('shows static fallback when model 404s on HEAD check', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 });

      render(
        <Viewer3D
          modelPath="/models/bottle.glb"
          fallbackImage="/images/bottle-fallback.webp"
          alt="EcoPack bottle"
        />
      );

      // Trigger IntersectionObserver
      const observer = MockIntersectionObserver.instances[0];
      await act(async () => {
        observer.trigger([{ isIntersecting: true, intersectionRatio: 1 }]);
      });

      // Wait for HEAD request to resolve
      await act(async () => {
        await Promise.resolve();
      });

      // Should show the 3D placeholder instead of crashing
      expect(screen.getByTestId('mock-paper-bottle-placeholder')).toBeInTheDocument();
    });
  });

  describe('Loading indicator displays while model loads (Req 6.4)', () => {
    it('shows loading indicator after component enters viewport and model is available', async () => {
      jest.useFakeTimers();
      global.fetch = jest.fn().mockResolvedValue({ ok: true });

      render(
        <Viewer3D
          modelPath="/models/bottle.glb"
          fallbackImage="/images/bottle-fallback.webp"
          alt="EcoPack bottle"
        />
      );

      // Before intersection, no loading indicator
      expect(screen.queryByRole('status')).not.toBeInTheDocument();

      // Trigger IntersectionObserver
      const observer = MockIntersectionObserver.instances[0];
      await act(async () => {
        observer.trigger([{ isIntersecting: true, intersectionRatio: 1 }]);
      });

      // Wait for HEAD request to resolve
      await act(async () => {
        await Promise.resolve();
      });

      // Loading indicator should be visible
      const loadingIndicator = screen.getByRole('status');
      expect(loadingIndicator).toBeInTheDocument();
      expect(loadingIndicator).toHaveAttribute('aria-label', 'Loading 3D model');
    });

    it('calls onLoadingStateChange with "loading" when model starts loading', async () => {
      jest.useFakeTimers();
      const onStateChange = jest.fn();
      global.fetch = jest.fn().mockResolvedValue({ ok: true });

      render(
        <Viewer3D
          modelPath="/models/bottle.glb"
          fallbackImage="/images/bottle-fallback.webp"
          alt="EcoPack bottle"
          onLoadingStateChange={onStateChange}
        />
      );

      const observer = MockIntersectionObserver.instances[0];
      await act(async () => {
        observer.trigger([{ isIntersecting: true, intersectionRatio: 1 }]);
      });

      // Wait for HEAD request
      await act(async () => {
        await Promise.resolve();
      });

      expect(onStateChange).toHaveBeenCalledWith('loading');
    });
  });
});
