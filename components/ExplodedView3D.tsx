'use client';

/**
 * ExplodedView3D - Scroll-driven exploded view of packaging layers
 * Validates: Requirement 2.2
 *
 * Features:
 * - Scroll-driven layer separation (0 = assembled, 1 = fully exploded)
 * - Four configurable layers: cap, body, liner, base
 * - WebGL detection with static fallback for unsupported browsers
 * - Mobile detection (viewport < 768px) with static fallback
 * - Conditional model loading: only calls useGLTF when asset is available
 * - Premium procedural fallback when GLB is not yet supplied
 * - Material: matte paper-like MeshStandardMaterial (roughness 0.85, metalness 0.02)
 * - Lighting matches Viewer3D (ambient ivory, directional shadows, champagne gold rim)
 */

import { useEffect, useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { ExplodedView3DProps, ExplodedViewLayer } from '@/types/viewer3d';
import { useTabletPerformance } from '@/lib/useTabletPerformance';
import { EXPLODED_BOTTLE_ASSET } from '@/lib/3d-assets';
import ExplodedBottleFallback3D from '@/components/ExplodedBottleFallback3D';

// ─── Design Tokens ───────────────────────────────────────────────────────────
const IVORY = '#F3F0E7';
const CHAMPAGNE_GOLD = '#C8A96B';
const OBSIDIAN = '#080A09';

// ─── Constants ───────────────────────────────────────────────────────────────
const MOBILE_BREAKPOINT = 768;

// ─── WebGL Detection ─────────────────────────────────────────────────────────
function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

// ─── Mobile Detection ────────────────────────────────────────────────────────
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

// ─── Scene Lighting (matches Viewer3D) ───────────────────────────────────────
function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.6} color={IVORY} />
      <directionalLight intensity={1.2} position={[3, 4, 5]} castShadow shadow-mapSize-width={512} shadow-mapSize-height={512} />
      <directionalLight intensity={0.4} position={[-3, 2, 3]} color={IVORY} />
      <pointLight intensity={0.5} color={CHAMPAGNE_GOLD} position={[-2, 3, -3]} />
      <pointLight intensity={0.4} color={CHAMPAGNE_GOLD} position={[2, -2, 4]} />
      {/* Rim light for depth */}
      <pointLight intensity={0.3} color={IVORY} position={[0, 0, -5]} />
    </>
  );
}

// ─── Exploded Layer Mesh (for real GLB model) ────────────────────────────────
interface ExplodedLayerProps {
  mesh: THREE.Mesh;
  layer: ExplodedViewLayer;
  scrollProgress: number;
  maxOffset: number;
}

function ExplodedLayer({ mesh, layer, scrollProgress, maxOffset }: ExplodedLayerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const basePosition = useRef<THREE.Vector3>(new THREE.Vector3());

  useEffect(() => {
    basePosition.current.copy(mesh.position);
  }, [mesh]);

  useFrame(() => {
    if (!meshRef.current) return;
    const yOffset = scrollProgress * maxOffset * layer.offsetDirection * layer.offsetWeight;
    meshRef.current.position.set(
      basePosition.current.x,
      basePosition.current.y + yOffset,
      basePosition.current.z
    );
  });

  return (
    <mesh
      ref={meshRef}
      geometry={mesh.geometry}
      position={[mesh.position.x, mesh.position.y, mesh.position.z]}
      rotation={[mesh.rotation.x, mesh.rotation.y, mesh.rotation.z]}
      scale={[mesh.scale.x, mesh.scale.y, mesh.scale.z]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color="#e8e0d4"
        roughness={0.85}
        metalness={0.02}
      />
    </mesh>
  );
}

// ─── Exploded Model (only rendered when GLB is available) ────────────────────
// IMPORTANT: This component calls useGLTF and must ONLY be rendered
// when the asset is confirmed available.
interface ExplodedModelProps {
  modelUrl: string;
  layers: ExplodedViewLayer[];
  scrollProgress: number;
  maxOffset: number;
}

function ExplodedModel({ modelUrl, layers, scrollProgress, maxOffset }: ExplodedModelProps) {
  const { scene } = useGLTF(modelUrl);
  const [layerMeshes, setLayerMeshes] = useState<Map<string, THREE.Mesh>>(new Map());

  useEffect(() => {
    const meshMap = new Map<string, THREE.Mesh>();

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const matchingLayer = layers.find(
          (layer) => mesh.name.toLowerCase().includes(layer.id.toLowerCase())
        );
        if (matchingLayer) {
          meshMap.set(matchingLayer.id, mesh);
        }
      }
    });

    // If no named meshes matched, assign meshes sequentially to layers
    if (meshMap.size === 0) {
      const meshes: THREE.Mesh[] = [];
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          meshes.push(child as THREE.Mesh);
        }
      });
      layers.forEach((layer, index) => {
        if (index < meshes.length) {
          meshMap.set(layer.id, meshes[index]);
        }
      });
    }

    setLayerMeshes(meshMap);
  }, [scene, layers]);

  return (
    <group>
      {layers.map((layer) => {
        const mesh = layerMeshes.get(layer.id);
        if (!mesh) return null;
        return (
          <ExplodedLayer
            key={layer.id}
            mesh={mesh}
            layer={layer}
            scrollProgress={scrollProgress}
            maxOffset={maxOffset}
          />
        );
      })}
    </group>
  );
}

// ─── Error Boundary for GLB loading failures ─────────────────────────────────
import { Component, type ReactNode, type ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  onError: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ModelErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
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

// ─── Static Fallback Image ───────────────────────────────────────────────────
interface FallbackImageProps {
  src: string;
  alt: string;
}

function FallbackImage({ src, alt }: FallbackImageProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-obsidian p-8">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain max-w-[500px] max-h-[600px] mx-auto"
        loading="lazy"
      />
    </div>
  );
}

// ─── Main ExplodedView3D Component ───────────────────────────────────────────
export default function ExplodedView3D({
  scrollProgress,
  maxOffset,
  layers,
  modelUrl,
  fallbackImageUrl,
  fallbackImageAlt,
  showLabels,
  className = '',
}: ExplodedView3DProps) {
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const [hasError, setHasError] = useState(false);
  const isMobile = useIsMobile();
  const { isTablet, shouldUseFallback: tabletFpsFallback } = useTabletPerformance();

  // Check if the 3D asset is actually available
  const assetAvailable = EXPLODED_BOTTLE_ASSET.available;

  // WebGL detection on mount
  useEffect(() => {
    const supported = detectWebGL();
    setWebglSupported(supported);
  }, []);

  // Determine if we should show the static image fallback (mobile only)
  const showStaticFallback = isMobile || webglSupported === false || tabletFpsFallback;

  // Should we try to load the real model or use procedural fallback?
  const useProceduralFallback = !assetAvailable || hasError;

  return (
    <div
      className={`relative w-full h-full ${className}`}
      aria-label="Exploded 3D product view showing packaging layers"
      aria-description="A scroll-driven 3D visualization that progressively separates the paper water bottle into its component layers: cap, body, liner, and base, as you scroll through this section."
      role="img"
    >
      {/* Static fallback: mobile, no WebGL, or tablet FPS issues */}
      {showStaticFallback && (
        <FallbackImage src={fallbackImageUrl} alt={fallbackImageAlt} />
      )}

      {/* 3D Canvas: rendered on desktop/tablet with WebGL support */}
      {!showStaticFallback && webglSupported && (
        <div className="absolute inset-0">
          <Canvas
            dpr={isTablet ? [1, 1.5] : [1, 2]}
            frameloop="always"
            camera={{ fov: 40, near: 0.1, far: 100, position: [0, 0, 9] }}
            shadows={!isTablet}
            gl={{ antialias: !isTablet }}
            style={{ background: OBSIDIAN }}
          >
            <SceneLighting />
            <Suspense fallback={null}>
              {useProceduralFallback ? (
                /* Procedural fallback: premium 3D placeholder with scroll interaction */
                <ExplodedBottleFallback3D
                  scrollProgress={scrollProgress}
                  maxOffset={maxOffset}
                  layers={layers}
                />
              ) : (
                /* Real model: only loaded when asset is confirmed available */
                <ModelErrorBoundary onError={() => {
                  console.info('[ExplodedView3D] GLB load failed — using procedural fallback.');
                  setHasError(true);
                }}>
                  <ExplodedModel
                    modelUrl={modelUrl}
                    layers={layers}
                    scrollProgress={scrollProgress}
                    maxOffset={maxOffset}
                  />
                </ModelErrorBoundary>
              )}
            </Suspense>
          </Canvas>

          {/* Layer labels overlay with connector lines */}
          {showLabels && scrollProgress > 0.15 && (
            <div
              className="absolute inset-0 pointer-events-none"
              aria-hidden="true"
            >
              {layers.map((layer, index) => {
                const topPercent = 15 + index * 20;
                const opacity = Math.min((scrollProgress - 0.15) / 0.25, 1);
                return (
                  <div
                    key={layer.id}
                    className="absolute flex items-center gap-3"
                    style={{
                      top: `${topPercent}%`,
                      right: '5%',
                      opacity,
                      transition: 'opacity 0.3s ease',
                    }}
                  >
                    {/* Connector line */}
                    <div className="w-16 tablet:w-24 h-px bg-champagne-gold/50" />
                    {/* Label */}
                    <span className="text-ivory text-xs tablet:text-sm font-sora font-medium tracking-wider uppercase whitespace-nowrap">
                      {layer.name}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
