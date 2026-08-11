/**
 * Animation Constraints - Enforce performance and content-reveal rules
 * Validates: Requirements 2.5
 *
 * Enforces:
 * - Maximum 3 animated elements transitioning simultaneously per section
 * - All animations must reveal content (text, images, 3D models), not purely decorative
 */

/** Maximum number of animated elements allowed to transition simultaneously per section */
export const MAX_SIMULTANEOUS_ELEMENTS = 3;

/** Types of content that animations are permitted to reveal */
export type ContentType = 'text' | 'image' | '3d-model' | 'video' | 'interactive';

/** Configuration for a validated animation element */
export interface AnimationElement {
  /** Unique identifier for the animation element */
  id: string;
  /** CSS selector or element reference */
  selector: string;
  /** Type of content this animation reveals */
  contentType: ContentType;
  /** Whether this animation reveals meaningful content (must be true) */
  isContentReveal: true;
  /** Whether this is a critical animation (preserved during degradation) */
  isCritical: boolean;
  /** Description of what content is being revealed */
  contentDescription: string;
}

/** Result of validating a section's animation configuration */
export interface AnimationConstraintResult {
  /** Whether the configuration is valid */
  isValid: boolean;
  /** Error messages if invalid */
  errors: string[];
  /** Elements that passed validation */
  validElements: AnimationElement[];
  /** Elements that were trimmed due to exceeding the limit */
  trimmedElements: AnimationElement[];
}

/**
 * Validates and constrains a section's animation elements to ensure compliance
 * with performance requirements (max 3 simultaneous) and content-reveal rules.
 *
 * @param elements - Array of animation element configurations for a section
 * @returns Validation result with valid elements (capped at 3) and any errors
 */
export function validateSectionAnimations(
  elements: AnimationElement[]
): AnimationConstraintResult {
  const errors: string[] = [];

  // Validate each element has isContentReveal set to true
  for (const element of elements) {
    if (!element.isContentReveal) {
      errors.push(
        `Element "${element.id}" must reveal content (isContentReveal must be true). Purely decorative animations are not permitted.`
      );
    }

    if (!element.contentDescription || element.contentDescription.trim().length === 0) {
      errors.push(
        `Element "${element.id}" must have a content description explaining what it reveals.`
      );
    }
  }

  // Enforce max simultaneous elements (prioritize critical elements)
  const sortedElements = [...elements].sort((a, b) => {
    // Critical elements come first
    if (a.isCritical && !b.isCritical) return -1;
    if (!a.isCritical && b.isCritical) return 1;
    return 0;
  });

  const validElements = sortedElements.slice(0, MAX_SIMULTANEOUS_ELEMENTS);
  const trimmedElements = sortedElements.slice(MAX_SIMULTANEOUS_ELEMENTS);

  if (trimmedElements.length > 0) {
    errors.push(
      `Section exceeds maximum of ${MAX_SIMULTANEOUS_ELEMENTS} simultaneous animated elements. ` +
        `${trimmedElements.length} element(s) will not animate simultaneously.`
    );
  }

  return {
    isValid: errors.length === 0 || (errors.length === 1 && trimmedElements.length > 0),
    errors,
    validElements,
    trimmedElements,
  };
}

/**
 * Filters animation elements for degraded performance mode.
 * When performance is degraded, only critical content-revealing animations
 * should remain active. Non-critical parallax/decorative effects are disabled.
 *
 * @param elements - All animation elements for a section
 * @param isDegraded - Whether performance is currently degraded
 * @returns Elements that should be active given the current performance state
 */
export function getActiveAnimations(
  elements: AnimationElement[],
  isDegraded: boolean
): AnimationElement[] {
  if (!isDegraded) {
    // Normal mode: return up to MAX_SIMULTANEOUS_ELEMENTS
    return elements.slice(0, MAX_SIMULTANEOUS_ELEMENTS);
  }

  // Degraded mode: only critical content-revealing animations
  return elements
    .filter((el) => el.isCritical && el.isContentReveal)
    .slice(0, MAX_SIMULTANEOUS_ELEMENTS);
}

/**
 * Creates a validated animation element configuration.
 * Ensures the element is properly configured as content-revealing.
 *
 * @param config - Partial configuration for the animation element
 * @returns A fully validated AnimationElement
 */
export function createAnimationElement(
  config: Omit<AnimationElement, 'isContentReveal'> & { isContentReveal?: true }
): AnimationElement {
  return {
    ...config,
    isContentReveal: true,
  };
}
