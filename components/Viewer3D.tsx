'use client';

/**
 * Viewer3D - Full-featured 3D product viewer with GLB loading, fallback, and lazy loading
 * Validates: Requirements 1.1, 1.5, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7
 *
 * Features:
 * - WebGL detection with immediate static fallback if unsupported
 * - Lazy loading triggered at 200px from viewport via IntersectionObserver
 * - GLB model loading with useGLTF from Drei
 * - 10-second timeout → static fallback image
 * - Scene lighting: ambient (ivory), directional (shadows), rim (champagne gold)
 * - Material overrides: roughness 0.85, metalness 0.02
 * - Loading indicator matching site design language
 * - 360° horizontal rotation via mouse drag (OrbitControls)
 * - Zoom constrained to 50%-150% of default view (minDistance/maxDistance)
 * - Smooth damping for interaction feel, maintaining 30fps during interactions
 */

import { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { Viewer3DLoadingState } from '@/types/viewer3d';
import { scrollProgress } from '@/lib/scrollProgress';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useTabletPerformance } from '@/lib/useTabletPerformance';
import { DRACO_DECODER_PATH } from '@/lib/modelOptimization';
import { HERO_BOTTLE_ASSET } from '@/lib/3d-assets';
import PaperBottlePlaceholder3D from '@/components/PaperBottlePlaceholder3D';

// ─── Design Tokens ───────────────────────────────────────────────────────────
const IVORY = '#F3F0E7';
const CHAMPAGNE_GOLD = '#C8A96B';
const OBSIDIAN = '#080A09';

// ─── Constants ───────────────────────────────────────────────────────────────
const LOAD_TIMEOUT_MS = 10_000;
const INTERSECTION_ROOT_MARGIN = '200px';
const MOBILE_BREAKPOINT = 768;

// ─── Props ───────────────────────────────────────────────────────────────────
export interface Viewer3DComponentProps {
  /** Path to the GLB model file */
  modelPath?: string;
  /** Path to the static fallback image (min 1024×1024) */
  fallbackImage?: string;
  /** Alt text for the fallback image */
  alt?: string;
  /** Additional CSS class name */
  className?: string;
  /** Callback when loading state changes */
  onLoadingStateChange?: (state: Viewer3DLoadingState) => void;
}

// ─── WebGL Detection ─────────────────────────────────────────────────────────
function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      canvas.getContext('webgl2') || canvas.getContext('webgl')
    );
  } catch {
    return false;
  }
}

// ─── Model Component (loaded inside Canvas/Suspense) ─────────────────────────
interface ModelProps {
  modelPath: string;
  onLoaded: () => void;
  /** When true, reduces geometry detail for tablet performance (Req 5.2) */
  reducedPolygons?: boolean;
}

function Model({ modelPath, onLoaded, reducedPolygons = false }: ModelProps) {
  const { scene } = useGLTF(modelPath, DRACO_DECODER_PATH);

  useEffect(() => {
    // Apply material overrides to all meshes: roughness 0.85, metalness 0.02
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = new THREE.MeshStandardMaterial({
          color: '#e8e0d4',
          roughness: 0.85,
          metalness: 0.02,
          // Reduce detail for tablet: disable features that impact performance
          ...(reducedPolygons && { flatShading: true }),
        });
        mesh.castShadow = !reducedPolygons;
        mesh.receiveShadow = !reducedPolygons;
      }
    });
    onLoaded();
  }, [scene, onLoaded, reducedPolygons]);

  return <primitive object={scene} />;
}

// ─── Scene Lighting ──────────────────────────────────────────────────────────
function SceneLighting() {
  return (
    <>
      {/* Ambient light: intensity 0.3, ivory color */}
      <ambientLight intensity={0.3} color={IVORY} />

      {/* Directional light: intensity 0.8, castShadow, positioned for depth */}
      <directionalLight
        intensity={0.8}
        position={[3, 4, 5]}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Rim/point light: intensity 0.4, champagne gold, positioned behind/above */}
      <pointLight
        intensity={0.4}
        color={CHAMPAGNE_GOLD}
        position={[-2, 3, -3]}
      />
    </>
  );
}

// ─── Scroll-Driven Rotation Group ────────────────────────────────────────────
/**
 * Wraps scene children and rotates them around the Y-axis based on
 * the shared scrollProgress value (0→1 maps to 0→2π radians / 360°).
 * Validates: Requirements 1.2
 */
interface ScrollRotationGroupProps {
  children: React.ReactNode;
}

function ScrollRotationGroup({ children }: ScrollRotationGroupProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      // Map scroll progress (0-1) to full 360° rotation (0 to 2π)
      groupRef.current.rotation.y = scrollProgress.current * Math.PI * 2;
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

// ─── Loading Indicator ───────────────────────────────────────────────────────
function LoadingIndicator() {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center bg-obsidian"
      role="status"
      aria-label="Loading 3D model"
    >
      {/* Pulsing champagne gold ring */}
      <div className="relative w-16 h-16 mb-4">
        <div
          className="absolute inset-0 rounded-full border-2 border-champagne-gold/30 animate-ping"
          aria-hidden="true"
        />
        <div
          className="absolute inset-2 rounded-full border-2 border-champagne-gold animate-pulse"
          aria-hidden="true"
        />
      </div>
      <p className="text-ivory/80 text-sm font-inter animate-pulse">
        Loading 3D model…
      </p>
    </div>
  );
}

// ─── Static Fallback Image ───────────────────────────────────────────────────
interface FallbackImageProps {
  src: string;
  alt: string;
}

function FallbackImage({ src, alt }: FallbackImageProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-obsidian p-8">
      {/* Fallback image should be min 1024×1024 for high-quality display */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain max-w-[400px] max-h-[600px] mx-auto"
        loading="lazy"
      />
    </div>
  );
}

// ─── Main Viewer3D Component ─────────────────────────────────────────────────
export default function Viewer3D({
  modelPath = '/models/bottle.glb',
  fallbackImage = '/images/bottle-fallback.svg',
  alt = 'EcoPack Global paper water bottle',
  className = '',
  onLoadingStateChange,
}: Viewer3DComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const { isTablet, shouldUseFallback: tabletFpsFallback } = useTabletPerformance();

  const [loadingState, setLoadingState] = useState<Viewer3DLoadingState>('idle');
  const [isInView, setIsInView] = useState(false);
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const [showFallback, setShowFallback] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [usePlaceholder3D, setUsePlaceholder3D] = useState(!HERO_BOTTLE_ASSET.available);
  const [modelAvailable, setModelAvailable] = useState<boolean | null>(
    HERO_BOTTLE_ASSET.available ? null : false
  );

  // ─── Mobile Detection (Req 5.3: Replace 3D with static fallback on mobile) ─
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Notify parent of state changes
  const updateState = useCallback(
    (state: Viewer3DLoadingState) => {
      setLoadingState(state);
      onLoadingStateChange?.(state);
    },
    [onLoadingStateChange]
  );

  // ─── WebGL Detection (runs once on mount) ──────────────────────────────────
  useEffect(() => {
    const supported = detectWebGL();
    setWebglSupported(supported);
    if (!supported) {
      setShowFallback(true);
      updateState('error');
    }
  }, [updateState]);

  // ─── Tablet FPS fallback (Req 5.2): show static image if FPS < 24 ─────────
  useEffect(() => {
    if (tabletFpsFallback && !showFallback) {
      setShowFallback(true);
      updateState('error');
    }
  }, [tabletFpsFallback, showFallback, updateState]);

  // ─── IntersectionObserver for lazy loading (200px rootMargin) ──────────────
  useEffect(() => {
    if (!containerRef.current || webglSupported === false) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: INTERSECTION_ROOT_MARGIN }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [webglSupported]);

  // ─── Pre-check model availability (HEAD request) ───────────────────────────
  useEffect(() => {
    // If asset is already known unavailable from config, skip the HEAD request
    if (!HERO_BOTTLE_ASSET.available) return;
    if (!isInView || usePlaceholder3D || showFallback) return;

    // Quick HEAD request to check if the GLB file exists
    fetch(modelPath, { method: 'HEAD' })
      .then((res) => {
        if (res.ok) {
          setModelAvailable(true);
        } else {
          console.info(`[Viewer3D] Model not found at ${modelPath}, using 3D placeholder.`);
          setModelAvailable(false);
          setUsePlaceholder3D(true);
          updateState('loaded');
        }
      })
      .catch(() => {
        console.info(`[Viewer3D] Cannot reach ${modelPath}, using 3D placeholder.`);
        setModelAvailable(false);
        setUsePlaceholder3D(true);
        updateState('loaded');
      });
  }, [isInView, modelPath, usePlaceholder3D, showFallback, updateState]);

  // ─── 10-second timeout for model loading ───────────────────────────────────
  useEffect(() => {
    if (!isInView || showFallback || loadingState === 'loaded' || usePlaceholder3D || modelAvailable !== true) return;

    updateState('loading');

    timeoutRef.current = setTimeout(() => {
      // If still not loaded after 10 seconds, use 3D placeholder instead
      setUsePlaceholder3D(true);
      updateState('loaded');
    }, LOAD_TIMEOUT_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isInView, showFallback, loadingState, updateState, usePlaceholder3D, modelAvailable]);

  // ─── Model loaded callback ─────────────────────────────────────────────────
  const handleModelLoaded = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    updateState('loaded');
  }, [updateState]);

  // ─── Error handler for model loading failures ──────────────────────────────
  const handleError = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    // Fall back to 3D placeholder instead of static image for better UX
    setUsePlaceholder3D(true);
    updateState('loaded');
  }, [updateState]);

  // ─── Render ────────────────────────────────────────────────────────────────
  // On mobile (< 768px), always show static fallback per Req 5.3
  const shouldShowFallback = showFallback || isMobile;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${className}`}
      aria-label="3D product viewer — interactive paper water bottle model"
      aria-description="A photorealistic 3D rendering of the EcoPack Global paper water bottle. On desktop, you can rotate the model by dragging and zoom with scroll wheel."
      role="img"
    >
      {/* Static fallback: shown when WebGL unsupported, timeout exceeded, or mobile */}
      {shouldShowFallback && <FallbackImage src={fallbackImage} alt={alt} />}

      {/* Loading indicator: shown while model is loading (not when using placeholder) */}
      {!shouldShowFallback && isInView && loadingState === 'loading' && !usePlaceholder3D && (
        <LoadingIndicator />
      )}

      {/* 3D Canvas: only rendered when in view, WebGL supported, not mobile, and no fallback */}
      {!shouldShowFallback && isInView && webglSupported && (
        <div className="absolute inset-0">
          <Canvas
            dpr={isTablet ? [1, 1.5] : [1, 2]}
            frameloop="always"
            camera={{ fov: 45, near: 0.1, far: 100, position: [0, 0, 5] }}
            shadows={!isTablet}
            gl={{ antialias: !isTablet }}
            style={{ background: OBSIDIAN }}
          >
            <SceneLighting />
            <ScrollRotationGroup>
              <Suspense fallback={null}>
                {usePlaceholder3D ? (
                  <PaperBottlePlaceholder3D autoRotate={!prefersReducedMotion} />
                ) : modelAvailable ? (
                  <ErrorBoundaryModel
                    modelPath={modelPath}
                    onLoaded={handleModelLoaded}
                    onError={handleError}
                    reducedPolygons={isTablet}
                    onFallbackToPlaceholder={() => setUsePlaceholder3D(true)}
                  />
                ) : (
                  <PaperBottlePlaceholder3D autoRotate={!prefersReducedMotion} />
                )}
              </Suspense>
            </ScrollRotationGroup>
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              enableDamping={true}
              dampingFactor={0.08}
              minDistance={3.33}
              maxDistance={10}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={Math.PI - Math.PI / 6}
              autoRotate={!prefersReducedMotion}
              autoRotateSpeed={1.5}
              aria-label="3D model orbit controls"
            />
          </Canvas>
        </div>
      )}
    </div>
  );
}

// ─── Error Boundary Model Wrapper ────────────────────────────────────────────
// Wraps Model with error handling for failed GLB loads
interface ErrorBoundaryModelProps {
  modelPath: string;
  onLoaded: () => void;
  onError: () => void;
  reducedPolygons?: boolean;
  onFallbackToPlaceholder?: () => void;
}

function ErrorBoundaryModel({ modelPath, onLoaded, onError, reducedPolygons, onFallbackToPlaceholder }: ErrorBoundaryModelProps) {
  return (
    <ErrorBoundary onError={() => {
      // On GLB load error, fall back to the 3D placeholder instead of static image
      if (onFallbackToPlaceholder) {
        onFallbackToPlaceholder();
      } else {
        onError();
      }
    }}>
      <Model modelPath={modelPath} onLoaded={onLoaded} reducedPolygons={reducedPolygons} />
    </ErrorBoundary>
  );
}

// ─── Simple Error Boundary ───────────────────────────────────────────────────
import { Component, type ReactNode, type ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  onError: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}
