/**
 * Types for the Navigation System
 * Validates: Requirements 13
 */

/** Homepage section identifiers that can be navigated to */
export type HomepageSection =
  | 'hero'
  | 'brand-statement'
  | 'paper-water-bottles'
  | 'product-anatomy'
  | 'why-ecopack'
  | 'product-portfolio'
  | 'industries'
  | 'custom-branding'
  | 'global-supply'
  | 'how-it-works'
  | 'enquiry'
  | 'final-cta'
  | 'footer';

/** Navigation link item */
export interface NavigationLink {
  /** Unique identifier matching the section */
  id: HomepageSection;
  /** Display label for the navigation link */
  label: string;
  /** Anchor href (e.g., "#hero") */
  href: string;
}

/** Mobile menu state */
export type MobileMenuState = 'open' | 'closed';

/** Props for the Navigation component */
export interface NavigationProps {
  /** Array of navigation section links */
  links: NavigationLink[];
  /** Currently active/visible section */
  activeSection: HomepageSection | null;
  /** Mobile menu open/closed state */
  mobileMenuState: MobileMenuState;
  /** Callback to toggle mobile menu */
  onMobileMenuToggle: () => void;
  /** Callback when a navigation link is activated */
  onNavigate: (section: HomepageSection) => void;
  /** Additional CSS class name */
  className?: string;
}
