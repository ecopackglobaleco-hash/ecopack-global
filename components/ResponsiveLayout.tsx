import { ReactNode } from "react";
import SkipNavigation from "./SkipNavigation";

/**
 * Responsive Layout Container
 * Provides semantic HTML structure and responsive behavior for the site.
 *
 * Requirements:
 * - 5.5: Min body font 16px, min touch target 44x44px, min spacing 8px
 * - 5.6: Reflow on viewport resize/orientation change without reload (handled via CSS/Tailwind responsive utilities)
 * - 8.1: Semantic HTML elements (header, nav, main, section, footer)
 * - 8.2: Logical tab order, no focus traps
 * - 8.8: Skip navigation link as first focusable element
 */

interface ResponsiveLayoutProps {
  children: ReactNode;
  /** Optional header content (navigation) */
  header?: ReactNode;
  /** Optional footer content */
  footer?: ReactNode;
}

export default function ResponsiveLayout({
  children,
  header,
  footer,
}: ResponsiveLayoutProps) {
  return (
    <>
      {/* Skip navigation - first focusable element (Req 8.8) */}
      <SkipNavigation />

      {/* Semantic header (Req 8.1) */}
      {header && <header role="banner">{header}</header>}

      {/* Main content area with landmark and skip-nav target (Req 8.1, 8.8) */}
      <main id="main-content" role="main" tabIndex={-1} className="outline-none">
        {children}
      </main>

      {/* Semantic footer (Req 8.1) */}
      {footer && <footer role="contentinfo">{footer}</footer>}
    </>
  );
}
