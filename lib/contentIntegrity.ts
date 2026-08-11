/**
 * Content Integrity Utilities
 * Validates: Requirements 14.1, 14.2, 14.3, 14.4
 *
 * Provides utilities for content integrity enforcement:
 * - Placeholder formatting for unavailable content
 * - Content integrity constants and types
 *
 * PLACEHOLDER FORMAT: "[PLACEHOLDER: <content category>]"
 * - Used when specific factual information is not yet available
 * - Must be visually distinguishable from surrounding content
 * - Must NOT appear in production builds (enforced by build-time check)
 */

/**
 * Valid placeholder content categories per Requirement 14.1.
 * These represent types of content that require documentary evidence.
 */
export type PlaceholderCategory =
  | 'certification'
  | 'manufacturing-claim'
  | 'customer-name'
  | 'logo'
  | 'production-capacity'
  | 'office-location'
  | 'warehouse-location'
  | 'award'
  | 'partnership'
  | 'testimonial'
  | 'sales-figure'
  | 'environmental-statistic';

/**
 * Formats a placeholder string following the required format.
 *
 * @param category - The content category that needs verified data
 * @returns Formatted placeholder string: "[PLACEHOLDER: <category>]"
 *
 * @example
 * placeholder('certification') // "[PLACEHOLDER: certification]"
 * placeholder('production-capacity') // "[PLACEHOLDER: production-capacity]"
 */
export function placeholder(category: PlaceholderCategory): string {
  return `[PLACEHOLDER: ${category}]`;
}

/**
 * Checks if a given string contains any placeholder text.
 *
 * @param text - The text to check
 * @returns true if the text contains "[PLACEHOLDER:" pattern
 */
export function containsPlaceholder(text: string): boolean {
  return /\[PLACEHOLDER:\s*[^\]]+\]/.test(text);
}

/**
 * Maximum allowed percentage of visible area that may use Champagne Gold.
 * Per Requirement 14.4, this accent color must not exceed 10% of any page.
 */
export const CHAMPAGNE_GOLD_MAX_AREA_PERCENT = 10;

/**
 * Champagne Gold hex value — reference constant for validation.
 */
export const CHAMPAGNE_GOLD_HEX = '#C8A96B';
