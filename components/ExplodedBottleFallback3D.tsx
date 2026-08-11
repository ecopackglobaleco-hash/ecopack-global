'use client';

/**
 * ExplodedBottleFallback3D - Premium bright exploded bottle visualization
 *
 * Renders a clearly visible paper water bottle in exploded view using
 * Three.js primitives. Bright ivory/kraft materials with forest-green
 * and champagne-gold accents against the dark background.
 *
 * Responds to scrollProgress to animate layer separation.
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ExplodedViewLayer } from '@/types/viewer3d';

// Bright design tokens for visibility
const KRAFT_BRIGHT = '#e8dcc8';
const IVORY_BRIGHT = '#F3F0E7';
const CAP_COLOR = '#1C4A3B';
const CHAMPAGNE_GOLD = '#C8A96B';
const LINER_COLOR = '#d9ceb8';
const BASE_COLOR = '#c8b898';

interface ExplodedBottleFallback3DProps {
  scrollProgress: number;
  maxOffset: number;
  layers: ExplodedViewLayer[];
}

function AnimatedLayer({
  children,
  scrollProgress,
  maxOffset,
  layer,
}: {
  children: React.ReactNode;
  scrollProgress: number;
  maxOffset: number;
  layer: ExplodedViewLayer;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const yOffset = scrollProgress * maxOffset * layer.offsetDirection * layer.offsetWeight;
    groupRef.current.position.y = yOffset;
  });

  return <group ref={groupRef}>{children}</group>;
}

export default function ExplodedBottleFallback3D({
  scrollProgress,
  maxOffset,
  layers,
}: ExplodedBottleFallback3DProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  const capLayer = layers.find((l) => l.id === 'cap') || layers[0];
  const bodyLayer = layers.find((l) => l.id === 'body') || layers[1];
  const linerLayer = layers.find((l) => l.id === 'liner') || layers[2];
  const baseLayer = layers.find((l) => l.id === 'base') || layers[3];

  return (
    <group ref={groupRef} position={[0, -0.2, 0]} scale={0.7}>
      {/* CAP */}
      <AnimatedLayer scrollProgress={scrollProgress} maxOffset={maxOffset} layer={capLayer}>
        <group position={[0, 2.2, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.38, 0.45, 0.45, 32]} />
            <meshStandardMaterial color={CAP_COLOR} roughness={0.55} metalness={0.1} />
          </mesh>
          <mesh position={[0, 0.28, 0]}>
            <cylinderGeometry args={[0.32, 0.38, 0.1, 32]} />
            <meshStandardMaterial color={CHAMPAGNE_GOLD} roughness={0.4} metalness={0.25} />
          </mesh>
          {/* Gold ring accent */}
          <mesh position={[0, -0.02, 0]}>
            <torusGeometry args={[0.43, 0.015, 12, 32]} />
            <meshStandardMaterial color={CHAMPAGNE_GOLD} roughness={0.35} metalness={0.3} />
          </mesh>
        </group>
      </AnimatedLayer>

      {/* BODY (outer shell) */}
      <AnimatedLayer scrollProgress={scrollProgress} maxOffset={maxOffset} layer={bodyLayer}>
        <group position={[0, 0, 0]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.58, 0.65, 3.8, 48, 1, true]} />
            <meshStandardMaterial
              color={KRAFT_BRIGHT}
              roughness={0.85}
              metalness={0.0}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Label band (ivory) */}
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.59, 0.66, 1.4, 48, 1, true]} />
            <meshStandardMaterial
              color={IVORY_BRIGHT}
              roughness={0.8}
              metalness={0.0}
              transparent
              opacity={0.5}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Green accent stripe */}
          <mesh position={[0, -0.6, 0]}>
            <cylinderGeometry args={[0.585, 0.655, 0.4, 48, 1, true]} />
            <meshStandardMaterial
              color={CAP_COLOR}
              roughness={0.7}
              metalness={0.0}
              transparent
              opacity={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Gold accent ring at shoulder */}
          <mesh position={[0, 1.85, 0]}>
            <torusGeometry args={[0.58, 0.01, 8, 48]} />
            <meshStandardMaterial color={CHAMPAGNE_GOLD} roughness={0.4} metalness={0.2} />
          </mesh>
        </group>
      </AnimatedLayer>

      {/* LINER (inner layer) */}
      <AnimatedLayer scrollProgress={scrollProgress} maxOffset={maxOffset} layer={linerLayer}>
        <group position={[0, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.5, 0.57, 3.5, 48, 1, true]} />
            <meshStandardMaterial
              color={LINER_COLOR}
              roughness={0.7}
              metalness={0.02}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Inner coating visual */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.49, 0.56, 3.3, 48, 1, true]} />
            <meshStandardMaterial
              color={IVORY_BRIGHT}
              roughness={0.6}
              metalness={0.0}
              transparent
              opacity={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      </AnimatedLayer>

      {/* BASE */}
      <AnimatedLayer scrollProgress={scrollProgress} maxOffset={maxOffset} layer={baseLayer}>
        <group position={[0, -2.0, 0]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.63, 0.65, 0.2, 48]} />
            <meshStandardMaterial color={BASE_COLOR} roughness={0.8} metalness={0.02} />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.5, 0.55, 0.1, 48]} />
            <meshStandardMaterial color={KRAFT_BRIGHT} roughness={0.8} metalness={0.0} />
          </mesh>
          {/* Gold ring on base */}
          <mesh position={[0, 0.12, 0]}>
            <torusGeometry args={[0.62, 0.01, 8, 48]} />
            <meshStandardMaterial color={CHAMPAGNE_GOLD} roughness={0.4} metalness={0.2} />
          </mesh>
        </group>
      </AnimatedLayer>
    </group>
  );
}
