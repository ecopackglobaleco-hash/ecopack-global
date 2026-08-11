/**
 * Content Integrity utility tests
 * Validates: Requirements 14.1, 14.2, 14.3, 14.4
 */

import {
  placeholder,
  containsPlaceholder,
  CHAMPAGNE_GOLD_MAX_AREA_PERCENT,
  CHAMPAGNE_GOLD_HEX,
  PlaceholderCategory,
} from '@/lib/contentIntegrity';

describe('contentIntegrity', () => {
  describe('placeholder()', () => {
    it('formats category into correct placeholder string', () => {
      expect(placeholder('certification')).toBe('[PLACEHOLDER: certification]');
    });

    it('handles all valid categories', () => {
      const categories: PlaceholderCategory[] = [
        'certification',
        'manufacturing-claim',
        'customer-name',
        'logo',
        'production-capacity',
        'office-location',
        'warehouse-location',
        'award',
        'partnership',
        'testimonial',
        'sales-figure',
        'environmental-statistic',
      ];

      for (const category of categories) {
        const result = placeholder(category);
        expect(result).toBe(`[PLACEHOLDER: ${category}]`);
        expect(result).toMatch(/^\[PLACEHOLDER: .+\]$/);
      }
    });
  });

  describe('containsPlaceholder()', () => {
    it('returns true for text containing a placeholder', () => {
      expect(containsPlaceholder('Our [PLACEHOLDER: certification] is pending')).toBe(true);
    });

    it('returns true for standalone placeholder', () => {
      expect(containsPlaceholder('[PLACEHOLDER: sales-figure]')).toBe(true);
    });

    it('returns false for regular text', () => {
      expect(containsPlaceholder('No placeholders here')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(containsPlaceholder('')).toBe(false);
    });

    it('returns false for partial matches', () => {
      expect(containsPlaceholder('[PLACEHOLDER')).toBe(false);
      expect(containsPlaceholder('PLACEHOLDER: test]')).toBe(false);
    });
  });

  describe('constants', () => {
    it('defines Champagne Gold max area at 10%', () => {
      expect(CHAMPAGNE_GOLD_MAX_AREA_PERCENT).toBe(10);
    });

    it('defines correct Champagne Gold hex value', () => {
      expect(CHAMPAGNE_GOLD_HEX).toBe('#C8A96B');
    });
  });
});
