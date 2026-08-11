"use client";

/**
 * Skip Navigation Link
 * Provides keyboard users a way to bypass repetitive navigation
 * and jump directly to the main content area.
 * Visible only on focus for screen reader and keyboard users.
 *
 * Requirement 8.8: First focusable element, bypasses navigation to #main-content
 */
export default function SkipNavigation() {
  return (
    <a
      href="#main-content"
      className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:z-[9999] focus-visible:inline-block focus-visible:rounded-md focus-visible:bg-forest-green focus-visible:px-4 focus-visible:py-3 focus-visible:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-champagne-gold focus-visible:min-h-[44px] focus-visible:min-w-[44px] focus-visible:text-base focus-visible:leading-normal"
    >
      Skip to main content
    </a>
  );
}
