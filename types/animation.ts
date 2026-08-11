/**
 * Types for Scroll-Driven Animation System (GSAP + ScrollTrigger)
 * Validates: Requirements 2
 */

/** Easing function type for GSAP animations */
export type EasingFunction =
  | 'none'
  | 'power1.in'
  | 'power1.out'
  | 'power1.inOut'
  | 'power2.in'
  | 'power2.out'
  | 'power2.inOut'
  | 'power3.in'
  | 'power3.out'
  | 'power3.inOut'
  | 'power4.in'
  | 'power4.out'
  | 'power4.inOut'
  | 'back.in'
  | 'back.out'
  | 'back.inOut'
  | 'elastic.out'
  | 'bounce.out'
  | (string & {});

/** ScrollTrigger start/end position value */
export type ScrollTriggerPosition = string;

/** Pin spacing behavior */
export type PinSpacing = boolean | 'margin';

/** Animation properties that can be animated */
export interface AnimationProperties {
  /** Opacity value (0 to 1) */
  opacity?: number;
  /** X translation in pixels or percentage */
  x?: number | string;
  /** Y translation in pixels or percentage */
  y?: number | string;
  /** Scale factor */
  scale?: number;
  /** Rotation in degrees */
  rotation?: number;
  /** Transform origin */
  transformOrigin?: string;
  /** Additional GSAP-compatible CSS properties */
  [key: string]: unknown;
}

/** Configuration for GSAP ScrollTrigger animations */
export interface ScrollAnimationConfig {
  /** CSS selector or ref for the trigger element */
  trigger: string;
  /** Animation start position relative to trigger/viewport */
  start: ScrollTriggerPosition;
  /** Animation end position relative to trigger/viewport */
  end: ScrollTriggerPosition;
  /** Whether to pin the trigger element during animation */
  pin: boolean;
  /** Pin spacing behavior */
  pinSpacing: PinSpacing;
  /** Whether to link animation progress to scroll position */
  scrub: boolean | number;
  /** Easing function for the animation */
  ease: EasingFunction;
  /** Animation properties (from state) */
  from: AnimationProperties;
  /** Animation properties (to state) */
  to: AnimationProperties;
  /** Whether animation should replay on scroll back */
  toggleActions?: string;
  /** Reduced motion alternative: skip animation and show final state */
  reducedMotionFallback: 'showFinal' | 'showInitial' | 'none';
  /** Maximum number of animated elements (capped at 3 per section) */
  maxSimultaneousElements?: number;
  /** Callback when animation enters viewport */
  onEnter?: () => void;
  /** Callback when animation leaves viewport */
  onLeave?: () => void;
}
