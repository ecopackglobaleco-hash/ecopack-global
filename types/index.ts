/**
 * EcoPack Global Website - Shared TypeScript Types
 *
 * Barrel export for all shared interfaces and types used across the application.
 */

// Navigation types
export type {
  HomepageSection,
  NavigationLink,
  MobileMenuState,
  NavigationProps,
} from './navigation';

// 3D Viewer types
export type {
  Viewer3DInteractionSettings,
  Viewer3DLoadingState,
  Viewer3DProps,
  ExplodedViewLayer,
  ExplodedView3DProps,
} from './viewer3d';

// Animation types
export type {
  EasingFunction,
  ScrollTriggerPosition,
  PinSpacing,
  AnimationProperties,
  ScrollAnimationConfig,
} from './animation';

// Form types
export type {
  ProductInterest,
  EnquiryFormData,
  EnquiryFormErrors,
  FormSubmissionStatus,
  EnquiryFormProps,
} from './form';

// Product types
export type { ProductCardProps } from './product';

// Map types
export type {
  TargetMarket,
  MarketCoordinates,
  MarketData,
  TooltipPosition,
  TooltipConfig,
  WorldMapProps,
} from './map';
