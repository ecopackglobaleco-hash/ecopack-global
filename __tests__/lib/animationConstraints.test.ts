/**
 * Tests for Animation Constraints utility
 * Validates: Requirements 2.5
 */

import {
  MAX_SIMULTANEOUS_ELEMENTS,
  validateSectionAnimations,
  getActiveAnimations,
  createAnimationElement,
  type AnimationElement,
} from '@/lib/animationConstraints';

describe('animationConstraints', () => {
  const makeElement = (
    id: string,
    isCritical = false
  ): AnimationElement =>
    createAnimationElement({
      id,
      selector: `[data-anim-${id}]`,
      contentType: 'text',
      isCritical,
      contentDescription: `Reveals ${id} content`,
    });

  describe('MAX_SIMULTANEOUS_ELEMENTS', () => {
    it('is set to 3', () => {
      expect(MAX_SIMULTANEOUS_ELEMENTS).toBe(3);
    });
  });

  describe('createAnimationElement', () => {
    it('creates an element with isContentReveal always true', () => {
      const el = createAnimationElement({
        id: 'test',
        selector: '.test',
        contentType: 'image',
        isCritical: false,
        contentDescription: 'Reveals test image',
      });
      expect(el.isContentReveal).toBe(true);
    });

    it('preserves all other fields', () => {
      const el = createAnimationElement({
        id: 'hero-model',
        selector: '[data-viewer]',
        contentType: '3d-model',
        isCritical: true,
        contentDescription: 'Reveals 3D bottle',
      });
      expect(el.id).toBe('hero-model');
      expect(el.selector).toBe('[data-viewer]');
      expect(el.contentType).toBe('3d-model');
      expect(el.isCritical).toBe(true);
      expect(el.contentDescription).toBe('Reveals 3D bottle');
    });
  });

  describe('validateSectionAnimations', () => {
    it('validates a section with 3 or fewer elements as valid', () => {
      const elements = [makeElement('a'), makeElement('b'), makeElement('c')];
      const result = validateSectionAnimations(elements);
      expect(result.isValid).toBe(true);
      expect(result.validElements).toHaveLength(3);
      expect(result.trimmedElements).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it('trims elements exceeding max 3 simultaneous', () => {
      const elements = [
        makeElement('a'),
        makeElement('b'),
        makeElement('c'),
        makeElement('d'),
        makeElement('e'),
      ];
      const result = validateSectionAnimations(elements);
      expect(result.validElements).toHaveLength(3);
      expect(result.trimmedElements).toHaveLength(2);
    });

    it('prioritizes critical elements when trimming', () => {
      const elements = [
        makeElement('non-critical-1', false),
        makeElement('critical-1', true),
        makeElement('non-critical-2', false),
        makeElement('critical-2', true),
      ];
      const result = validateSectionAnimations(elements);
      // Critical elements should be in validElements
      const validIds = result.validElements.map((e) => e.id);
      expect(validIds).toContain('critical-1');
      expect(validIds).toContain('critical-2');
    });

    it('rejects elements without content description', () => {
      const el: AnimationElement = {
        id: 'bad',
        selector: '.bad',
        contentType: 'text',
        isContentReveal: true,
        isCritical: false,
        contentDescription: '',
      };
      const result = validateSectionAnimations([el]);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('content description');
    });

    it('validates an empty section as valid', () => {
      const result = validateSectionAnimations([]);
      expect(result.isValid).toBe(true);
      expect(result.validElements).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('getActiveAnimations', () => {
    it('returns all elements (up to max) when not degraded', () => {
      const elements = [makeElement('a'), makeElement('b'), makeElement('c')];
      const active = getActiveAnimations(elements, false);
      expect(active).toHaveLength(3);
    });

    it('caps at MAX_SIMULTANEOUS_ELEMENTS when not degraded', () => {
      const elements = [
        makeElement('a'),
        makeElement('b'),
        makeElement('c'),
        makeElement('d'),
      ];
      const active = getActiveAnimations(elements, false);
      expect(active).toHaveLength(3);
    });

    it('returns only critical elements when degraded', () => {
      const elements = [
        makeElement('non-critical', false),
        makeElement('critical-1', true),
        makeElement('critical-2', true),
      ];
      const active = getActiveAnimations(elements, true);
      expect(active).toHaveLength(2);
      expect(active.every((el) => el.isCritical)).toBe(true);
    });

    it('returns empty array when degraded with no critical elements', () => {
      const elements = [
        makeElement('a', false),
        makeElement('b', false),
      ];
      const active = getActiveAnimations(elements, true);
      expect(active).toHaveLength(0);
    });

    it('still caps critical elements at max 3 when degraded', () => {
      const elements = [
        makeElement('c1', true),
        makeElement('c2', true),
        makeElement('c3', true),
        makeElement('c4', true),
      ];
      const active = getActiveAnimations(elements, true);
      expect(active).toHaveLength(3);
    });
  });
});
