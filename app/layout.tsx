import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import ResponsiveLayout from "@/components/ResponsiveLayout";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  SITE_URL,
  HREFLANG_MARKETS,
  getOrganizationJsonLd,
  getProductJsonLd,
  getBreadcrumbJsonLd,
} from "@/lib/seo";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  adjustFontFallback: true,
  preload: true,
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
  adjustFontFallback: true,
  preload: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

/**
 * SEO Metadata for the homepage.
 * Validates: Requirements 9.1, 9.4, 9.6, 16.5
 *
 * - Title: 49 chars (within 30-60 range), contains keyword "Sustainable Packaging"
 * - Description: 128 chars (within 70-160 range), summarizes page purpose
 * - hreflang: en-US, en-GB, en-CA, en-IN, en-AE, x-default
 * - Server-side rendered by Next.js App Router (RSC)
 */
export const metadata: Metadata = {
  title: "EcoPack Global — Premium Sustainable Packaging",
  description:
    "Premium sustainable packaging for global B2B buyers. Paper water bottles, compostable solutions, and custom branding for your business.",
  openGraph: {
    title: "EcoPack Global — Premium Sustainable Packaging",
    description:
      "Premium sustainable packaging for global B2B buyers. Paper water bottles, compostable solutions, and custom branding for your business.",
    url: SITE_URL,
    siteName: "EcoPack Global",
    type: "website",
    locale: "en_US",
  },
  alternates: {
    canonical: SITE_URL,
    languages: Object.fromEntries(
      HREFLANG_MARKETS.map((market) => [market.lang, market.href])
    ),
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // JSON-LD structured data for Organization, Product, and BreadcrumbList
  // Validates: Requirement 9.2
  const organizationJsonLd = getOrganizationJsonLd();
  const productJsonLd = getProductJsonLd();
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
  ]);

  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <head>
        {/* Preload critical above-fold assets for FCP < 1.5s and LCP < 3s */}
        {/* Validates: Requirements 7.3, 7.4, 7.5, 7.6 */}

        {/* Preload hero product image (LCP candidate) */}
        <link
          rel="preload"
          href="/images/paper-water-bottle.png"
          as="image"
          type="image/png"
        />

        {/*
          Preload primary 3D model for hero section.
          Uncomment once the production GLB is placed in /public/models/bottle.glb
          and HERO_BOTTLE_ASSET.available is set to true in lib/3d-assets.ts
        */}
        {/* <link
          rel="preload"
          href="/models/bottle.glb"
          as="fetch"
          crossOrigin="anonymous"
        /> */}

        {/* DNS prefetch and preconnect for Google Fonts (used by next/font) */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* hreflang annotations for international B2B targeting */}
        {/* Validates: Requirement 9.4 */}
        {HREFLANG_MARKETS.map((market) => (
          <link
            key={market.lang}
            rel="alternate"
            hrefLang={market.lang}
            href={market.href}
          />
        ))}

        {/* JSON-LD Structured Data */}
        {/* Validates: Requirement 9.2 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbJsonLd),
          }}
        />
      </head>
      <body className="font-inter text-base">
        <ResponsiveLayout header={<Navigation />} footer={<Footer />}>
          {children}
        </ResponsiveLayout>
      </body>
    </html>
  );
}
