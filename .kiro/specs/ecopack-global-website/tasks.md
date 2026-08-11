# Implementation Plan: EcoPack Global Website

## Overview

Build a premium B2B sustainable packaging website for EcoPack Global using Next.js App Router with TypeScript, React Three Fiber for 3D visualization, GSAP/ScrollTrigger for scroll-driven animations, and Tailwind CSS for styling. The site is a cinematic single-page application with 13 sections, culminating in a B2B enquiry form for lead generation.

## Tasks

- [x] 1. Project Foundation and Design System
  - [x] 1.1 Initialize Next.js project with TypeScript strict mode, Tailwind CSS, and App Router structure
    - Create Next.js app with `create-next-app` using App Router
    - Configure `tsconfig.json` with strict type-checking enabled
    - Install and configure Tailwind CSS with custom theme
    - Set up directory structure: `app/`, `components/`, `lib/`, `public/`, `types/`
    - _Requirements: 16.1, 16.2_

  - [x] 1.2 Configure design tokens and global styles
    - Define CSS custom properties for color palette: Forest Green (#0B2F26), Obsidian (#080A09), Ivory (#F3F0E7), Champagne Gold (#C8A96B), Secondary Green (#1C4A3B)
    - Configure Tailwind `theme.extend` with design tokens
    - Set up typographic scale (ratio 1.333 from 16px base): h1=50px, h2=38px, h3=28px, h4=21px
    - Define breakpoints: mobile (max 767px), tablet (768-1023px), desktop (1024px+)
    - Create glass-morphism utilities (translucent containers, background blur, gradient overlays ≤20% opacity, texture overlays ≤10% opacity)
    - _Requirements: 15.1, 15.2, 15.3, 15.4_

  - [x] 1.3 Set up font loading with next/font for Sora and Inter
    - Configure `next/font/google` for Sora (headings) and Inter (body/UI)
    - Set `font-display: swap` with system sans-serif fallback
    - Apply `adjustFontFallback` to prevent CLS
    - Map Sora to h1-h4 and Inter to body/label/UI text in global CSS
    - _Requirements: 1.3, 15.2, 15.5_

  - [x] 1.4 Create shared TypeScript interfaces and types
    - Define `Viewer3DProps`, `ExplodedView3DProps`, `ScrollAnimationConfig` interfaces
    - Define `EnquiryFormData`, `NavigationProps`, `WorldMapProps` interfaces
    - Create shared type exports in `types/` directory
    - _Requirements: 16.1_

- [x] 2. Navigation and Responsive Layout
  - [x] 2.1 Implement desktop Navigation component with anchor links and scroll spy
    - Create Navigation component with anchor links to all 9 homepage sections (Hero, Paper Water Bottles, Why EcoPack Global, Product Portfolio, Industries, Custom Branding, Global Supply, How It Works, B2B Enquiry)
    - Implement fixed positioning at top of viewport for desktop/tablet
    - Add IntersectionObserver-based scroll spy to highlight active section
    - Implement smooth scroll on anchor link activation
    - Ensure full keyboard operability with WCAG AA focus indicators (min 2px outline, 3:1 contrast)
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

  - [x] 2.2 Implement mobile hamburger menu with focus trap
    - Transform Navigation into collapsible hamburger menu below 768px
    - Implement focus trap within open menu until dismissed
    - Ensure all links remain accessible via keyboard
    - Add ARIA attributes for menu state (aria-expanded, aria-controls)
    - _Requirements: 5.4, 13.6_

  - [x] 2.3 Implement responsive layout container and skip-navigation link
    - Create responsive layout wrapper with min body font 16px, min touch target 44x44px, min spacing 8px
    - Add skip-navigation link as first focusable element linking to main content
    - Use semantic HTML structure (header, nav, main, section, footer)
    - Handle viewport resize/orientation change reflow without reload
    - _Requirements: 5.5, 5.6, 8.1, 8.2, 8.8_

  - [x] 2.4 Write unit tests for Navigation component
    - Test anchor link rendering and smooth scroll behavior
    - Test mobile menu toggle and focus trap logic
    - Test active section highlighting
    - Test keyboard navigation and ARIA attributes
    - _Requirements: 13.1, 13.5, 13.6_

- [x] 3. Hero Section and 3D Bottle Architecture
  - [x] 3.1 Install and configure React Three Fiber, Drei, and Three.js
    - Install `@react-three/fiber`, `@react-three/drei`, `three`
    - Configure dynamic import with `next/dynamic` and `ssr: false` for 3D components
    - Set up Canvas with performance settings: dpr [1,2], frameloop 'demand'
    - _Requirements: 16.3_

  - [x] 3.2 Implement Hero section layout with headline typography and 3D viewer placeholder
    - Create full-viewport (100vw × 100vh) Hero section with dark cinematic background (Obsidian)
    - Place primary heading (Sora) on the left side
    - Reserve right side for 3D bottle viewer
    - Apply color palette: Forest Green, Obsidian background, Ivory text, Champagne Gold accents only
    - _Requirements: 1.1, 1.3, 1.4_

  - [x] 3.3 Implement Viewer3D component with GLB loading, fallback, and loading indicator
    - Create Viewer3D client component using React Three Fiber Canvas
    - Set up scene: fov 45, ambient light (0.3, ivory), directional (0.8, shadows), rim light (0.4, champagne gold)
    - Apply MeshStandardMaterial with roughness 0.85, metalness 0.02
    - Implement GLB model loading with `useGLTF` from Drei
    - Add loading indicator matching site design language
    - Implement 10-second timeout → static fallback image (min 1024×1024)
    - Implement WebGL detection → immediate static fallback if unsupported
    - Add lazy loading triggered at 200px from viewport via IntersectionObserver
    - Ensure model interactive within 4 seconds on standard broadband
    - _Requirements: 1.1, 1.5, 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 3.4 Implement 3D model interaction (rotate 360° and zoom 50%-150%)
    - Enable OrbitControls for horizontal 360° rotation via mouse drag
    - Enable zoom between 50% and 150% via scroll/pinch
    - Maintain minimum 30fps during interactions
    - _Requirements: 6.6, 6.7_

  - [x] 3.5 Write unit tests for Viewer3D fallback and loading states
    - Test WebGL unsupported scenario shows static fallback
    - Test 10-second timeout shows fallback image
    - Test loading indicator displays while model loads
    - _Requirements: 1.5, 6.3, 6.4_

- [x] 4. Hero Scroll Animation
  - [x] 4.1 Install and configure GSAP with ScrollTrigger plugin
    - Install `gsap` and register ScrollTrigger plugin
    - Configure GSAP for Next.js client-side usage with dynamic imports
    - _Requirements: 16.4_

  - [x] 4.2 Implement hero scroll-driven bottle animation (rotate, translate, scale)
    - Create ScrollTrigger pinned to Hero section scroll range
    - Animate bottle 360° rotation around vertical axis linked to scroll progress
    - Animate bottle translateX from right side to horizontal center
    - Animate camera scale increase (close-in effect) proportional to scroll
    - _Requirements: 1.2_

  - [x] 4.3 Implement reduced-motion support for scroll animations
    - Detect `prefers-reduced-motion: reduce` media query
    - Kill all ScrollTriggers and display final visual state as static content
    - Disable auto-rotation on 3D viewer
    - _Requirements: 2.4, 8.6_

  - [x] 4.4 Implement performance degradation handler (FPS monitoring)
    - Monitor frame rate during scroll animations
    - If FPS < 20 for 2+ consecutive seconds: disable non-critical parallax effects
    - If FPS > 30 for 5+ seconds: re-enable effects
    - Limit max 3 animated elements transitioning simultaneously per section
    - Ensure all animations reveal content (text, images, 3D) not purely decorative
    - _Requirements: 2.3, 2.5, 2.6_

- [x] 5. Brand Statement and Product Sections
  - [x] 5.1 Implement Brand Statement section
    - Create section displaying tagline "PACKAGING SHOULD MOVE FORWARD"
    - Apply scroll-triggered fade/reveal animation
    - Ensure section is navigable landmark with proper semantic markup
    - _Requirements: 3.2_

  - [x] 5.2 Implement Paper Water Bottles section with product showcase
    - Create section highlighting the flagship paper water bottle product
    - Include scroll-triggered animations for content reveal
    - Ensure proper heading hierarchy (H2 for section title)
    - _Requirements: 3.1_

  - [x] 5.3 Implement ProductCard component
    - Create reusable Product_Card component for portfolio items
    - Include image, title, description with premium glass-morphism styling
    - Ensure keyboard accessible with focus indicators
    - Add alt text for product images (5-150 characters)
    - _Requirements: 3.4, 8.4_

- [x] 6. 3D Product Anatomy Section
  - [x] 6.1 Implement ExplodedView3D component with scroll-driven layer separation
    - Create ExplodedView3D client component
    - Define layers: cap, body, liner, base with configurable maxOffset
    - Link layer separation to scrollProgress (0 = assembled, 1 = fully exploded)
    - Implement static fallback image for mobile and error states
    - _Requirements: 2.2_

  - [x] 6.2 Wire Product Anatomy section with scroll trigger
    - Create Product Anatomy section with ScrollTrigger controlling exploded view progress
    - Map user scroll position within section to 0-1 progress value
    - Add section landmark and heading hierarchy
    - _Requirements: 2.1, 2.2, 3.1_

- [x] 7. Checkpoint - Core sections and 3D
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Why EcoPack and Product Portfolio
  - [x] 8.1 Implement Why EcoPack Global section with four visual blocks
    - Create section with four blocks: Sustainability, Premium Design, Custom Branding, Global B2B
    - Apply glass-morphism card styling with scroll-triggered reveals
    - Ensure proper heading hierarchy and semantic structure
    - _Requirements: 3.3_

  - [x] 8.2 Implement Product Portfolio section with six ProductCards
    - Render six products: Paper Cups, Tissues, Compostable Food Packaging, Shopping Bags, Garbage Bags, Biomedical Waste Bags
    - Use ProductCard components in a grid layout
    - All six visible without horizontal scroll on desktop viewports
    - Responsive: two-column on tablet, single-column stacked on mobile
    - _Requirements: 3.4, 5.1, 5.2, 5.3_

- [x] 9. Industries and Custom Branding Sections
  - [x] 9.1 Implement Industries section with seven target industries
    - Present: Hotels, Restaurants, Corporate, Events, Retail, Healthcare, Travel
    - Use visual cards/icons for each industry
    - Apply scroll-triggered reveal animations
    - _Requirements: 3.5_

  - [x] 9.2 Implement Custom Branding section with headline, description, and CTA
    - Display headline "YOUR BRAND. YOUR PACKAGING."
    - Include descriptive text about customization types (logo placement, brand colors)
    - Add visual element (image/mockup) of branded packaging
    - CTA button navigates to Enquiry Form section
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 10. Global Supply and How It Works
  - [x] 10.1 Implement Global Supply world map visualization
    - Create WorldMap component with target markets highlighted: USA, UAE/Dubai, India, UK/London, Canada
    - Distinguish highlighted regions from non-target areas
    - Implement hover tooltip (pointer) / tap label (touch) showing market name
    - Ensure labels don't obscure other highlighted markets
    - Render map fully visible from 320px to 1920px without overlap/truncation
    - Lazy load map; render within 3 seconds of section visibility
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 10.2 Implement How It Works section with four-step process
    - Display numbered sequential steps: 1. Tell Us, 2. Develop, 3. Confirm, 4. Deliver
    - Apply scroll-triggered step-by-step reveal animation
    - Use proper semantic structure (ordered list or equivalent)
    - _Requirements: 3.6_

- [x] 11. B2B Enquiry Form and WhatsApp Integration
  - [x] 11.1 Implement Enquiry Form with React Hook Form and Zod validation
    - Install `react-hook-form` and `zod` with `@hookform/resolvers`
    - Create EnquiryForm client component with all fields: Name, Company, Email, Country (dropdown), WhatsApp, Product Interest (dropdown), Quantity, Customization, Message
    - Mark required fields: Name, Company, Email, Country, Product Interest
    - Apply Zod schema validation from design (email regex, whatsapp digits/format, character limits)
    - Display inline validation errors adjacent to invalid fields
    - Implement keyboard tab order matching visual top-to-bottom sequence
    - Associate visible labels with inputs programmatically (htmlFor/id)
    - Stack fields vertically on mobile with full-width inputs
    - _Requirements: 4.1, 4.2, 4.4, 4.5, 4.6, 4.8, 5.7_

  - [x] 11.2 Implement form submission handler with success/error states
    - Create API route (`app/api/enquiry/route.ts`) for form submission
    - Display acknowledgment message on successful submission
    - Display error message on network/server failure preserving user data for retry
    - Disable submit button during submission to prevent double-submit
    - _Requirements: 4.3, 4.7_

  - [x] 11.3 Write property tests for form validation (Properties 1, 2, 3)
    - **Property 1: Email validation correctness** — For any string, email validator accepts iff exactly one "@" followed by domain with at least one dot, non-empty local part, total ≤254 chars
    - **Property 2: WhatsApp validation correctness** — For any non-empty string, accepts iff only digits/spaces/hyphens/leading "+", digit count 7-20. Empty/undefined accepted.
    - **Property 3: Form validation completeness** — For any form data with at least one required field empty/invalid, validation fails with errors for each invalid field.
    - **Validates: Requirements 4.4, 4.5, 4.6**

  - [x] 11.4 Write unit tests for form submission flows
    - Test successful submission shows acknowledgment
    - Test network error preserves data and shows error message
    - Test validation error display for each required field
    - _Requirements: 4.3, 4.4, 4.7_

- [x] 12. Final CTA and Footer
  - [x] 12.1 Implement Final CTA section with enquiry navigation
    - Display headline "READY TO MOVE FORWARD?"
    - Create visible, actionable button that scrolls/navigates to B2B Enquiry section
    - Apply premium styling with Champagne Gold accent on CTA
    - _Requirements: 3.7, 3.8_

  - [x] 12.2 Implement Footer with contact links and social media
    - Display email "ecopackglobaleco@gmail.com" as clickable mailto link
    - Display WhatsApp number "934723328436281482039" as clickable wa.me link opening in new tab
    - Display "@ecopackglobal" linking to Instagram profile (opens new tab)
    - Ensure footer visible at bottom of every page without interaction to reveal
    - Use semantic `<footer>` element
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [x] 12.3 Write unit tests for Footer links and Final CTA
    - Test mailto link href
    - Test WhatsApp link opens in new tab with correct number
    - Test Instagram link opens in new tab
    - Test CTA button scrolls to enquiry form
    - _Requirements: 12.1, 12.2, 12.3, 3.7, 3.8_

- [x] 13. Checkpoint - All sections complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Mobile Optimization
  - [x] 14.1 Implement responsive adaptations for tablet (768-1023px)
    - Render all sections in single/two-column grid
    - Display 3D with reduced polygon count or static fallback if FPS < 24
    - Scale heading typography to minimum 24px, body text minimum 16px
    - _Requirements: 5.2_

  - [x] 14.2 Implement responsive adaptations for mobile (below 768px)
    - Render all sections in single-column layout
    - Replace all 3D visualizations with high-quality static WebP fallback images
    - Ensure no horizontal scrolling on any interactive element
    - Stack enquiry form fields vertically at full width
    - _Requirements: 5.3, 5.7_

  - [x] 14.3 Write unit tests for responsive breakpoint behavior
    - Test 3D fallback on mobile viewport
    - Test navigation transforms to hamburger on mobile
    - Test form stacks vertically on mobile
    - _Requirements: 5.2, 5.3, 5.4_

- [x] 15. Performance Optimization
  - [x] 15.1 Implement code splitting and lazy loading strategy
    - Configure per-route and per-section code splitting
    - Lazy load below-fold content at 200px IntersectionObserver threshold
    - Ensure initial page transfer size ≤ 2MB (before lazy-loaded assets)
    - Critical bundle under 100KB (layout, hero text, CSS, fonts)
    - _Requirements: 7.1, 7.2, 7.7_

  - [x] 15.2 Optimize assets (3D models, images, fonts)
    - Compress GLB models ≤ 5MB each using Draco/meshopt
    - Convert images to WebP/AVIF with responsive srcset
    - Preload critical above-fold assets (hero typography, background, primary GLB)
    - Ensure FCP < 1.5s and LCP < 3s desktop / < 5s mobile under Lighthouse conditions
    - _Requirements: 7.3, 7.4, 7.5, 7.6_

- [x] 16. SEO and Accessibility
  - [x] 16.1 Implement SEO metadata and structured data
    - Generate unique meta titles (30-60 chars) and descriptions (70-160 chars) per page
    - Implement JSON-LD for Organization, Product, BreadcrumbList schemas
    - Add hreflang annotations for en-US, en-GB, en-CA, en-IN, en-AE, x-default
    - Ensure server-side rendered HTML for crawlability
    - Enforce one H1 per page with no skipped heading levels
    - Fallback: generate title from H1 and description from first 160 chars of body if not manually set
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 16.5_

  - [x] 16.2 Implement accessibility layer (ARIA, contrast, alt text)
    - Ensure all text meets WCAG 2.1 AA contrast (4.5:1 normal, 3:1 large)
    - Add alt text (5-150 chars) for all images; empty alt for decorative images
    - Add ARIA roles/labels for custom interactive components (3D_Viewer, non-standard controls)
    - Verify visible focus indicators (2px outline, 3:1 contrast) on all focusable elements
    - Ensure no keyboard focus traps except intentional (mobile menu)
    - _Requirements: 8.3, 8.4, 8.5, 8.7_

  - [x] 16.3 Write property tests for accessibility and SEO (Properties 4, 5, 6, 7)
    - **Property 4: WCAG contrast compliance** — For any text/background pair from design tokens, contrast ratio ≥ 4.5:1 normal, ≥ 3:1 large
    - **Property 5: Heading hierarchy integrity** — For any page, exactly one H1 and no skipped levels
    - **Property 6: SEO metadata bounds** — For any page, meta title 30-60 chars, description 70-160 chars
    - **Property 7: Animation config constraint** — For any section config, max 3 simultaneous elements, all isContentReveal true
    - **Validates: Requirements 8.3, 9.1, 9.5, 9.6, 2.5, 15.4**

- [x] 17. Content Integrity and Final QA
  - [x] 17.1 Implement content integrity validation
    - Ensure Champagne Gold accent used on ≤10% visible area (no backgrounds, primary text, or dominant surfaces)
    - Verify no unverifiable claims (certifications, logos, stats) without evidence
    - Add placeholder format "[PLACEHOLDER: <category>]" for unavailable content
    - Create build-time check: fail if "[PLACEHOLDER:" appears in production build
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

  - [x] 17.2 Implement 13-section sequential order verification and scroll wiring
    - Verify homepage renders all 13 sections in order: Hero, Brand Statement, Paper Water Bottles, 3D Product Anatomy, Why EcoPack Global, Product Portfolio, Industries, Custom Branding, Global Supply, How It Works, B2B Enquiry, Final CTA, Footer
    - Wire scroll-position-linked transitions between all sections
    - Ensure each section is navigable landmark
    - _Requirements: 2.1, 3.1_

  - [x] 17.3 Write integration tests for full homepage
    - Verify 13 sections render in correct order
    - Test form end-to-end submission flow
    - Run axe-core accessibility audit
    - Verify no placeholder text in production build
    - _Requirements: 3.1, 4.3, 8.1, 14.3_

- [x] 18. Final Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check with min 100 iterations
- Unit tests validate specific examples and edge cases
- 3D assets (GLB models) and static fallback images must be provided or created as part of asset preparation
- The design uses TypeScript throughout — all implementations use strict TypeScript
- All 7 correctness properties from the design are covered in property test tasks (11.3 and 16.3)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4"] },
    { "id": 2, "tasks": ["2.1", "2.3", "3.1"] },
    { "id": 3, "tasks": ["2.2", "3.2", "4.1"] },
    { "id": 4, "tasks": ["2.4", "3.3", "4.2"] },
    { "id": 5, "tasks": ["3.4", "4.3", "4.4", "5.1"] },
    { "id": 6, "tasks": ["3.5", "5.2", "5.3"] },
    { "id": 7, "tasks": ["6.1", "8.1"] },
    { "id": 8, "tasks": ["6.2", "8.2", "9.1"] },
    { "id": 9, "tasks": ["9.2", "10.1", "10.2"] },
    { "id": 10, "tasks": ["11.1", "12.1"] },
    { "id": 11, "tasks": ["11.2", "12.2"] },
    { "id": 12, "tasks": ["11.3", "11.4", "12.3"] },
    { "id": 13, "tasks": ["14.1", "14.2"] },
    { "id": 14, "tasks": ["14.3", "15.1", "15.2"] },
    { "id": 15, "tasks": ["16.1", "16.2"] },
    { "id": 16, "tasks": ["16.3", "17.1", "17.2"] },
    { "id": 17, "tasks": ["17.3"] }
  ]
}
```
