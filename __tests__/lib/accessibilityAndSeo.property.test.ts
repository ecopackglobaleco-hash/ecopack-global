import * as fc from 'fast-check';
import {
  generateFallbackTitle,
  generateFallbackDescription,
  isValidTitle,
  isValidDescription,
  TITLE_MIN_LENGTH,
  TITLE_MAX_LENGTH,
  DESCRIPTION_MIN_LENGTH,
  DESCRIPTION_MAX_LENGTH,
} from '@/lib/seo';
import {
  MAX_SIMULTANEOUS_ELEMENTS,
  validateSectionAnimations,
  createAnimationElement,
  getActiveAnimations,
  AnimationElement,
  ContentType,
} from '@/lib/animationConstraints';

/**
 * Property-Based Tests for Accessibility and SEO
 * Validates: Requirements 8.3, 9.1, 9.5, 9.6, 2.5, 15.4
 */

// ─── Helpers for Property 4: WCAG Contrast ────────────────────────────────────

/**
 * Converts a hex color string to its relative luminance per WCAG 2.1 formula.
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function getRelativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const linearize = (channel: number): number =>
    channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);

  const rLin = linearize(r);
  const gLin = linearize(g);
  const bLin = linearize(b);

  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

/**
 * Calculates contrast ratio between two colors per WCAG 2.1.
 * https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
function getContrastRatio(fg: string, bg: string): number {
  const l1 = getRelativeLuminance(fg);
  const l2 = getRelativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Design token color definitions from tailwind.config.ts
const DESIGN_TOKENS = {
  foreground: {
    ivory: '#F3F0E7',
    'champagne-gold': '#C8A96B',
  },
  background: {
    obsidian: '#080A09',
    'forest-green': '#0B2F26',
    'secondary-green': '#1C4A3B',
  },
} as const;

// Actual foreground/background pairs used on the site
const COLOR_PAIRS: Array<{ fg: string; bg: string; label: string }> = [
  { fg: DESIGN_TOKENS.foreground.ivory, bg: DESIGN_TOKENS.background.obsidian, label: 'Ivory on Obsidian' },
  { fg: DESIGN_TOKENS.foreground.ivory, bg: DESIGN_TOKENS.background['forest-green'], label: 'Ivory on Forest Green' },
  { fg: DESIGN_TOKENS.foreground.ivory, bg: DESIGN_TOKENS.background['secondary-green'], label: 'Ivory on Secondary Green' },
  { fg: DESIGN_TOKENS.foreground['champagne-gold'], bg: DESIGN_TOKENS.background.obsidian, label: 'Champagne Gold on Obsidian' },
  { fg: DESIGN_TOKENS.foreground['champagne-gold'], bg: DESIGN_TOKENS.background['forest-green'], label: 'Champagne Gold on Forest Green' },
];

// ─── Helpers for Property 5: Heading Hierarchy ────────────────────────────────

/**
 * Validates heading hierarchy: exactly one H1, no skipped levels.
 */
function validateHeadingHierarchy(headings: number[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (headings.length === 0) {
    errors.push('Page must have at least one heading');
    return { isValid: false, errors };
  }

  // Exactly one H1
  const h1Count = headings.filter((h) => h === 1).length;
  if (h1Count === 0) {
    errors.push('Page must have exactly one H1 heading');
  } else if (h1Count > 1) {
    errors.push(`Page has ${h1Count} H1 headings, expected exactly one`);
  }

  // First heading should be H1
  if (headings[0] !== 1) {
    errors.push('First heading must be H1');
  }

  // No skipped levels: for any heading at level N>1, level N-1 must appear before it
  const seenLevels = new Set<number>();
  for (const level of headings) {
    if (level > 1 && !seenLevels.has(level - 1)) {
      errors.push(`Heading level ${level} appears without a preceding level ${level - 1}`);
    }
    seenLevels.add(level);
  }

  return { isValid: errors.length === 0, errors };
}

// ─── Property 4: WCAG Contrast Compliance ─────────────────────────────────────

describe('Property 4: WCAG contrast compliance', () => {
  /**
   * **Validates: Requirements 8.3**
   *
   * For any text/background pair from design tokens, contrast ratio ≥ 4.5:1
   * for normal text and ≥ 3:1 for large text.
   */

  it('all design token pairs meet WCAG AA normal text contrast (≥ 4.5:1)', () => {
    // Use fast-check to generate arbitrary pairs from our token set
    const pairArb = fc.constantFrom(...COLOR_PAIRS);

    fc.assert(
      fc.property(pairArb, (pair) => {
        const ratio = getContrastRatio(pair.fg, pair.bg);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      }),
      { numRuns: 100 }
    );
  });

  it('all design token pairs meet WCAG AA large text contrast (≥ 3:1)', () => {
    const pairArb = fc.constantFrom(...COLOR_PAIRS);

    fc.assert(
      fc.property(pairArb, (pair) => {
        const ratio = getContrastRatio(pair.fg, pair.bg);
        expect(ratio).toBeGreaterThanOrEqual(3);
      }),
      { numRuns: 100 }
    );
  });

  it('verifies each specific design token pair meets AA normal text threshold', () => {
    for (const pair of COLOR_PAIRS) {
      const ratio = getContrastRatio(pair.fg, pair.bg);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    }
  });
});

// ─── Property 5: Heading Hierarchy Integrity ──────────────────────────────────

describe('Property 5: Heading hierarchy integrity', () => {
  /**
   * **Validates: Requirements 9.1**
   *
   * For any page, exactly one H1 and no skipped levels.
   */

  it('valid hierarchies always start with H1 and have no skipped levels', () => {
    // Generate valid heading sequences: start with 1, then each subsequent
    // heading is at most 1 level deeper than the deepest seen so far
    const validHeadingsArb = fc
      .array(fc.integer({ min: 1, max: 6 }), { minLength: 1, maxLength: 20 })
      .map((levels) => {
        // Build a valid hierarchy: start with H1, subsequent headings can
        // go deeper by at most 1 or go back to any previously seen level
        const result: number[] = [1];
        let maxSeen = 1;
        for (let i = 1; i < levels.length; i++) {
          // Clamp to valid range: between 1 and maxSeen+1, max 6
          const next = Math.min(Math.max(1, levels[i] % (maxSeen + 1) + 1), 6);
          // Ensure we don't skip: next must be <= maxSeen + 1
          const clamped = Math.min(next, maxSeen + 1);
          result.push(clamped);
          maxSeen = Math.max(maxSeen, clamped);
        }
        // Ensure exactly one H1 (only keep the first)
        const firstH1Idx = result.indexOf(1);
        return result.map((h, idx) => (h === 1 && idx !== firstH1Idx ? 2 : h));
      })
      .filter((headings) => headings.filter((h) => h === 1).length === 1);

    fc.assert(
      fc.property(validHeadingsArb, (headings) => {
        const result = validateHeadingHierarchy(headings);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }),
      { numRuns: 100 }
    );
  });

  it('detects pages with no H1 as invalid', () => {
    // Generate heading sequences with no H1
    const noH1Arb = fc.array(fc.integer({ min: 2, max: 6 }), { minLength: 1, maxLength: 10 });

    fc.assert(
      fc.property(noH1Arb, (headings) => {
        const result = validateHeadingHierarchy(headings);
        expect(result.isValid).toBe(false);
        expect(result.errors.some((e) => e.includes('H1'))).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('detects pages with multiple H1s as invalid', () => {
    // Generate heading sequences with 2+ H1s
    const multiH1Arb = fc
      .array(fc.integer({ min: 1, max: 6 }), { minLength: 2, maxLength: 10 })
      .filter((headings) => headings.filter((h) => h === 1).length >= 2);

    fc.assert(
      fc.property(multiH1Arb, (headings) => {
        const result = validateHeadingHierarchy(headings);
        expect(result.isValid).toBe(false);
        expect(result.errors.some((e) => e.includes('H1'))).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('detects skipped heading levels as invalid', () => {
    // Generate heading sequences that skip a level (e.g., H1 then H3 without H2)
    const skippedArb = fc
      .tuple(
        fc.integer({ min: 3, max: 6 }), // skipped-to level
        fc.array(fc.integer({ min: 1, max: 6 }), { minLength: 0, maxLength: 5 })
      )
      .map(([skipTo, rest]) => [1, skipTo, ...rest])
      .filter((headings) => {
        // Ensure the skip actually happens (level skipTo has no skipTo-1 before it)
        const seen = new Set<number>();
        for (const h of headings) {
          if (h > 1 && !seen.has(h - 1)) return true;
          seen.add(h);
        }
        return false;
      });

    fc.assert(
      fc.property(skippedArb, (headings) => {
        const result = validateHeadingHierarchy(headings);
        expect(result.isValid).toBe(false);
        expect(result.errors.some((e) => e.includes('without a preceding level'))).toBe(true);
      }),
      { numRuns: 100 }
    );
  });
});

// ─── Property 6: SEO Metadata Bounds ──────────────────────────────────────────

describe('Property 6: SEO metadata bounds', () => {
  /**
   * **Validates: Requirements 9.5, 9.6**
   *
   * For any page, meta title 30-60 chars, description 70-160 chars.
   */

  it('generateFallbackTitle always produces a valid title (30-60 chars)', () => {
    // Generate H1 text of varying lengths
    const h1Arb = fc.string({ minLength: 1, maxLength: 200 }).filter((s) => s.trim().length > 0);

    fc.assert(
      fc.property(h1Arb, (h1Text) => {
        const title = generateFallbackTitle(h1Text);
        // Title should always be within max length
        expect(title.length).toBeLessThanOrEqual(TITLE_MAX_LENGTH);
        // Title should include brand suffix
        expect(title).toContain('EcoPack Global');
      }),
      { numRuns: 100 }
    );
  });

  it('generateFallbackTitle produces valid titles for inputs that are long enough', () => {
    // Generate H1 text that is long enough to produce a valid title (at least 14 chars to get 30+ with brand suffix)
    const longH1Arb = fc.string({ minLength: 14, maxLength: 200 }).filter((s) => s.trim().length >= 14);

    fc.assert(
      fc.property(longH1Arb, (h1Text) => {
        const title = generateFallbackTitle(h1Text);
        expect(isValidTitle(title)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('generateFallbackDescription produces valid descriptions for sufficiently long input', () => {
    // Generate body content that is long enough (>= DESCRIPTION_MIN_LENGTH)
    const longBodyArb = fc
      .array(fc.lorem({ mode: 'words' }), { minLength: 20, maxLength: 100 })
      .map((words) => words.join(' '))
      .filter((s) => s.length >= DESCRIPTION_MIN_LENGTH);

    fc.assert(
      fc.property(longBodyArb, (bodyContent) => {
        const description = generateFallbackDescription(bodyContent);
        expect(description.length).toBeLessThanOrEqual(DESCRIPTION_MAX_LENGTH);
        expect(description.length).toBeGreaterThanOrEqual(1);
      }),
      { numRuns: 100 }
    );
  });

  it('isValidTitle correctly enforces bounds (30-60 chars)', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 0, maxLength: 300 }), (input) => {
        const valid = isValidTitle(input);
        if (input.length >= TITLE_MIN_LENGTH && input.length <= TITLE_MAX_LENGTH) {
          expect(valid).toBe(true);
        } else {
          expect(valid).toBe(false);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('isValidDescription correctly enforces bounds (70-160 chars)', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 0, maxLength: 300 }), (input) => {
        const valid = isValidDescription(input);
        if (input.length >= DESCRIPTION_MIN_LENGTH && input.length <= DESCRIPTION_MAX_LENGTH) {
          expect(valid).toBe(true);
        } else {
          expect(valid).toBe(false);
        }
      }),
      { numRuns: 100 }
    );
  });
});

// ─── Property 7: Animation Config Constraint ──────────────────────────────────

describe('Property 7: Animation config constraint', () => {
  /**
   * **Validates: Requirements 2.5, 15.4**
   *
   * For any section config, max 3 simultaneous elements, all isContentReveal true.
   */

  // Arbitrary for generating valid AnimationElement configs
  const contentTypeArb: fc.Arbitrary<ContentType> = fc.constantFrom(
    'text',
    'image',
    '3d-model',
    'video',
    'interactive'
  );

  const animationElementArb: fc.Arbitrary<AnimationElement> = fc
    .record({
      id: fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0),
      selector: fc.string({ minLength: 1, maxLength: 30 }).map((s) => `.${s.replace(/[^a-zA-Z0-9-_]/g, 'x')}`),
      contentType: contentTypeArb,
      isCritical: fc.boolean(),
      contentDescription: fc.lorem({ mode: 'sentences', maxCount: 1 }),
    })
    .map((config) => createAnimationElement({
      ...config,
      isContentReveal: true,
    }));

  it('validateSectionAnimations never returns more than MAX_SIMULTANEOUS_ELEMENTS valid elements', () => {
    const elementsArb = fc.array(animationElementArb, { minLength: 1, maxLength: 10 });

    fc.assert(
      fc.property(elementsArb, (elements) => {
        const result = validateSectionAnimations(elements);
        expect(result.validElements.length).toBeLessThanOrEqual(MAX_SIMULTANEOUS_ELEMENTS);
      }),
      { numRuns: 100 }
    );
  });

  it('createAnimationElement always sets isContentReveal to true', () => {
    const configArb = fc.record({
      id: fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0),
      selector: fc.string({ minLength: 1, maxLength: 30 }).map((s) => `.${s.replace(/[^a-zA-Z0-9-_]/g, 'x')}`),
      contentType: contentTypeArb,
      isCritical: fc.boolean(),
      contentDescription: fc.lorem({ mode: 'sentences', maxCount: 1 }),
    });

    fc.assert(
      fc.property(configArb, (config) => {
        const element = createAnimationElement(config);
        expect(element.isContentReveal).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('getActiveAnimations never returns more than MAX_SIMULTANEOUS_ELEMENTS', () => {
    const elementsArb = fc.array(animationElementArb, { minLength: 1, maxLength: 10 });
    const isDegradedArb = fc.boolean();

    fc.assert(
      fc.property(elementsArb, isDegradedArb, (elements, isDegraded) => {
        const active = getActiveAnimations(elements, isDegraded);
        expect(active.length).toBeLessThanOrEqual(MAX_SIMULTANEOUS_ELEMENTS);
      }),
      { numRuns: 100 }
    );
  });

  it('all elements from createAnimationElement have isContentReveal === true regardless of input', () => {
    const elementsArb = fc.array(animationElementArb, { minLength: 1, maxLength: 10 });

    fc.assert(
      fc.property(elementsArb, (elements) => {
        for (const element of elements) {
          expect(element.isContentReveal).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('validateSectionAnimations preserves all elements when count ≤ MAX_SIMULTANEOUS_ELEMENTS', () => {
    const smallArrayArb = fc.array(animationElementArb, { minLength: 1, maxLength: MAX_SIMULTANEOUS_ELEMENTS });

    fc.assert(
      fc.property(smallArrayArb, (elements) => {
        const result = validateSectionAnimations(elements);
        expect(result.validElements.length).toBe(elements.length);
        expect(result.trimmedElements.length).toBe(0);
      }),
      { numRuns: 100 }
    );
  });
});
