import Image from 'next/image';
import type { ProductCardProps } from '@/types/product';

/**
 * ProductCard - Reusable product card for the Product Portfolio section
 * Validates: Requirements 3.4, 8.4
 *
 * Displays a product image, title, and description with premium glass-morphism
 * styling. Fully keyboard accessible with visible focus indicators.
 * Implemented as a server component (no JS-dependent interactivity).
 */
export default function ProductCard({
  title,
  description,
  imageSrc,
  imageAlt,
}: ProductCardProps) {
  return (
    <article
      className="group relative glass-card p-0 overflow-hidden transition-shadow duration-300 hover:shadow-glass-lg focus-within:shadow-glass-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-gold"
      tabIndex={0}
      aria-label={`Product: ${title}`}
    >
      {/* Product image */}
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Subtle gradient overlay on image */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-obsidian/60 via-transparent to-transparent pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* Content area */}
      <div className="relative z-10 p-5">
        <h3 className="font-sora text-h4 text-ivory mb-2">{title}</h3>
        <p className="font-inter text-sm text-ivory/75 leading-relaxed">
          {description}
        </p>
      </div>
    </article>
  );
}
