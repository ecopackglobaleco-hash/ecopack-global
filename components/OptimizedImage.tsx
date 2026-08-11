/**
 * OptimizedImage - Responsive image component with WebP/AVIF and srcset support
 * Validates: Requirements 7.4, 7.5, 7.6
 *
 * Wraps Next.js Image component with best-practice configuration for:
 * - Automatic AVIF/WebP format negotiation (via next.config.ts image formats)
 * - Responsive srcset with device-appropriate sizes
 * - Priority loading for above-fold (LCP) images
 * - Lazy loading with blur placeholder for below-fold images
 * - Proper alt text for accessibility (Req 8.4)
 */

import Image, { type ImageProps } from 'next/image';

export interface OptimizedImageProps extends Omit<ImageProps, 'placeholder'> {
  /** Mark as priority for above-fold / LCP images (disables lazy loading) */
  priority?: boolean;
  /** Responsive sizes attribute for srcset selection */
  sizes?: string;
  /** Optional blur data URL for placeholder while loading */
  blurDataURL?: string;
  /** Whether to show blur placeholder (requires blurDataURL or static import) */
  showPlaceholder?: boolean;
}

/**
 * Default responsive sizes for common layout patterns.
 * These map to the deviceSizes configured in next.config.ts.
 */
const DEFAULT_SIZES = '(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw';

export default function OptimizedImage({
  priority = false,
  sizes = DEFAULT_SIZES,
  blurDataURL,
  showPlaceholder = false,
  alt,
  ...props
}: OptimizedImageProps) {
  return (
    <Image
      {...props}
      alt={alt}
      sizes={sizes}
      priority={priority}
      loading={priority ? 'eager' : 'lazy'}
      quality={80}
      placeholder={showPlaceholder && blurDataURL ? 'blur' : 'empty'}
      blurDataURL={showPlaceholder ? blurDataURL : undefined}
    />
  );
}
