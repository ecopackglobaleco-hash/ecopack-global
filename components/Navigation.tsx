'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { HomepageSection, NavigationLink } from '@/types/navigation';

/** Default navigation links */
const DEFAULT_NAV_LINKS: NavigationLink[] = [
  { id: 'hero', label: 'Hero', href: '#hero' },
  { id: 'why-ecopack', label: 'Why EcoPack Global', href: '#why-ecopack' },
  { id: 'product-portfolio', label: 'Product Portfolio', href: '#product-portfolio' },
  { id: 'industries', label: 'Industries', href: '#industries' },
  { id: 'custom-branding', label: 'Custom Branding', href: '#custom-branding' },
  { id: 'global-supply', label: 'Global Supply', href: '#global-supply' },
  { id: 'how-it-works', label: 'How It Works', href: '#how-it-works' },
  { id: 'enquiry', label: 'B2B Enquiry', href: '#enquiry' },
  { id: 'footer', label: 'Customer Support', href: '#footer' },
];

export interface DesktopNavigationProps {
  /** Override default links if needed */
  links?: NavigationLink[];
  /** Additional CSS class name */
  className?: string;
}

/**
 * Navigation component with desktop anchor links, scroll spy, and mobile hamburger menu.
 * Validates: Requirements 5.4, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6
 */
export default function Navigation({ links = DEFAULT_NAV_LINKS, className = '' }: DesktopNavigationProps) {
  const [activeSection, setActiveSection] = useState<HomepageSection | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isScrollingRef = useRef(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const hamburgerButtonRef = useRef<HTMLButtonElement>(null);

  // Set up IntersectionObserver-based scroll spy
  useEffect(() => {
    const sectionElements: Element[] = [];

    links.forEach((link) => {
      const el = document.getElementById(link.id);
      if (el) sectionElements.push(el);
    });

    if (sectionElements.length === 0) return;

    const visibleSections = new Map<string, IntersectionObserverEntry>();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleSections.set(entry.target.id, entry);
          } else {
            visibleSections.delete(entry.target.id);
          }
        });

        if (visibleSections.size > 0) {
          let bestEntry: IntersectionObserverEntry | null = null;
          let bestRatio = -1;

          visibleSections.forEach((entry) => {
            if (entry.intersectionRatio > bestRatio) {
              bestRatio = entry.intersectionRatio;
              bestEntry = entry;
            }
          });

          if (bestEntry) {
            setActiveSection((bestEntry as IntersectionObserverEntry).target.id as HomepageSection);
          }
        }
      },
      {
        root: null,
        rootMargin: '-10% 0px -60% 0px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    sectionElements.forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [links]);

  // Focus trap for mobile menu (Req 13.6)
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const menuEl = mobileMenuRef.current;
    if (!menuEl) return;

    const focusableSelector =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

    function getFocusableElements(): HTMLElement[] {
      if (!menuEl) return [];
      return Array.from(menuEl.querySelectorAll<HTMLElement>(focusableSelector));
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        hamburgerButtonRef.current?.focus();
        return;
      }

      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    // Focus the first focusable element when menu opens
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Smooth scroll handler
  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, sectionId: HomepageSection) => {
      e.preventDefault();
      const target = document.getElementById(sectionId);
      if (!target) return;

      isScrollingRef.current = true;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      setTimeout(() => {
        isScrollingRef.current = false;
      }, 1000);
    },
    []
  );

  // Mobile nav click: close menu then scroll
  const handleMobileNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, sectionId: HomepageSection) => {
      e.preventDefault();
      setMobileMenuOpen(false);

      const target = document.getElementById(sectionId);
      if (!target) return;

      isScrollingRef.current = true;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      setTimeout(() => {
        isScrollingRef.current = false;
      }, 1000);
    },
    []
  );

  // Keyboard handler for accessibility
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLAnchorElement>, sectionId: HomepageSection) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const target = document.getElementById(sectionId);
        if (!target) return;

        isScrollingRef.current = true;
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });

        setTimeout(() => {
          isScrollingRef.current = false;
        }, 1000);
      }
    },
    []
  );

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
    hamburgerButtonRef.current?.focus();
  }, []);

  return (
    <>
      {/* Desktop Navigation */}
      <nav
        role="navigation"
        aria-label="Main navigation"
        className={`fixed top-0 left-0 right-0 z-50 hidden tablet:block bg-glass-obsidian backdrop-blur-glass border-b border-glass-subtle ${className}`}
      >
        <div className="mx-auto max-w-[1400px] px-6 desktop:px-8 h-[72px] flex items-center justify-between">
          {/* Brand wordmark */}
          <a href="#hero" className="flex items-baseline gap-0.5 shrink-0" aria-label="EcoPack Global — home">
            <span className="font-sora text-[15px] font-bold text-ivory tracking-tight">ECOPACK</span>
            <span className="font-sora text-[10px] font-medium text-champagne-gold uppercase tracking-[0.15em] ml-1">GLOBAL</span>
          </a>

          {/* Navigation links */}
          <ul className="flex items-center gap-1 desktop:gap-2" role="list">
            {links.map((link) => {
              const isActive = activeSection === link.id;

              return (
                <li key={link.id}>
                  <a
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.id)}
                    onKeyDown={(e) => handleKeyDown(e, link.id)}
                    aria-current={isActive ? 'true' : undefined}
                    className={`
                      relative px-2.5 py-2 text-[13px] desktop:text-[14px] font-inter whitespace-nowrap rounded-md transition-colors duration-200
                      focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-gold
                      ${
                        isActive
                          ? 'text-champagne-gold font-medium'
                          : 'text-[#A8A8A0] hover:text-ivory'
                      }
                    `}
                  >
                    {link.label}
                    {isActive && (
                      <span
                        className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-champagne-gold rounded-full"
                        aria-hidden="true"
                      />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Mobile Navigation - Hamburger Button (Req 5.4) */}
      <div className="fixed top-0 left-0 right-0 z-50 tablet:hidden">
        <div className="flex items-center justify-between px-4 h-[64px] bg-glass-obsidian backdrop-blur-glass border-b border-glass-subtle">
          <a href="#hero" className="flex items-baseline gap-0.5" aria-label="EcoPack Global — home">
            <span className="font-sora text-[14px] font-bold text-ivory tracking-tight">ECOPACK</span>
            <span className="font-sora text-[9px] font-medium text-champagne-gold uppercase tracking-[0.12em] ml-0.5">GLOBAL</span>
          </a>
          <button
            ref={hamburgerButtonRef}
            type="button"
            onClick={toggleMobileMenu}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-menu"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="touch-target relative z-50 flex items-center justify-center rounded-md text-ivory hover:text-champagne-gold transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-gold"
          >
            {/* Hamburger icon / X icon */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel (Req 5.4, 13.6) */}
      <div
        ref={mobileMenuRef}
        id="mobile-navigation-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        aria-hidden={!mobileMenuOpen}
        className={`
          fixed inset-0 z-40 tablet:hidden
          transition-all duration-300 ease-in-out
          ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}
        `}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />

        {/* Menu Content */}
        <nav
          role="navigation"
          aria-label="Mobile navigation"
          className={`
            absolute top-0 right-0 h-full w-[85%] max-w-sm
            glass-dark flex flex-col
            transform transition-transform duration-300 ease-in-out
            ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
          `}
        >
          {/* Close button */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-ivory/10">
            <span className="text-ivory text-sm font-sora font-medium">Menu</span>
            <button
              type="button"
              onClick={closeMobileMenu}
              aria-label="Close navigation menu"
              className="touch-target flex items-center justify-center rounded-md text-ivory hover:text-champagne-gold transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-gold"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <ul className="flex-1 overflow-y-auto px-6 py-4" role="list">
            {links.map((link) => {
              const isActive = activeSection === link.id;

              return (
                <li key={link.id}>
                  <a
                    href={link.href}
                    onClick={(e) => handleMobileNavClick(e, link.id)}
                    aria-current={isActive ? 'true' : undefined}
                    className={`
                      block px-3 py-3 text-base font-inter rounded-md transition-colors duration-200
                      focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-gold
                      ${
                        isActive
                          ? 'text-champagne-gold font-medium bg-forest-green/30'
                          : 'text-ivory/80 hover:text-ivory hover:bg-forest-green/20'
                      }
                    `}
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
}
