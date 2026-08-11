/**
 * SEO utilities for EcoPack Global website
 * Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 16.5
 *
 * Provides:
 * - Fallback metadata generation from H1 and body content
 * - JSON-LD structured data builders (Organization, Product, BreadcrumbList)
 * - hreflang configuration for international targeting
 * - Metadata validation helpers
 */

import type { Metadata } from 'next';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Base URL for the EcoPack Global website */
export const SITE_URL = 'https://www.ecopackglobal.com';

/** Target markets with hreflang codes */
export const HREFLANG_MARKETS = [
  { lang: 'en-US', href: `${SITE_URL}` },
  { lang: 'en-GB', href: `${SITE_URL}` },
  { lang: 'en-CA', href: `${SITE_URL}` },
  { lang: 'en-IN', href: `${SITE_URL}` },
  { lang: 'en-AE', href: `${SITE_URL}` },
  { lang: 'x-default', href: `${SITE_URL}` },
] as const;

/** Meta title character limits */
export const TITLE_MIN_LENGTH = 30;
export const TITLE_MAX_LENGTH = 60;

/** Meta description character limits */
export const DESCRIPTION_MIN_LENGTH = 70;
export const DESCRIPTION_MAX_LENGTH = 160;

// ─── Fallback Metadata Generation ─────────────────────────────────────────────

/**
 * Generates a fallback meta title from H1 text.
 * Appends brand name if within character limit.
 * R9.6: Generate title from H1 if not manually set.
 */
export function generateFallbackTitle(h1Text: string): string {
  const brandSuffix = ' | EcoPack Global';
  const titleWithBrand = `${h1Text}${brandSuffix}`;

  if (titleWithBrand.length <= TITLE_MAX_LENGTH) {
    return titleWithBrand;
  }

  // Truncate H1 to fit within limits
  const maxH1Length = TITLE_MAX_LENGTH - brandSuffix.length;
  const truncated = h1Text.slice(0, maxH1Length).trim();
  return `${truncated}${brandSuffix}`;
}

/**
 * Generates a fallback meta description from body content.
 * R9.6: Generate description from first 160 chars of body if not manually set.
 */
export function generateFallbackDescription(bodyContent: string): string {
  const cleaned = bodyContent
    .replace(/\s+/g, ' ')
    .trim();

  if (cleaned.length <= DESCRIPTION_MAX_LENGTH) {
    return cleaned;
  }

  // Truncate at word boundary within limit
  const truncated = cleaned.slice(0, DESCRIPTION_MAX_LENGTH);
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > DESCRIPTION_MIN_LENGTH
    ? truncated.slice(0, lastSpace)
    : truncated;
}

/**
 * Validates that a meta title meets character length requirements.
 */
export function isValidTitle(title: string): boolean {
  return title.length >= TITLE_MIN_LENGTH && title.length <= TITLE_MAX_LENGTH;
}

/**
 * Validates that a meta description meets character length requirements.
 */
export function isValidDescription(description: string): boolean {
  return (
    description.length >= DESCRIPTION_MIN_LENGTH &&
    description.length <= DESCRIPTION_MAX_LENGTH
  );
}

// ─── JSON-LD Structured Data ──────────────────────────────────────────────────

/**
 * Organization schema for EcoPack Global.
 * R9.2: JSON-LD for Organization schema valid against schema.org.
 */
export function getOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'EcoPack Global',
    url: SITE_URL,
    logo: `${SITE_URL}/images/ecopack-logo.png`,
    description:
      'Premium sustainable packaging solutions for international B2B buyers.',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'ecopackglobaleco@gmail.com',
      contactType: 'sales',
      availableLanguage: 'English',
    },
    sameAs: ['https://www.instagram.com/ecopackglobal'],
    areaServed: [
      { '@type': 'Country', name: 'United States' },
      { '@type': 'Country', name: 'United Kingdom' },
      { '@type': 'Country', name: 'Canada' },
      { '@type': 'Country', name: 'India' },
      { '@type': 'Country', name: 'United Arab Emirates' },
    ],
  };
}

/**
 * Product schema for the flagship paper water bottle.
 * R9.2: JSON-LD for Product schema valid against schema.org.
 */
export function getProductJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'EcoPack Paper Water Bottle',
    description:
      'Premium paper-based water bottle designed as a sustainable alternative to plastic. Compostable and customizable for B2B brands.',
    brand: {
      '@type': 'Brand',
      name: 'EcoPack Global',
    },
    category: 'Sustainable Packaging',
    material: 'Paper-based compostable material',
    image: `${SITE_URL}/images/bottle-fallback.webp`,
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'USD',
      priceSpecification: {
        '@type': 'PriceSpecification',
        priceCurrency: 'USD',
        eligibleQuantity: {
          '@type': 'QuantitativeValue',
          minValue: 1,
          unitCode: 'C62',
        },
      },
    },
    manufacturer: {
      '@type': 'Organization',
      name: 'EcoPack Global',
      url: SITE_URL,
    },
  };
}

/**
 * BreadcrumbList schema for the homepage.
 * R9.2: JSON-LD for BreadcrumbList schema valid against schema.org.
 */
export function getBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ─── Page Metadata Helper ─────────────────────────────────────────────────────

/**
 * Creates page metadata with proper defaults and validation.
 * Falls back to generated values if title/description not provided.
 */
export function createPageMetadata(options: {
  title?: string;
  description?: string;
  h1Text?: string;
  bodyContent?: string;
  path?: string;
}): Metadata {
  const {
    title,
    description,
    h1Text = '',
    bodyContent = '',
    path = '/',
  } = options;

  const resolvedTitle =
    title || (h1Text ? generateFallbackTitle(h1Text) : 'EcoPack Global');
  const resolvedDescription =
    description ||
    (bodyContent
      ? generateFallbackDescription(bodyContent)
      : 'Premium sustainable packaging solutions.');

  const pageUrl = `${SITE_URL}${path}`;

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription,
      url: pageUrl,
      siteName: 'EcoPack Global',
      type: 'website',
    },
    alternates: {
      canonical: pageUrl,
      languages: Object.fromEntries(
        HREFLANG_MARKETS.map((market) => [
          market.lang,
          `${market.href}${path}`,
        ])
      ),
    },
  };
}
