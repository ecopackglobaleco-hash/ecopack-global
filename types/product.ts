/**
 * Product Card Types
 * Used by the ProductCard component and Product Portfolio section.
 */

export interface ProductCardProps {
  /** Product display title */
  title: string;
  /** Short product description */
  description: string;
  /** Path to the product image */
  imageSrc: string;
  /** Alt text for the product image (5-150 characters) */
  imageAlt: string;
}
