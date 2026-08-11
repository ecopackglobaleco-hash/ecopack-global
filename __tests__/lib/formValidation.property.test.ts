import * as fc from 'fast-check';
import { enquiryFormSchema } from '@/components/EnquiryForm';

/**
 * Property-Based Tests for Form Validation
 * Validates: Requirements 4.4, 4.5, 4.6
 */

// Helper: determines if a string is a valid email per schema rules
function isValidEmail(val: string): boolean {
  if (val.length === 0) return false;
  if (val.length > 254) return false;
  const atIndex = val.indexOf('@');
  if (atIndex === -1) return false;
  // Exactly one "@"
  if (val.indexOf('@', atIndex + 1) !== -1) return false;
  // Non-empty local part
  const localPart = val.slice(0, atIndex);
  if (localPart.length === 0) return false;
  // Domain must have at least one dot, not at start/end
  const domain = val.slice(atIndex + 1);
  if (domain.length === 0) return false;
  const dotIndex = domain.indexOf('.');
  if (dotIndex === -1 || dotIndex === 0 || dotIndex === domain.length - 1) return false;
  return true;
}

// Helper: determines if a string is a valid WhatsApp number per schema rules
function isValidWhatsApp(val: string): boolean {
  if (!val || val.length === 0) return true; // empty is accepted
  const pattern = /^\+?[\d\s\-]+$/;
  if (!pattern.test(val)) return false;
  const digitCount = val.replace(/\D/g, '').length;
  return digitCount >= 7 && digitCount <= 20;
}

// Helper: creates a valid form data object for use in tests
function validFormData(overrides: Record<string, unknown> = {}) {
  return {
    name: 'John Doe',
    company: 'Acme Corp',
    email: 'john@acme.com',
    country: 'United States',
    productInterest: 'Paper Cups',
    ...overrides,
  };
}

describe('Form Validation Property Tests', () => {
  /**
   * Property 1: Email validation correctness
   * **Validates: Requirements 4.4, 4.5**
   *
   * For any string, email validator accepts iff exactly one "@" followed by
   * domain with at least one dot, non-empty local part, total ≤254 chars.
   */
  describe('Property 1: Email validation correctness', () => {
    it('accepts a string iff it satisfies the email validation rules', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 300 }),
          (input: string) => {
            const result = enquiryFormSchema.safeParse(validFormData({ email: input }));
            const expected = isValidEmail(input);

            if (expected) {
              expect(result.success).toBe(true);
            } else {
              expect(result.success).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('always accepts well-formed emails (valid generators)', () => {
      // Generate emails that definitely satisfy the rules
      const validEmailArb = fc
        .tuple(
          fc.stringMatching(/^[a-zA-Z0-9._%+-]+$/, { maxLength: 64 }).filter(s => s.length >= 1),
          fc.stringMatching(/^[a-zA-Z0-9-]+$/, { maxLength: 30 }).filter(s => s.length >= 1),
          fc.stringMatching(/^[a-zA-Z]{2,10}$/)
        )
        .map(([local, domainName, tld]) => `${local}@${domainName}.${tld}`)
        .filter((email) => email.length <= 254);

      fc.assert(
        fc.property(validEmailArb, (email: string) => {
          const result = enquiryFormSchema.safeParse(validFormData({ email }));
          expect(result.success).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('always rejects emails with no "@" symbol', () => {
      const noAtArb = fc
        .stringMatching(/^[^@]+$/, { maxLength: 254 }).filter(s => s.length >= 1);

      fc.assert(
        fc.property(noAtArb, (input: string) => {
          const result = enquiryFormSchema.safeParse(validFormData({ email: input }));
          expect(result.success).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('always rejects emails exceeding 254 characters', () => {
      const longEmailArb = fc
        .string({ minLength: 255, maxLength: 400 });

      fc.assert(
        fc.property(longEmailArb, (input: string) => {
          const result = enquiryFormSchema.safeParse(validFormData({ email: input }));
          expect(result.success).toBe(false);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 2: WhatsApp validation correctness
   * **Validates: Requirements 4.5, 4.6**
   *
   * For any non-empty string, accepts iff only digits/spaces/hyphens/leading "+",
   * digit count 7-20. Empty/undefined accepted.
   */
  describe('Property 2: WhatsApp validation correctness', () => {
    it('accepts a non-empty string iff it matches whatsapp rules', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          (input: string) => {
            const result = enquiryFormSchema.safeParse(validFormData({ whatsapp: input }));
            const expected = isValidWhatsApp(input);

            if (expected) {
              expect(result.success).toBe(true);
            } else {
              expect(result.success).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('always accepts empty string', () => {
      const result = enquiryFormSchema.safeParse(validFormData({ whatsapp: '' }));
      expect(result.success).toBe(true);
    });

    it('always accepts undefined', () => {
      const result = enquiryFormSchema.safeParse(validFormData({ whatsapp: undefined }));
      expect(result.success).toBe(true);
    });

    it('always accepts valid whatsapp numbers', () => {
      // Generate valid whatsapp numbers: optional leading +, then digits/spaces/hyphens with 7-20 digits
      const validWhatsappArb = fc
        .tuple(
          fc.boolean(), // whether to include leading +
          fc.array(
            fc.oneof(
              fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'),
              fc.constantFrom(' ', '-')
            ),
            { minLength: 7, maxLength: 30 }
          )
        )
        .map(([hasPlus, chars]) => {
          const str = (hasPlus ? '+' : '') + chars.join('');
          return str;
        })
        .filter((val) => {
          const digitCount = val.replace(/\D/g, '').length;
          return digitCount >= 7 && digitCount <= 20;
        });

      fc.assert(
        fc.property(validWhatsappArb, (whatsapp: string) => {
          const result = enquiryFormSchema.safeParse(validFormData({ whatsapp }));
          expect(result.success).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('always rejects strings with invalid characters', () => {
      // Generate strings that contain at least one character not in [digits, spaces, hyphens, +]
      const invalidCharArb = fc
        .tuple(
          fc.string({ minLength: 0, maxLength: 5 }),
          fc.stringMatching(/[a-zA-Z!@#$%^&*()={}[\]|\\:;"'<>,?/~`]/, { maxLength: 1 }).filter(s => s.length >= 1),
          fc.string({ minLength: 0, maxLength: 5 })
        )
        .map(([prefix, invalidChar, suffix]) => prefix + invalidChar + suffix)
        .filter((val) => val.length > 0);

      fc.assert(
        fc.property(invalidCharArb, (input: string) => {
          const result = enquiryFormSchema.safeParse(validFormData({ whatsapp: input }));
          // If it contains invalid chars, should fail (unless the string by chance passes the pattern)
          const expected = isValidWhatsApp(input);
          if (expected) {
            expect(result.success).toBe(true);
          } else {
            expect(result.success).toBe(false);
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 3: Form validation completeness
   * **Validates: Requirements 4.4, 4.5, 4.6**
   *
   * For any form data with at least one required field empty/invalid,
   * validation fails with errors for each invalid field.
   */
  describe('Property 3: Form validation completeness', () => {
    const requiredFields = ['name', 'company', 'email', 'country', 'productInterest'] as const;

    it('validation fails when at least one required field is empty', () => {
      // Generate a subset of required fields to make empty (at least one)
      const emptyFieldsArb = fc
        .subarray([...requiredFields], { minLength: 1, maxLength: requiredFields.length });

      fc.assert(
        fc.property(emptyFieldsArb, (fieldsToEmpty: string[]) => {
          const overrides: Record<string, string> = {};
          for (const field of fieldsToEmpty) {
            overrides[field] = '';
          }
          const data = validFormData(overrides);
          const result = enquiryFormSchema.safeParse(data);

          expect(result.success).toBe(false);
          if (!result.success) {
            // Each emptied field should have an error
            const errorPaths = result.error.issues.map((issue) => issue.path[0]);
            for (const field of fieldsToEmpty) {
              expect(errorPaths).toContain(field);
            }
          }
        }),
        { numRuns: 100 }
      );
    });

    it('validation fails with invalid email and reports error on email field', () => {
      // Generate invalid emails (no @, multiple @, empty local, etc.)
      const invalidEmailArb = fc.oneof(
        fc.constant(''),                              // empty
        fc.stringMatching(/^[^@]+$/, { maxLength: 50 }).filter(s => s.length >= 1),  // no @
        fc.tuple(                                    // multiple @
          fc.stringMatching(/^[a-z]+$/, { maxLength: 10 }).filter(s => s.length >= 1),
          fc.stringMatching(/^[a-z]+$/, { maxLength: 10 }).filter(s => s.length >= 1),
          fc.stringMatching(/^[a-z]+$/, { maxLength: 10 }).filter(s => s.length >= 1)
        ).map(([a, b, c]) => `${a}@${b}@${c}`),
        fc.constant('@domain.com'),                  // empty local
        fc.constant('user@domain'),                  // no dot in domain
        fc.constant('user@.domain.com'),             // dot at start of domain
        fc.constant('user@domain.'),                 // dot at end of domain
      );

      fc.assert(
        fc.property(invalidEmailArb, (email: string) => {
          const data = validFormData({ email });
          const result = enquiryFormSchema.safeParse(data);

          expect(result.success).toBe(false);
          if (!result.success) {
            const errorPaths = result.error.issues.map((issue) => issue.path[0]);
            expect(errorPaths).toContain('email');
          }
        }),
        { numRuns: 100 }
      );
    });

    it('validation reports errors for all invalid required fields simultaneously', () => {
      // Generate form data where multiple required fields are invalid
      const multiInvalidArb = fc
        .tuple(
          fc.subarray([...requiredFields], { minLength: 2, maxLength: requiredFields.length }),
          fc.boolean()  // whether to use empty string or omit other invalid patterns
        );

      fc.assert(
        fc.property(multiInvalidArb, ([fieldsToInvalidate, _useEmpty]) => {
          const overrides: Record<string, string> = {};
          for (const field of fieldsToInvalidate) {
            if (field === 'email') {
              overrides[field] = 'not-an-email'; // invalid email
            } else {
              overrides[field] = ''; // empty required field
            }
          }
          const data = validFormData(overrides);
          const result = enquiryFormSchema.safeParse(data);

          expect(result.success).toBe(false);
          if (!result.success) {
            const errorPaths = result.error.issues.map((issue) => issue.path[0]);
            for (const field of fieldsToInvalidate) {
              expect(errorPaths).toContain(field);
            }
          }
        }),
        { numRuns: 100 }
      );
    });
  });
});
