'use client';

/**
 * Globe3D - Premium interactive 3D globe with market markers and route arcs
 * Validates: Requirements 10.1, 10.2, 10.3, 10.4
 *
 * Features:
 * - Cursor-driven rotation with smooth damping
 * - Slow idle rotation when cursor is idle
 * - Dark forest-green land on obsidian ocean with strong lighting
 * - Champagne-gold market markers with pulse
 * - Curved 3D arc routes from India to target markets
 * - Travelling particles along routes
 * - Subtle grid lines
 * - Respects prefers-reduced-motion
 */

import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';

// Extend Three.js Line so R3F doesn't confuse it with SVG <line>
extend({ Line_: THREE.Line });

declare module '@react-three/fiber' {
  interface ThreeElements {
    line_: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      geometry?: THREE.BufferGeometry;
      children?: React.ReactNode;
      key?: string | number;
    };
  }
}

// ─── Design Tokens ───────────────────────────────────────────────────────────
const OBSIDIAN = '#080A09';
const FOREST_GREEN = '#0B2F26';
const FOREST_GREEN_BRIGHT = '#14503f';
const SECONDARY_GREEN = '#1C4A3B';
const CHAMPAGNE_GOLD = '#C8A96B';
const IVORY = '#F3F0E7';

// ─── Market Configuration ────────────────────────────────────────────────────
interface MarketPoint {
  id: string;
  name: string;
  label: string;
  lat: number;
  lng: number;
  isPrimary?: boolean;
}

const MARKETS: MarketPoint[] = [
  { id: 'india', name: 'India', label: 'Primary Market', lat: 20.5937, lng: 78.9629, isPrimary: true },
  { id: 'usa', name: 'USA', label: 'Target Market', lat: 37.0902, lng: -95.7129 },
  { id: 'uae', name: 'UAE', label: 'Target Market', lat: 23.4241, lng: 53.8478 },
  { id: 'uk', name: 'UK', label: 'Target Market', lat: 55.3781, lng: -3.4360 },
  { id: 'canada', name: 'Canada', label: 'Target Market', lat: 56.1304, lng: -106.3468 },
];

const ROUTES = MARKETS.filter((m) => !m.isPrimary).map((m) => ({
  from: MARKETS[0],
  to: m,
}));

// ─── Utility ─────────────────────────────────────────────────────────────────

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function createArcCurve(from: THREE.Vector3, to: THREE.Vector3, radius: number): THREE.CubicBezierCurve3 {
  const mid = from.clone().add(to).multiplyScalar(0.5);
  const distance = from.distanceTo(to);
  mid.normalize().multiplyScalar(radius + distance * 0.35);
  const ctrl1 = from.clone().lerp(mid, 0.33);
  const ctrl2 = to.clone().lerp(mid, 0.33);
  return new THREE.CubicBezierCurve3(from, ctrl1, ctrl2, to);
}

// ─── Cursor Tracker (shared state via ref) ───────────────────────────────────
function useCursorPosition() {
  const cursor = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      cursor.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      cursor.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return cursor;
}

// ─── Main Globe Group (all elements rotate together) ─────────────────────────
function GlobeGroup({
  prefersReducedMotion,
  progress,
  cursor,
}: {
  prefersReducedMotion: boolean;
  progress: number;
  cursor: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const targetRotation = useRef({ x: 0, y: 0 });
  const idleRotation = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (prefersReducedMotion) {
      // Static angle showing India region
      groupRef.current.rotation.y = -1.3;
      groupRef.current.rotation.x = 0.15;
      return;
    }

    // Idle rotation (always running)
    idleRotation.current += delta * 0.08;

    // Cursor-driven target (with limits)
    const cursorInfluenceY = cursor.current.x * 1.2;
    const cursorInfluenceX = cursor.current.y * 0.4;

    // Combine idle + cursor
    targetRotation.current.y = idleRotation.current + cursorInfluenceY;
    targetRotation.current.x = Math.max(-0.6, Math.min(0.6, cursorInfluenceX));

    // Smooth damping toward target
    groupRef.current.rotation.y += (targetRotation.current.y - groupRef.current.rotation.y) * 0.02;
    groupRef.current.rotation.x += (targetRotation.current.x - groupRef.current.rotation.x) * 0.02;
  });

  return (
    <group ref={groupRef}>
      {/* Globe sphere - ocean */}
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          color="#0a1a14"
          roughness={0.85}
          metalness={0.15}
        />
      </mesh>

      {/* Continent patches */}
      <ContinentPatches />

      {/* Grid lines */}
      <GridLines />

      {/* Market markers */}
      <MarketMarkers progress={progress} prefersReducedMotion={prefersReducedMotion} />

      {/* Route arcs */}
      <RouteArcs progress={progress} prefersReducedMotion={prefersReducedMotion} />
    </group>
  );
}

// ─── Continent Patches ───────────────────────────────────────────────────────
function ContinentPatches() {
  const patches = useMemo(() => {
    const centers = [
      { lat: 40, lng: -100, scale: 0.5 },
      { lat: 55, lng: -105, scale: 0.35 },
      { lat: 28, lng: -85, scale: 0.3 },
      { lat: 20, lng: -100, scale: 0.2 },
      { lat: -10, lng: -55, scale: 0.4 },
      { lat: -25, lng: -58, scale: 0.3 },
      { lat: -35, lng: -65, scale: 0.2 },
      { lat: 50, lng: 10, scale: 0.3 },
      { lat: 47, lng: 25, scale: 0.22 },
      { lat: 55, lng: 40, scale: 0.2 },
      { lat: 60, lng: 25, scale: 0.18 },
      { lat: 5, lng: 20, scale: 0.45 },
      { lat: -5, lng: 28, scale: 0.35 },
      { lat: -20, lng: 30, scale: 0.25 },
      { lat: 15, lng: 10, scale: 0.2 },
      { lat: 30, lng: 75, scale: 0.4 },
      { lat: 22, lng: 80, scale: 0.3 },
      { lat: 35, lng: 105, scale: 0.4 },
      { lat: 45, lng: 90, scale: 0.3 },
      { lat: 55, lng: 70, scale: 0.35 },
      { lat: 60, lng: 100, scale: 0.3 },
      { lat: 25, lng: 50, scale: 0.2 },
      { lat: 10, lng: 105, scale: 0.25 },
      { lat: -5, lng: 120, scale: 0.2 },
      { lat: -25, lng: 135, scale: 0.35 },
      { lat: -30, lng: 140, scale: 0.2 },
    ];

    return centers.map((c, i) => ({
      position: latLngToVector3(c.lat, c.lng, 2.005),
      normal: latLngToVector3(c.lat, c.lng, 1).normalize(),
      scale: c.scale,
      key: i,
    }));
  }, []);

  return (
    <group>
      {patches.map(({ position, normal, scale, key }) => {
        // Orient each patch to face outward from the globe center
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
        return (
          <mesh key={key} position={position} quaternion={quaternion}>
            <circleGeometry args={[scale, 24]} />
            <meshStandardMaterial
              color={FOREST_GREEN_BRIGHT}
              roughness={0.8}
              metalness={0.0}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// ─── Grid Lines ──────────────────────────────────────────────────────────────
function GridLines() {
  const lines = useMemo(() => {
    const geometry: THREE.BufferGeometry[] = [];
    const radius = 2.003;

    for (let lat = -60; lat <= 60; lat += 30) {
      const points: THREE.Vector3[] = [];
      for (let lng = 0; lng <= 360; lng += 5) {
        points.push(latLngToVector3(lat, lng - 180, radius));
      }
      const curve = new THREE.CatmullRomCurve3(points, true);
      geometry.push(new THREE.BufferGeometry().setFromPoints(curve.getPoints(72)));
    }

    for (let lng = 0; lng < 360; lng += 30) {
      const points: THREE.Vector3[] = [];
      for (let lat = -90; lat <= 90; lat += 5) {
        points.push(latLngToVector3(lat, lng - 180, radius));
      }
      geometry.push(new THREE.BufferGeometry().setFromPoints(points));
    }

    return geometry;
  }, []);

  return (
    <group>
      {lines.map((geo, i) => (
        <line_ key={i} geometry={geo}>
          <lineBasicMaterial color={SECONDARY_GREEN} transparent opacity={0.18} />
        </line_>
      ))}
    </group>
  );
}

// ─── Market Markers ──────────────────────────────────────────────────────────
function MarketMarkers({ progress, prefersReducedMotion }: { progress: number; prefersReducedMotion: boolean }) {
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta;
  });

  return (
    <group>
      {MARKETS.map((market, i) => {
        const pos = latLngToVector3(market.lat, market.lng, 2.025);
        const markerProgress = prefersReducedMotion ? 1 : Math.max(0, Math.min(1, (progress - 0.1 - i * 0.06) * 4));
        if (markerProgress <= 0) return null;

        const pulseScale = market.isPrimary ? 1 + Math.sin(timeRef.current * 2.5) * 0.15 : 1;

        return (
          <group key={market.id} position={pos} scale={markerProgress * pulseScale}>
            {/* Outer glow sphere */}
            <mesh>
              <sphereGeometry args={[market.isPrimary ? 0.07 : 0.045, 16, 16]} />
              <meshBasicMaterial
                color={CHAMPAGNE_GOLD}
                transparent
                opacity={market.isPrimary ? 0.9 : 0.7}
              />
            </mesh>
            {/* Inner bright core */}
            <mesh>
              <sphereGeometry args={[market.isPrimary ? 0.035 : 0.022, 12, 12]} />
              <meshBasicMaterial color={IVORY} />
            </mesh>
            {/* Outer pulse ring (primary only) */}
            {market.isPrimary && (
              <mesh scale={1.8}>
                <sphereGeometry args={[0.06, 12, 12]} />
                <meshBasicMaterial color={CHAMPAGNE_GOLD} transparent opacity={0.15} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

// ─── Route Arcs + Travelling Particles ───────────────────────────────────────
function RouteArcs({ progress, prefersReducedMotion }: { progress: number; prefersReducedMotion: boolean }) {
  const arcs = useMemo(() => {
    return ROUTES.map((route) => {
      const from = latLngToVector3(route.from.lat, route.from.lng, 2.03);
      const to = latLngToVector3(route.to.lat, route.to.lng, 2.03);
      const curve = createArcCurve(from, to, 2.03);
      const points = curve.getPoints(64);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      return { geometry, curve, id: route.to.id };
    });
  }, []);

  const routeProgress = prefersReducedMotion ? 1 : Math.max(0, (progress - 0.3) * 2);

  return (
    <group>
      {/* Arc lines */}
      {arcs.map((arc, i) => {
        const arcProg = Math.max(0, Math.min(1, routeProgress - i * 0.1));
        if (arcProg <= 0) return null;

        const pointCount = Math.max(2, Math.floor(arcProg * 64));
        const partialPoints = arc.curve.getPoints(64).slice(0, pointCount);
        const partialGeo = new THREE.BufferGeometry().setFromPoints(partialPoints);

        return (
          <line_ key={arc.id} geometry={partialGeo}>
            <lineBasicMaterial color={CHAMPAGNE_GOLD} transparent opacity={0.55} />
          </line_>
        );
      })}

      {/* Travelling particles */}
      {!prefersReducedMotion && arcs.map((arc, i) => {
        const arcProg = Math.max(0, Math.min(1, routeProgress - i * 0.1));
        if (arcProg < 0.5) return null;
        return <TravellingParticle key={`p-${arc.id}`} curve={arc.curve} speed={0.12 + i * 0.015} />;
      })}
    </group>
  );
}

// ─── Travelling Particle ─────────────────────────────────────────────────────
function TravellingParticle({ curve, speed }: { curve: THREE.CubicBezierCurve3; speed: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const progressRef = useRef(Math.random());

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    progressRef.current = (progressRef.current + delta * speed) % 1;
    const point = curve.getPoint(progressRef.current);
    meshRef.current.position.copy(point);
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.025, 8, 8]} />
      <meshBasicMaterial color={CHAMPAGNE_GOLD} transparent opacity={0.9} />
    </mesh>
  );
}

// ─── Atmosphere Shell ────────────────────────────────────────────────────────
function Atmosphere() {
  return (
    <>
      {/* Inner atmosphere glow */}
      <mesh scale={1.025}>
        <sphereGeometry args={[2, 48, 48]} />
        <meshBasicMaterial color={CHAMPAGNE_GOLD} transparent opacity={0.035} side={THREE.BackSide} />
      </mesh>
      {/* Outer rim */}
      <mesh scale={1.06}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial color={SECONDARY_GREEN} transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>
    </>
  );
}

// ─── Scene Lighting ──────────────────────────────────────────────────────────
function GlobeLighting() {
  return (
    <>
      <ambientLight intensity={0.5} color={IVORY} />
      <directionalLight intensity={1.0} position={[4, 3, 5]} color={IVORY} />
      <directionalLight intensity={0.3} position={[-3, -1, 3]} color={SECONDARY_GREEN} />
      <pointLight intensity={0.6} position={[-4, 2, -3]} color={CHAMPAGNE_GOLD} />
      {/* Strong rim light from behind for atmospheric effect */}
      <pointLight intensity={0.5} position={[0, 0, -6]} color={CHAMPAGNE_GOLD} />
      <pointLight intensity={0.3} position={[0, -4, 2]} color={FOREST_GREEN_BRIGHT} />
    </>
  );
}

// ─── Ambient Particles ───────────────────────────────────────────────────────
function AmbientParticles({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const count = 60;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 3.5 + Math.random() * 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (pointsRef.current && !prefersReducedMotion) {
      pointsRef.current.rotation.y += delta * 0.015;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial color={CHAMPAGNE_GOLD} size={0.02} transparent opacity={0.35} sizeAttenuation />
    </points>
  );
}

// ─── Full Scene ──────────────────────────────────────────────────────────────
function GlobeScene({
  prefersReducedMotion,
  progress,
  cursor,
}: {
  prefersReducedMotion: boolean;
  progress: number;
  cursor: React.MutableRefObject<{ x: number; y: number }>;
}) {
  return (
    <>
      <GlobeLighting />
      <Atmosphere />
      <GlobeGroup prefersReducedMotion={prefersReducedMotion} progress={progress} cursor={cursor} />
      <AmbientParticles prefersReducedMotion={prefersReducedMotion} />
    </>
  );
}

// ─── Exported Component ──────────────────────────────────────────────────────
export interface Globe3DProps {
  prefersReducedMotion: boolean;
  progress: number;
  className?: string;
}

export default function Globe3D({ prefersReducedMotion, progress, className = '' }: Globe3DProps) {
  const cursor = useCursorPosition();

  return (
    <div className={`relative w-full h-full ${className}`}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.3, 5], fov: 42 }}
        style={{ background: 'transparent' }}
        frameloop={prefersReducedMotion ? 'demand' : 'always'}
      >
        <GlobeScene
          prefersReducedMotion={prefersReducedMotion}
          progress={progress}
          cursor={cursor}
        />
      </Canvas>
    </div>
  );
}
