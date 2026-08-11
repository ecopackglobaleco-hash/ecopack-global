# Requirements Document

## Introduction

EcoPack Global is a premium sustainable packaging company targeting international B2B customers. This document defines the requirements for the official EcoPack Global website — a cinematic, scroll-driven, 3D-enhanced marketing site whose primary business objective is generating qualified B2B enquiries from international buyers. The site combines dark luxury aesthetics, realistic 3D product visualization, and smooth scroll-driven storytelling to position EcoPack Global as a premium, innovative, global brand.

## Glossary

- **Website**: The EcoPack Global public-facing Next.js web application
- **Hero_Section**: The full-viewport opening section featuring cinematic dark background, 3D bottle visualization, and primary headline typography
- **3D_Viewer**: The Three.js / React Three Fiber component responsible for rendering photorealistic 3D product models
- **Scroll_Animator**: The GSAP / ScrollTrigger subsystem controlling scroll-driven animations and transitions
- **Enquiry_Form**: The B2B lead generation form collecting prospect information (Name, Company, Email, Country, WhatsApp, Product Interest, Quantity, Customization needs, Message)
- **Product_Card**: A premium visual card component used to present individual products in the portfolio section
- **Navigation**: The site-wide navigation system including header, mobile menu, and section anchors
- **Footer**: The site-wide footer containing contact information, social links, and legal notices
- **Responsive_Layout**: The adaptive layout system supporting desktop (cinematic), tablet (balanced), and mobile (fast/elegant) breakpoints
- **SEO_Module**: The metadata, structured data, and optimization subsystem for international B2B search visibility
- **Accessibility_Layer**: The subsystem providing semantic HTML, keyboard navigation, focus management, and reduced-motion support

## Requirements

### Requirement 1: Hero Section with 3D Product Visualization

**User Story:** As a B2B buyer visiting the website, I want to see a cinematic hero section with a realistic 3D paper water bottle, so that I immediately perceive EcoPack Global as a premium, innovative brand.

#### Acceptance Criteria

1. WHEN the homepage loads, THE Hero_Section SHALL display a full-viewport (100% width and 100% viewport height) dark cinematic background with headline typography on the left and a photorealistic 3D paper water bottle on the right, with the 3D model becoming interactive within 4 seconds of page load on a standard broadband connection
2. WHILE the user scrolls from the top of the Hero_Section (0% scroll progress) to the bottom of the Hero_Section (100% scroll progress), THE 3D_Viewer SHALL animate the bottle rotating 360 degrees around its vertical axis and translating from the right side to the horizontal center, with the camera scale increasing progressively to simulate a close-in effect, synchronized to the user's scroll position
3. THE Hero_Section SHALL render the primary heading using Sora font and body text using Inter font
4. THE Hero_Section SHALL use the primary color palette: Forest Green (#0B2F26), Obsidian (#080A09), Ivory (#F3F0E7), and Champagne Gold (#C8A96B) where Champagne Gold is applied exclusively to accent elements such as highlights, borders, or call-to-action details and not used as a background or primary text color
5. IF the 3D model fails to load or the user's browser does not support WebGL, THEN THE Hero_Section SHALL display a high-resolution static image of the paper water bottle in place of the 3D viewer within 2 seconds of detecting the failure

### Requirement 2: Scroll-Driven Storytelling and Animation

**User Story:** As a site visitor, I want smooth scroll-driven animations throughout the page, so that I experience an engaging cinematic narrative about the brand and products.

#### Acceptance Criteria

1. THE Scroll_Animator SHALL provide scroll-position-linked transitions between all 13 homepage sections, where each section's animation progress is mapped proportionally to the user's scroll position within that section's scroll range
2. WHEN the user scrolls to the Product Anatomy section, THE 3D_Viewer SHALL display a scroll-driven exploded visualization of the paper water bottle components, progressively separating the cap, body, liner, and base layers as the user scrolls through the section
3. WHILE animations are active, THE Scroll_Animator SHALL maintain a minimum frame rate of 30fps on the latest 2 major versions of Chrome, Firefox, Safari, and Edge on desktop viewports (1024px and above)
4. WHEN the user has enabled reduced-motion preferences in their operating system (prefers-reduced-motion: reduce), THE Scroll_Animator SHALL disable all scroll-driven animations and transitions, and instead display each section's final visual state as static content with immediate visibility
5. THE Scroll_Animator SHALL limit each section to a maximum of 3 animated elements transitioning simultaneously, ensuring every animated element directly reveals content (text, images, 3D models) rather than animating purely decorative elements
6. IF the Scroll_Animator detects frame rate dropping below 20fps for more than 2 consecutive seconds, THEN THE Scroll_Animator SHALL reduce animation complexity by disabling non-critical parallax effects while preserving section content visibility

### Requirement 3: Homepage Section Structure

**User Story:** As a B2B buyer, I want a structured homepage that guides me through brand story, products, industries, and enquiry, so that I can understand the full EcoPack Global offering and take action.

#### Acceptance Criteria

1. THE Website SHALL render the homepage with 13 distinct sections in sequential order, each identifiable as a navigable landmark: Hero, Brand Statement, Paper Water Bottles, 3D Product Anatomy, Why EcoPack Global, Product Portfolio, Industries, Custom Branding, Global Supply, How It Works, B2B Enquiry, Final CTA, Footer
2. THE Brand Statement section SHALL display the tagline "PACKAGING SHOULD MOVE FORWARD"
3. THE Why EcoPack Global section SHALL present four visual blocks labeled: Sustainability, Premium Design, Custom Branding, and Global B2B
4. THE Product Portfolio section SHALL display six supporting products (Paper Cups, Tissues, Compostable Food Packaging, Shopping Bags, Garbage Bags, Biomedical Waste Bags) using Product_Card components, with all six products visible without requiring horizontal scrolling on desktop viewports
5. THE Industries section SHALL present seven target industries: Hotels, Restaurants, Corporate, Events, Retail, Healthcare, and Travel
6. THE How It Works section SHALL present a four-step process in numbered sequential order: 1. Tell Us, 2. Develop, 3. Confirm, 4. Deliver
7. THE Final CTA section SHALL display the headline "READY TO MOVE FORWARD?" with a visible, actionable button that navigates the user to the B2B Enquiry section
8. WHEN a user activates the Final CTA button, THE Website SHALL scroll or navigate the viewport to the B2B Enquiry section containing the Enquiry_Form

### Requirement 4: B2B Enquiry Lead Generation Form

**User Story:** As a B2B procurement manager, I want to submit an enquiry with my company details and packaging needs, so that EcoPack Global can provide a relevant quote.

#### Acceptance Criteria

1. THE Enquiry_Form SHALL collect the following fields: Name (text, max 100 characters), Company (text, max 150 characters), Email (text, max 254 characters), Country (selectable from a predefined list of countries), WhatsApp number (text, max 20 digits including country code), Product Interest (selectable from the product categories displayed on the Website), Quantity (numeric, range 1 to 10,000,000), Customization requirements (text, max 1000 characters), and Message (text, max 2000 characters)
2. THE Enquiry_Form SHALL designate the following fields as required: Name, Company, Email, Country, and Product Interest. The remaining fields (WhatsApp number, Quantity, Customization requirements, and Message) SHALL be optional.
3. WHEN a user submits the Enquiry_Form with all required fields completed and valid, THE Website SHALL display a visible acknowledgment message confirming that the enquiry has been received
4. IF a user submits the Enquiry_Form with missing required fields or invalid field values, THEN THE Website SHALL display a validation error message adjacent to each invalid or empty required field, indicating what correction is needed
5. THE Enquiry_Form SHALL validate the Email field to contain exactly one "@" symbol followed by a domain with at least one dot (e.g., user@domain.com) before submission
6. THE Enquiry_Form SHALL validate the WhatsApp number field, when provided, to contain only digits, spaces, hyphens, or a leading "+" symbol, with a minimum length of 7 digits and maximum of 20 digits
7. IF the form submission fails due to a network or server error, THEN THE Website SHALL display an error message indicating the submission was unsuccessful and SHALL preserve the user's entered data so the user can retry without re-entering information
8. THE Enquiry_Form SHALL be accessible via keyboard navigation with tab order matching the top-to-bottom visual sequence of all form fields, and each field SHALL have a visible label programmatically associated with its input

### Requirement 5: Responsive Design

**User Story:** As a B2B buyer using various devices, I want the website to adapt elegantly across desktop, tablet, and mobile, so that I can engage with EcoPack Global content on any device.

#### Acceptance Criteria

1. WHEN viewed on desktop viewports (1024px and above), THE Responsive_Layout SHALL render the full cinematic experience including 3D visualizations and scroll-driven animations with all homepage sections visible and no horizontal overflow
2. WHEN viewed on tablet viewports (768px to 1023px), THE Responsive_Layout SHALL render all homepage sections in a single-column or two-column grid, display 3D visualizations with reduced polygon count or static fallback if frame rate drops below 24fps, and scale heading typography to a minimum of 24px and body text to a minimum of 16px
3. WHEN viewed on mobile viewports (below 768px), THE Responsive_Layout SHALL render all homepage sections in a single-column layout, replace 3D visualizations with high-quality static fallback images, and ensure all interactive elements are reachable without horizontal scrolling
4. WHEN the viewport width is below 768px, THE Navigation SHALL transform into a collapsible mobile menu (hamburger or equivalent) that expands to reveal all navigation links on tap
5. THE Responsive_Layout SHALL maintain a minimum body font size of 16px, minimum touch target size of 44x44px, and minimum spacing of 8px between adjacent interactive elements at all supported breakpoints
6. IF the viewport is resized or the device orientation changes, THEN THE Responsive_Layout SHALL reflow content to fit the new viewport dimensions without requiring a page reload
7. WHEN viewed on mobile viewports (below 768px), THE Responsive_Layout SHALL ensure the Enquiry_Form fields stack vertically and each input field spans the full available width

### Requirement 6: 3D Product Visualization System

**User Story:** As a B2B buyer evaluating packaging options, I want to see photorealistic 3D product renders, so that I can assess the premium quality and design of EcoPack Global products.

#### Acceptance Criteria

1. THE 3D_Viewer SHALL render the paper water bottle model with photorealistic quality including matte paper-based material, soft lighting, and deep shadows
2. THE 3D_Viewer SHALL use compressed 3D assets with a total asset size no greater than 5 MB per model and an initial render time of no more than 3 seconds on a standard broadband connection (10 Mbps)
3. IF the 3D model fails to load or does not complete loading within 10 seconds, THEN THE 3D_Viewer SHALL display a static fallback image of the product at a minimum resolution of 1024×1024 pixels
4. WHILE the 3D_Viewer is loading assets, THE Website SHALL display a loading indicator that matches the site design language
5. WHEN the 3D_Viewer section scrolls to within 200 pixels of the viewport, THE 3D_Viewer SHALL begin loading the 3D assets
6. THE 3D_Viewer SHALL allow the user to rotate the model 360 degrees on the horizontal axis and zoom in or out between 50% and 150% of the default view using mouse drag and scroll interactions
7. WHILE the 3D_Viewer is in an interactive state, THE 3D_Viewer SHALL maintain a minimum frame rate of 30 frames per second during user interactions

### Requirement 7: Performance Optimization

**User Story:** As a site visitor on varying connection speeds, I want the website to load quickly and perform smoothly, so that I can engage with content without frustration.

#### Acceptance Criteria

1. THE Website SHALL implement code splitting to load JavaScript bundles per-route and per-section
2. THE Website SHALL implement lazy loading for images, 3D assets, and below-fold content, triggering asset loading when elements are within 200px of the viewport
3. THE Website SHALL compress all 3D model assets so that no single compressed 3D asset exceeds 5MB transfer size while maintaining visual fidelity at rendered viewport resolution
4. WHEN measured using Lighthouse desktop simulation (10 Mbps download, 40ms RTT, unthrottled CPU), THE Website SHALL achieve a Largest Contentful Paint (LCP) of under 3 seconds for the hero section
5. THE Website SHALL preload critical above-fold assets (hero typography, background, primary 3D model) such that First Contentful Paint (FCP) occurs within 1.5 seconds under Lighthouse desktop simulation conditions
6. WHEN measured using Lighthouse mobile simulation (1.6 Mbps download, 150ms RTT, 4x CPU slowdown), THE Website SHALL achieve a Largest Contentful Paint (LCP) of under 5 seconds for the hero section
7. THE Website SHALL maintain a total initial page transfer size (before lazy-loaded assets) of no more than 2MB for the homepage

### Requirement 8: Accessibility

**User Story:** As a user with accessibility needs, I want the website to be navigable and readable using assistive technologies, so that I can access all content and functionality.

#### Acceptance Criteria

1. THE Accessibility_Layer SHALL use semantic HTML elements (header, nav, main, section, footer, article) throughout the site structure
2. THE Accessibility_Layer SHALL provide keyboard navigation for all interactive elements including Navigation, Enquiry_Form, and Product_Card components, following a logical top-to-bottom, left-to-right tab order that matches the visual layout, and SHALL ensure that keyboard focus is never trapped within any component
3. THE Accessibility_Layer SHALL ensure all text meets WCAG 2.1 AA contrast ratio requirements (minimum 4.5:1 for normal text, 3:1 for large text) against its background
4. WHEN an image or 3D visualization is presented, THE Accessibility_Layer SHALL provide alternative text that identifies the subject and purpose of the content (minimum 5 characters, maximum 150 characters for images; for decorative images, an empty alt attribute shall be used)
5. THE Accessibility_Layer SHALL display a visible focus indicator with a minimum 2px outline that has at least 3:1 contrast ratio against adjacent colors for all focusable elements
6. WHEN reduced-motion is preferred by the user system settings, THE Accessibility_Layer SHALL suppress scroll-driven animations and provide static content presentation
7. THE Accessibility_Layer SHALL provide ARIA roles, labels, and descriptions for all custom interactive components that lack native semantic meaning, including the 3D_Viewer and any non-standard controls
8. WHEN the page loads, THE Accessibility_Layer SHALL provide a skip navigation link as the first focusable element, allowing keyboard users to bypass repetitive navigation and move directly to the main content area

### Requirement 9: SEO and International Visibility

**User Story:** As the EcoPack Global marketing team, I want the website optimized for international B2B search, so that procurement teams in target markets can find us through organic search.

#### Acceptance Criteria

1. THE SEO_Module SHALL generate a unique meta title (between 30 and 60 characters) and a unique meta description (between 70 and 160 characters) for each page, where each meta title contains at least one keyword relevant to the page content and each meta description summarizes the page purpose
2. THE SEO_Module SHALL implement structured data (JSON-LD) for Organization, Product, and BreadcrumbList schemas that passes validation against schema.org specifications with no errors
3. THE SEO_Module SHALL render all content as server-side generated HTML for search engine crawlability
4. THE SEO_Module SHALL include hreflang annotations on every page targeting English-speaking markets (en-US, en-GB, en-CA, en-IN, en-AE), with a self-referencing hreflang tag on each page and an x-default value pointing to the primary market version
5. THE Website SHALL use semantic heading hierarchy on all pages with exactly one H1 per page and no skipped heading levels (e.g., H2 must not be followed directly by H4)
6. IF a page does not have manually authored meta title or meta description content, THEN THE SEO_Module SHALL generate a meta title from the page's H1 text and a meta description from the first 160 characters of the page's body content

### Requirement 10: Global Supply Visualization

**User Story:** As an international buyer, I want to see EcoPack Global's worldwide reach visually, so that I can confirm they serve my market region.

#### Acceptance Criteria

1. THE Global Supply section SHALL display a world map visualization with the following target markets visually highlighted and distinguishable from non-target regions: USA, UAE/Dubai, India, UK/London, Canada
2. WHEN a user hovers over (on pointer devices) or taps (on touch devices) a highlighted market region, THE Website SHALL display the market name in a tooltip or label positioned adjacent to the region without obscuring other highlighted markets
3. THE Global Supply map SHALL remain fully visible with all highlighted regions and their labels rendered without overlap or truncation on viewport widths from 320px to 1920px
4. THE Global Supply section SHALL render the map within 3 seconds of the section becoming visible in the viewport

### Requirement 11: Custom Branding Section

**User Story:** As a B2B buyer seeking branded packaging, I want to understand EcoPack Global's custom branding capabilities, so that I can visualize my brand on their products.

#### Acceptance Criteria

1. THE Custom Branding section SHALL display the headline "YOUR BRAND. YOUR PACKAGING."
2. THE Custom Branding section SHALL display descriptive text explaining that EcoPack Global offers custom branding on packaging products, including at minimum the types of customization available (e.g., logo placement, brand colors)
3. THE Custom Branding section SHALL include a visual element (image or mockup) illustrating branded packaging to help users visualize custom branding on products
4. WHEN the user activates the call-to-action in the Custom Branding section, THE Website SHALL navigate the user to the Enquiry_Form section of the page

### Requirement 12: Contact Information and Footer

**User Story:** As a B2B buyer wanting to reach EcoPack Global, I want easily accessible contact information, so that I can connect through my preferred communication channel.

#### Acceptance Criteria

1. THE Footer SHALL display the contact email address "ecopackglobaleco@gmail.com" as a clickable mailto link that opens the user's default email client when activated
2. THE Footer SHALL display the WhatsApp contact number "934723328436281482039" as a clickable link that opens the WhatsApp conversation with that number when activated
3. THE Footer SHALL display a clickable link labeled "@ecopackglobal" that navigates to the Instagram profile at https://www.instagram.com/ecopackglobal
4. THE Footer SHALL be visible at the bottom of every page of the Website without requiring user interaction to reveal it
5. WHEN a user activates the WhatsApp link or the Instagram link in the Footer, THE Website SHALL open the destination in a new browser tab

### Requirement 13: Navigation System

**User Story:** As a site visitor, I want clear and accessible navigation, so that I can move between sections and pages efficiently.

#### Acceptance Criteria

1. THE Navigation SHALL provide anchor links to the following homepage sections: Hero, Paper Water Bottles, Why EcoPack Global, Product Portfolio, Industries, Custom Branding, Global Supply, How It Works, and B2B Enquiry
2. WHILE the user scrolls the homepage, THE Navigation SHALL remain fixed at the top of the viewport on desktop and tablet breakpoints
3. WHILE the user scrolls the homepage, THE Navigation SHALL visually distinguish the current active section link from inactive links
4. WHEN a user activates a Navigation anchor link, THE Navigation SHALL scroll the viewport to the corresponding section with a smooth scroll transition
5. THE Navigation SHALL be operable entirely via keyboard with focus indicators that meet WCAG 2.1 AA contrast requirements
6. IF the Navigation is in mobile menu state (below 768px), THEN THE Navigation SHALL trap focus within the open menu until it is dismissed

### Requirement 14: Content Integrity

**User Story:** As the EcoPack Global brand team, I want all website content to be factual and verifiable, so that the brand maintains credibility and legal compliance.

#### Acceptance Criteria

1. THE Website SHALL NOT display certifications, manufacturing claims, customer names, logos, production capacity figures, office locations, warehouse locations, awards, partnerships, testimonials, sales figures, or environmental statistics that are not verifiable by documentary evidence such as certificates, contracts, official records, or publicly available authoritative sources
2. WHERE specific factual information is not yet available, THE Website SHALL use placeholders following the format "[PLACEHOLDER: <content category>]" in text distinguishable from surrounding content, indicating content awaiting replacement
3. IF the Website is deployed to a production environment, THEN THE Website SHALL NOT contain any placeholder text matching the "[PLACEHOLDER: ...]" format
4. THE Website SHALL use Champagne Gold (#C8A96B) as an accent color only, applied to no more than 10% of the visible area on any single page, and not as a background, primary text, or dominant surface color

### Requirement 15: Design Language and Visual System

**User Story:** As a B2B buyer, I want the website to convey premium quality through its visual design, so that I associate EcoPack Global with high-end, sophisticated packaging solutions.

#### Acceptance Criteria

1. THE Website SHALL use only the defined color palette — Primary Forest Green (#0B2F26), Obsidian (#080A09), Ivory (#F3F0E7), Champagne Gold (#C8A96B), and Secondary Green (#1C4A3B) — for all backgrounds, text, borders, and accent elements across every page
2. THE Website SHALL use Sora as the heading typeface (h1 through h4) and Inter as the body typeface for all paragraph, label, and UI text, with a minimum body font size of 16px and a typographic scale ratio between 1.2 and 1.5 for heading levels
3. THE Website SHALL render translucent container elements with visible background blur, borders no wider than 1px, gradient overlays with opacity no greater than 20%, and background texture overlays with opacity no greater than 10%
4. THE Website SHALL maintain a minimum content padding of 24px on all sections, a text-to-background contrast ratio of at least 4.5:1 for body text and 3:1 for large text (per WCAG 2.1 AA), and visible box shadows on elevated card and modal elements
5. IF Sora or Inter fails to load, THEN THE Website SHALL render text using a sans-serif system font fallback without layout shift

### Requirement 16: Technology Foundation

**User Story:** As the development team, I want a modern, maintainable technology stack, so that the website can be built efficiently and maintained long-term.

#### Acceptance Criteria

1. THE Website SHALL be built using Next.js with React and TypeScript with strict type-checking enabled
2. THE Website SHALL use Tailwind CSS for styling
3. THE 3D_Viewer SHALL be implemented using Three.js via the React Three Fiber library
4. THE Scroll_Animator SHALL be implemented using GSAP with the ScrollTrigger plugin
5. THE Website SHALL implement server-side rendering for all pages to ensure HTML content is available to search engine crawlers on initial page load
6. THE Website SHALL support the latest two major versions of Chrome, Firefox, Safari, and Edge at the time of release
