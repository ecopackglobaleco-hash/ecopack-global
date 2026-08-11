'use client';

/**
 * PaperBottlePlaceholder3D - A procedural 3D paper water bottle placeholder
 *
 * Renders a stylized paper bottle shape using Three.js primitives when
 * the production GLB model is not yet available. This keeps the 3D
 * architecture intact and provides a premium visual placeholder.
 *
 * The shape is designed to evoke a cylindrical paper bottle with:
 * - A slightly tapered body (lathe geometry)
 * - Paper/matte material (high roughness, low metalness)
 * - A cap on top
 * - Soft natural coloring (kraft/cream tones)
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const IVORY_COLOR = '#F3F0E7';
const KRAFT_COLOR = '#d4c4a8';
const CAP_COLOR = '#1C4A3B';

/**
 * Creates a lathe profile for a paper water bottle silhouette.
 * Slightly tapered at top, wider in the middle, narrowed at base.
 */
function createBottleProfile(): THREE.Vector2[] {
  return [
    new THREE.Vector2(0, -2.2),     // Bottom center
    new THREE.Vector2(0.55, -2.2),  // Bottom edge
    new THREE.Vector2(0.6, -2.0),   // Bottom curve
    new THREE.Vector2(0.65, -1.5),  // Lower body
    new THREE.Vector2(0.68, -0.5),  // Mid body (widest)
    new THREE.Vector2(0.66, 0.5),   // Upper body
    new THREE.Vector2(0.6, 1.2),    // Shoulder
    new THREE.Vector2(0.5, 1.6),    // Neck taper
    new THREE.Vector2(0.42, 1.8),   // Neck
    new THREE.Vector2(0.4, 2.0),    // Top of body
    new THREE.Vector2(0.4, 2.0),    // Top edge
  ];
}

interface PaperBottlePlaceholder3DProps {
  /** Enable gentle idle rotation */
  autoRotate?: boolean;
}

export default function PaperBottlePlaceholder3D({ autoRotate = true }: PaperBottlePlaceholder3DProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Gentle idle rotation for visual polish
  useFrame((_, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  const bottleProfile = createBottleProfile();

  return (
    <group ref={groupRef} position={[0, -0.3, 0]}>
      {/* Bottle body - lathe geometry for paper bottle silhouette */}
      <mesh castShadow receiveShadow>
        <latheGeometry args={[bottleProfile, 32]} />
        <meshStandardMaterial
          color={KRAFT_COLOR}
          roughness={0.92}
          metalness={0.0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Subtle label band (slightly lighter area in the middle) */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.69, 0.69, 1.2, 32]} />
        <meshStandardMaterial
          color={IVORY_COLOR}
          roughness={0.88}
          metalness={0.0}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Cap */}
      <mesh position={[0, 2.15, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.42, 0.4, 32]} />
        <meshStandardMaterial
          color={CAP_COLOR}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Cap top */}
      <mesh position={[0, 2.38, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 0.08, 32]} />
        <meshStandardMaterial
          color={CAP_COLOR}
          roughness={0.5}
          metalness={0.15}
        />
      </mesh>
    </group>
  );
}
