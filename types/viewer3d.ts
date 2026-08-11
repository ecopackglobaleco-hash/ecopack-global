/**
 * Types for the 3D Product Visualization System
 * Validates: Requirements 1, 6
 */

/** Interaction settings for the 3D viewer */
export interface Viewer3DInteractionSettings {
  /** Enable horizontal rotation (360 degrees) */
  enableRotation: boolean;
  /** Enable zoom interaction (50%-150% range) */
  enableZoom: boolean;
  /** Minimum zoom level as a percentage of default view */
  minZoom: number;
  /** Maximum zoom level as a percentage of default view */
  maxZoom: number;
  /** Enable auto-rotation when idle */
  autoRotate: boolean;
  /** Auto-rotation speed in degrees per second */
  autoRotateSpeed: number;
}

/** Loading state for the 3D viewer */
export type Viewer3DLoadingState = 'idle' | 'loading' | 'loaded' | 'error';

/** Props for the Viewer3D component */
export interface Viewer3DProps {
  /** URL to the GLB/GLTF 3D model asset */
  modelUrl: string;
  /** URL to the high-resolution fallback image (min 1024x1024) */
  fallbackImageUrl: string;
  /** Alt text for the fallback image (5-150 characters) */
  fallbackImageAlt: string;
  /** Interaction settings for mouse/touch controls */
  interactionSettings: Viewer3DInteractionSettings;
  /** Maximum time in ms to wait for model load before showing fallback */
  loadTimeout: number;
  /** Whether to lazy load the model (trigger at 200px from viewport) */
  lazyLoad: boolean;
  /** Current loading state of the viewer */
  loadingState?: Viewer3DLoadingState;
  /** Callback when loading state changes */
  onLoadingStateChange?: (state: Viewer3DLoadingState) => void;
  /** Additional CSS class name */
  className?: string;
  /** ARIA label for the 3D viewer container */
  ariaLabel?: string;
}

/** Layer configuration for the exploded view */
export interface ExplodedViewLayer {
  /** Unique identifier for the layer */
  id: string;
  /** Display name of the layer (e.g., "Cap", "Body", "Liner", "Base") */
  name: string;
  /** Vertical offset direction multiplier (-1 for up, 1 for down) */
  offsetDirection: number;
  /** Base offset distance (multiplied by scroll progress and maxOffset) */
  offsetWeight: number;
}

/** Props for the ExplodedView3D component */
export interface ExplodedView3DProps {
  /** Scroll progress value from 0 (assembled) to 1 (fully exploded) */
  scrollProgress: number;
  /** Maximum offset distance in scene units for layer separation */
  maxOffset: number;
  /** Configuration for each explodable layer */
  layers: ExplodedViewLayer[];
  /** URL to the GLB model containing named layer meshes */
  modelUrl: string;
  /** URL to static fallback image for non-WebGL or mobile */
  fallbackImageUrl: string;
  /** Alt text for the fallback image */
  fallbackImageAlt: string;
  /** Whether to show layer labels during explosion */
  showLabels: boolean;
  /** Additional CSS class name */
  className?: string;
}
