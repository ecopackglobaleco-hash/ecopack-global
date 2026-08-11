'use client';

/**
 * HeroBottle3D - 3D paper water bottle for the hero section
 * Validates: Requirements 1.1, 1.2, 6.1
 *
 * Renders a procedural 3D paper water bottle using React Three Fiber.
 * Responds to:
 * - Scroll progress (rotation, provided via shared ref)
 * - Subtle continuous floating motion
 * - Mouse/pointer position for parallax depth
 *
 * Architecture:
 * - If real GLB exists → loads it (future)
 * - If no GLB + WebGL available → renders this procedural bottle
 * - If no WebGL → parent shows PNG fallback
 */

import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { scrollProgress } from '@/lib/scrollProgress';
import { HERO_BOTTLE_ASSET } from '@/lib/3d-assets';

// Design tokens
const IVORY = '#F3F0E7';
const CHAMPAGNE_GOLD = '#C8A96B';
const OBSIDIAN = '#080A09';
const KRAFT_COLOR = '#d4c4a8';
const CAP_COLOR = '#1C4A3B';

// ─── Bottle Profile ──────────────────────────────────────────────────────────
function createBottleProfile(): THREE.Vector2[] {
  return [
    new THREE.Vector2(0, -2.2),
    new THREE.Vector2(0.55, -2.2),
    new THREE.Vector2(0.6, -2.0),
    new THREE.Vector2(0.65, -1.5),
    new THREE.Vector2(0.68, -0.5),
    new THREE.Vector2(0.66, 0.5),
    new THREE.Vector2(0.6, 1.2),
    new THREE.Vector2(0.5, 1.6),
    new THREE.Vector2(0.42, 1.8),
    new THREE.Vector2(0.4, 2.0),
    new THREE.Vector2(0.4, 2.0),
  ];
}

// ─── Scene Lighting ──────────────────────────────────────────────────────────
function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.3} color={IVORY} />
      <directionalLight
        intensity={0.8}
        position={[3, 4, 5]}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />
      <pointLight intensity={0.4} color={CHAMPAGNE_GOLD} position={[-2, 3, -3]} />
      {/* Subtle rim light from behind */}
      <pointLight intensity={0.2} color={CHAMPAGNE_GOLD} position={[0, -1, -4]} />
    </>
  );
}

// ─── Mouse Parallax Tracker ──────────────────────────────────────────────────
function useMouseParallax() {
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return mouse;
}

// ─── Animated Bottle ─────────────────────────────────────────────────────────
interface AnimatedBottleProps {
  prefersReducedMotion: boolean;
}

function AnimatedBottle({ prefersReducedMotion }: AnimatedBottleProps) {
  const groupRef = useRef<THREE.Group>(null);
  const mouse = useMouseParallax();
  const timeRef = useRef(0);

  const bottleProfile = createBottleProfile();

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    timeRef.current += delta;

    if (prefersReducedMotion) {
      // Static pose — slight angle for visual interest
      groupRef.current.rotation.y = 0.3;
      return;
    }

    // Scroll-driven rotation (0→2π = full 360°)
    const scrollRotation = scrollProgress.current * Math.PI * 2;

    // Continuous slow idle rotation
    const idleRotation = timeRef.current * 0.15;

    // Combine scroll + idle rotation
    groupRef.current.rotation.y = scrollRotation + idleRotation;

    // Subtle floating motion (vertical bob)
    groupRef.current.position.y = -0.3 + Math.sin(timeRef.current * 0.8) * 0.05;

    // Subtle mouse parallax tilt
    const targetTiltX = mouse.current.y * 0.05;
    const targetTiltZ = -mouse.current.x * 0.03;
    groupRef.current.rotation.x += (targetTiltX - groupRef.current.rotation.x) * 0.02;
    groupRef.current.rotation.z += (targetTiltZ - groupRef.current.rotation.z) * 0.02;
  });

  return (
    <group ref={groupRef} position={[0, -0.3, 0]}>
      {/* Bottle body */}
      <mesh castShadow receiveShadow>
        <latheGeometry args={[bottleProfile, 48]} />
        <meshStandardMaterial
          color={KRAFT_COLOR}
          roughness={0.92}
          metalness={0.0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Label band */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.69, 0.69, 1.2, 48]} />
        <meshStandardMaterial
          color={IVORY}
          roughness={0.88}
          metalness={0.0}
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Secondary label accent (green stripe) */}
      <mesh position={[0, -0.8, 0]}>
        <cylinderGeometry args={[0.67, 0.68, 0.3, 48]} />
        <meshStandardMaterial
          color={CAP_COLOR}
          roughness={0.85}
          metalness={0.0}
          transparent
          opacity={0.25}
        />
      </mesh>

      {/* Cap */}
      <mesh position={[0, 2.15, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.42, 0.4, 32]} />
        <meshStandardMaterial color={CAP_COLOR} roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Cap top */}
      <mesh position={[0, 2.38, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 0.08, 32]} />
        <meshStandardMaterial color={CAP_COLOR} roughness={0.5} metalness={0.15} />
      </mesh>

      {/* Cap rim ring (champagne gold accent) */}
      <mesh position={[0, 1.95, 0]}>
        <torusGeometry args={[0.41, 0.015, 12, 48]} />
        <meshStandardMaterial color={CHAMPAGNE_GOLD} roughness={0.4} metalness={0.3} />
      </mesh>
    </group>
  );
}

// ─── Exported Component ──────────────────────────────────────────────────────
export interface HeroBottle3DProps {
  prefersReducedMotion: boolean;
  className?: string;
}

export default function HeroBottle3D({ prefersReducedMotion, className = '' }: HeroBottle3DProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 6], fov: 40 }}
        frameloop={prefersReducedMotion ? 'demand' : 'always'}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
      >
        <SceneLighting />
        <AnimatedBottle prefersReducedMotion={prefersReducedMotion} />
      </Canvas>
    </div>
  );
}
