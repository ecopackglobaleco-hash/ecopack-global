/**
 * Unit tests for SEO utilities
 * Validates: Requirements 9.1, 9.2, 9.4, 9.6
 */

import {
  generateFallbackTitle,
  generateFallbackDescription,
  isValidTitle,
  isValidDescription,
  getOrganizationJsonLd,
  getProductJsonLd,
  getBreadcrumbJsonLd,
  createPageMetadata,
  HREFLANG_MARKETS,
  SITE_URL,
  TITLE_MIN_LENGTH,
  TITLE_MAX_LENGTH,
  DESCRIPTION_MIN_LENGTH,
  DESCRIPTION_MAX_LENGTH,
} from '@/lib/seo';

describe('SEO Utilities', () => {
  describe('generateFallbackTitle', () => {
    it('appends brand name when result fits within max length', () => {
      const h1 = 'Sustainable Packaging';
      const result = generateFallbackTitle(h1);
      expect(result).toBe('Sustainable Packaging | EcoPack Global');
      expect(result.length).toBeLessThanOrEqual(TITLE_MAX_LENGTH);
    });

    it('truncates H1 text when combined title exceeds max length', () => {
      const longH1 =
        'This is a very long heading that would exceed the sixty character limit';
      const result = generateFallbackTitle(longH1);
      expect(result.length).toBeLessThanOrEqual(TITLE_MAX_LENGTH);
      expect(result).toContain('| EcoPack Global');
    });

    it('generates title from actual homepage H1', () => {
      const h1 = 'Sustainable Packaging for a Better Tomorrow';
      const result = generateFallbackTitle(h1);
      // "Sustainable Packaging for a Better Tomorrow | EcoPack Global" = 60 chars
      expect(result.length).toBeLessThanOrEqual(TITLE_MAX_LENGTH);
    });
  });

  describe('generateFallbackDescription', () => {
    it('returns full text when within max length', () => {
      const body =
        'Premium paper-based bottles and compostable solutions designed for global brands committed to reducing plastic waste.';
      const result = generateFallbackDescription(body);
      expect(result).toBe(body);
      expect(result.length).toBeLessThanOrEqual(DESCRIPTION_MAX_LENGTH);
    });

    it('truncates at word boundary for long content', () => {
      const longBody =
        'This is a long description that goes well beyond the one hundred and sixty character limit that is specified in the requirements for meta descriptions. We need to verify it gets truncated at a word boundary.';
      const result = generateFallbackDescription(longBody);
      expect(result.length).toBeLessThanOrEqual(DESCRIPTION_MAX_LENGTH);
      expect(result.length).toBeGreaterThanOrEqual(DESCRIPTION_MIN_LENGTH);
      // Should not contain trailing space (truncated at word boundary)
      expect(result).not.toMatch(/\s$/);
    });

    it('collapses whitespace in content', () => {
      const body = 'Premium   packaging\n\nsolutions   for   B2B   buyers.';
      const result = generateFallbackDescription(body);
      expect(result).toBe(
        'Premium packaging solutions for B2B buyers.'
      );
    });
  });

  describe('isValidTitle', () => {
    it('accepts title within bounds', () => {
      const title = 'EcoPack Global — Premium Sustainable Packaging';
      expect(isValidTitle(title)).toBe(true);
    });

    it('rejects title shorter than minimum', () => {
      expect(isValidTitle('Too Short')).toBe(false);
    });

    it('rejects title longer than maximum', () => {
      const longTitle = 'A'.repeat(TITLE_MAX_LENGTH + 1);
      expect(isValidTitle(longTitle)).toBe(false);
    });
  });

  describe('isValidDescription', () => {
    it('accepts description within bounds', () => {
      const desc =
        'Premium sustainable packaging for global B2B buyers. Paper water bottles, compostable solutions, and custom branding for your business.';
      expect(isValidDescription(desc)).toBe(true);
    });

    it('rejects description shorter than minimum', () => {
      expect(isValidDescription('Too short description.')).toBe(false);
    });

    it('rejects description longer than maximum', () => {
      const longDesc = 'A'.repeat(DESCRIPTION_MAX_LENGTH + 1);
      expect(isValidDescription(longDesc)).toBe(false);
    });
  });

  describe('JSON-LD Structured Data', () => {
    describe('getOrganizationJsonLd', () => {
      it('returns valid Organization schema', () => {
        const org = getOrganizationJsonLd();
        expect(org['@context']).toBe('https://schema.org');
        expect(org['@type']).toBe('Organization');
        expect(org.name).toBe('EcoPack Global');
        expect(org.url).toBe(SITE_URL);
        expect(org.contactPoint).toBeDefined();
        expect(org.contactPoint.email).toBe('ecopackglobaleco@gmail.com');
      });

      it('includes target market areas', () => {
        const org = getOrganizationJsonLd();
        expect(org.areaServed).toHaveLength(5);
        const countryNames = org.areaServed.map(
          (area: { name: string }) => area.name
        );
        expect(countryNames).toContain('United States');
        expect(countryNames).toContain('United Kingdom');
        expect(countryNames).toContain('Canada');
        expect(countryNames).toContain('India');
        expect(countryNames).toContain('United Arab Emirates');
      });
    });

    describe('getProductJsonLd', () => {
      it('returns valid Product schema', () => {
        const product = getProductJsonLd();
        expect(product['@context']).toBe('https://schema.org');
        expect(product['@type']).toBe('Product');
        expect(product.name).toBe('EcoPack Paper Water Bottle');
        expect(product.brand).toEqual({
          '@type': 'Brand',
          name: 'EcoPack Global',
        });
        expect(product.category).toBe('Sustainable Packaging');
      });
    });

    describe('getBreadcrumbJsonLd', () => {
      it('returns valid BreadcrumbList schema', () => {
        const breadcrumb = getBreadcrumbJsonLd([
          { name: 'Home', url: SITE_URL },
        ]);
        expect(breadcrumb['@context']).toBe('https://schema.org');
        expect(breadcrumb['@type']).toBe('BreadcrumbList');
        expect(breadcrumb.itemListElement).toHaveLength(1);
        expect(breadcrumb.itemListElement[0].position).toBe(1);
        expect(breadcrumb.itemListElement[0].name).toBe('Home');
      });

      it('generates correct positions for multiple items', () => {
        const breadcrumb = getBreadcrumbJsonLd([
          { name: 'Home', url: SITE_URL },
          { name: 'Products', url: `${SITE_URL}/products` },
        ]);
        expect(breadcrumb.itemListElement[0].position).toBe(1);
        expect(breadcrumb.itemListElement[1].position).toBe(2);
      });
    });
  });

  describe('hreflang configuration', () => {
    it('includes all required markets', () => {
      const langs = HREFLANG_MARKETS.map((m) => m.lang);
      expect(langs).toContain('en-US');
      expect(langs).toContain('en-GB');
      expect(langs).toContain('en-CA');
      expect(langs).toContain('en-IN');
      expect(langs).toContain('en-AE');
      expect(langs).toContain('x-default');
    });

    it('has 6 market entries total', () => {
      expect(HREFLANG_MARKETS).toHaveLength(6);
    });

    it('all markets have valid href URLs', () => {
      for (const market of HREFLANG_MARKETS) {
        expect(market.href).toMatch(/^https:\/\//);
      }
    });
  });

  describe('createPageMetadata', () => {
    it('uses provided title and description when given', () => {
      const meta = createPageMetadata({
        title: 'Custom Page Title for SEO Testing',
        description:
          'This is a custom description that is long enough to meet the minimum character requirement for validation.',
      });
      expect(meta.title).toBe('Custom Page Title for SEO Testing');
      expect(meta.description).toBe(
        'This is a custom description that is long enough to meet the minimum character requirement for validation.'
      );
    });

    it('falls back to H1-based title when title not provided', () => {
      const meta = createPageMetadata({
        h1Text: 'Sustainable Packaging',
      });
      expect(meta.title).toBe('Sustainable Packaging | EcoPack Global');
    });

    it('falls back to body-based description when description not provided', () => {
      const bodyContent =
        'Premium paper-based bottles and compostable solutions designed for global brands committed to reducing plastic waste.';
      const meta = createPageMetadata({ bodyContent });
      expect(meta.description).toBe(bodyContent);
    });

    it('includes alternates with hreflang languages', () => {
      const meta = createPageMetadata({
        title: 'EcoPack Global — Sustainable Packaging',
        description:
          'Premium sustainable packaging for B2B buyers worldwide with paper bottles and compostable solutions.',
        path: '/',
      });
      expect(meta.alternates).toBeDefined();
      expect(meta.alternates?.languages).toBeDefined();
      const languages = meta.alternates?.languages as Record<string, string>;
      expect(languages['en-US']).toBeDefined();
      expect(languages['x-default']).toBeDefined();
    });
  });
});
