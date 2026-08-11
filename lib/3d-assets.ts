/**
 * 3D Asset Configuration
 *
 * Central source of truth for all 3D model paths and their availability.
 * The application MUST check `available` before attempting to load any GLB.
 *
 * When the production GLB asset is ready:
 * 1. Place the file in /public/models/
 * 2. Set `available: true` for that asset
 * 3. The component will automatically load the real model
 *
 * Components must NEVER call useGLTF for an unavailable asset.
 */

export interface Asset3DConfig {
  /** File path relative to /public */
  path: string;
  /** Whether the asset file actually exists and is ready to load */
  available: boolean;
  /** Static fallback image path */
  fallbackImage: string;
  /** Alt text for the fallback / 3D view */
  alt: string;
}

/**
 * Hero section paper water bottle model
 */
export const HERO_BOTTLE_ASSET: Asset3DConfig = {
  path: '/models/bottle.glb',
  available: false, // Set to true when the production GLB is placed in /public/models/
  fallbackImage: '/images/bottle-fallback.svg',
  alt: 'EcoPack Global paper water bottle — premium sustainable packaging',
};

/**
 * Product Anatomy exploded view model
 */
export const EXPLODED_BOTTLE_ASSET: Asset3DConfig = {
  path: '/models/bottle-exploded.glb',
  available: false, // Set to true when the production GLB is placed in /public/models/
  fallbackImage: '/images/bottle-exploded-fallback.svg',
  alt: 'Exploded view of EcoPack paper water bottle showing cap, body, liner, and base layers',
};
