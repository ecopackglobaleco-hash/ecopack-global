/**
 * Model Optimization Configuration
 * Validates: Requirements 7.3 (No single compressed 3D asset exceeds 5MB transfer size)
 *
 * Provides configuration for loading optimized GLB models with Draco compression
 * and meshopt decompression. These settings are used by the Viewer3D component
 * when loading 3D assets via @react-three/drei's useGLTF.
 *
 * Draco decoder: Hardware-accelerated mesh decompression (reduces GLB size ~60-80%)
 * meshopt: Alternative compression with fast decoding (reduces GLB size ~40-60%)
 *
 * Assets should be pre-compressed before deployment using tools like:
 * - gltf-pipeline (Draco): `gltf-pipeline -i model.glb -o model-draco.glb --draco.compressionLevel 7`
 * - gltfpack (meshopt): `gltfpack -i model.glb -o model-opt.glb -cc -tc`
 */

/** Maximum allowed file size for a single 3D asset (5MB per Req 7.3) */
export const MAX_MODEL_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/** CDN path for Google Draco decoder (WASM-based, hardware-accelerated) */
export const DRACO_DECODER_PATH = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';

/** Configuration for Draco compression when processing GLB models */
export interface DracoConfig {
  /** Compression level (0-10, higher = smaller but slower to encode) */
  compressionLevel: number;
  /** Quantization bits for positions (affects visual quality) */
  quantizePositionBits: number;
  /** Quantization bits for normals */
  quantizeNormalBits: number;
  /** Quantization bits for texture coordinates */
  quantizeTexCoordBits: number;
}

/** Recommended Draco settings for web-optimized 3D models */
export const RECOMMENDED_DRACO_CONFIG: DracoConfig = {
  compressionLevel: 7,
  quantizePositionBits: 14,
  quantizeNormalBits: 10,
  quantizeTexCoordBits: 12,
};

/** Configuration for texture optimization within GLB models */
export interface TextureOptimizationConfig {
  /** Maximum texture dimension (width or height) */
  maxResolution: number;
  /** Target format for textures embedded in GLB */
  format: 'webp' | 'png' | 'jpeg';
  /** Quality setting (0-100) for lossy formats */
  quality: number;
}

/** Recommended texture settings to keep models under 5MB */
export const RECOMMENDED_TEXTURE_CONFIG: TextureOptimizationConfig = {
  maxResolution: 2048,
  format: 'webp',
  quality: 75,
};

/**
 * Validates that a model file size is within the allowed limit.
 * Can be used as a build-time check or runtime validation.
 */
export function validateModelSize(sizeBytes: number): {
  valid: boolean;
  sizeMB: number;
  maxMB: number;
} {
  const sizeMB = sizeBytes / (1024 * 1024);
  return {
    valid: sizeBytes <= MAX_MODEL_SIZE_BYTES,
    sizeMB: Math.round(sizeMB * 100) / 100,
    maxMB: MAX_MODEL_SIZE_BYTES / (1024 * 1024),
  };
}

/**
 * Returns the Draco decoder path to be used with useGLTF.preload()
 * or the DRACOLoader in Three.js.
 *
 * Usage with @react-three/drei:
 * ```ts
 * import { useGLTF } from '@react-three/drei';
 * import { DRACO_DECODER_PATH } from '@/lib/modelOptimization';
 *
 * useGLTF.preload('/models/bottle.glb', DRACO_DECODER_PATH);
 * ```
 */
export function getDracoDecoderPath(): string {
  return DRACO_DECODER_PATH;
}
