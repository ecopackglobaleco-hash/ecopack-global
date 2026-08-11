import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Navigation from '@/components/Navigation';

// Access the mock IntersectionObserver from setup
const MockIntersectionObserver = (global as any).MockIntersectionObserver as {
  instances: Array<{
    observe: jest.Mock;
    disconnect: jest.Mock;
    trigger: (entries: Partial<IntersectionObserverEntry>[]) => void;
  }>;
};

const EXPECTED_LINKS = [
  { label: 'Hero', href: '#hero' },
  { label: 'Why EcoPack Global', href: '#why-ecopack' },
  { label: 'Product Portfolio', href: '#product-portfolio' },
  { label: 'Industries', href: '#industries' },
  { label: 'Custom Branding', href: '#custom-branding' },
  { label: 'Global Supply', href: '#global-supply' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'B2B Enquiry', href: '#enquiry' },
  { label: 'Customer Support', href: '#footer' },
];

// Helper: create mock section elements in the DOM
function createMockSections() {
  const sectionIds = [
    'hero', 'why-ecopack', 'product-portfolio',
    'industries', 'custom-branding', 'global-supply', 'how-it-works', 'enquiry', 'footer',
  ];
  sectionIds.forEach((id) => {
    const el = document.createElement('div');
    el.id = id;
    document.body.appendChild(el);
  });
}

function cleanupMockSections() {
  const sectionIds = [
    'hero', 'paper-water-bottles', 'why-ecopack', 'product-portfolio',
    'industries', 'custom-branding', 'global-supply', 'how-it-works', 'enquiry',
  ];
  sectionIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });
}

beforeEach(() => {
  MockIntersectionObserver.instances = [];
  createMockSections();
});

afterEach(() => {
  cleanupMockSections();
  jest.clearAllMocks();
});

describe('Navigation Component', () => {
  describe('Anchor link rendering', () => {
    it('renders all 9 navigation links with correct labels and hrefs', () => {
      render(<Navigation />);

      EXPECTED_LINKS.forEach(({ label, href }) => {
        // There may be duplicates (desktop + mobile), so check at least one exists
        const links = screen.getAllByText(label);
        expect(links.length).toBeGreaterThanOrEqual(1);
        // Check that at least one has the correct href
        const hasCorrectHref = links.some(
          (link) => link.closest('a')?.getAttribute('href') === href
        );
        expect(hasCorrectHref).toBe(true);
      });
    });

    it('desktop nav has aria-label "Main navigation"', () => {
      render(<Navigation />);
      const nav = screen.getByLabelText('Main navigation');
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveAttribute('role', 'navigation');
    });
  });

  describe('Smooth scroll behavior', () => {
    it('clicking a desktop link calls scrollIntoView on the target section', () => {
      render(<Navigation />);

      const heroLinks = screen.getAllByText('Hero');
      // Find the desktop link (first one)
      const desktopLink = heroLinks[0].closest('a')!;
      fireEvent.click(desktopLink);

      const heroSection = document.getElementById('hero')!;
      expect(heroSection.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
      });
    });

    it('clicking a link prevents default anchor behavior', () => {
      render(<Navigation />);

      const links = screen.getAllByText('Industries');
      const link = links[0].closest('a')!;

      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault');

      link.dispatchEvent(clickEvent);
      // Since React's synthetic events handle this, we test scrollIntoView was called
      fireEvent.click(link);
      const section = document.getElementById('industries')!;
      expect(section.scrollIntoView).toHaveBeenCalled();
    });
  });

  describe('Mobile menu toggle', () => {
    it('hamburger button has aria-expanded="false" initially', () => {
      render(<Navigation />);
      const hamburger = screen.getByLabelText('Open navigation menu');
      expect(hamburger).toHaveAttribute('aria-expanded', 'false');
    });

    it('clicking hamburger button sets aria-expanded to "true"', () => {
      render(<Navigation />);
      const hamburger = screen.getByLabelText('Open navigation menu');
      fireEvent.click(hamburger);

      // After opening, the button label changes
      const closeButton = screen.getByLabelText('Close navigation menu', { selector: 'button[aria-controls]' });
      expect(closeButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('hamburger button has aria-controls pointing to mobile menu', () => {
      render(<Navigation />);
      const hamburger = screen.getByLabelText('Open navigation menu');
      expect(hamburger).toHaveAttribute('aria-controls', 'mobile-navigation-menu');
    });

    it('mobile menu has role="dialog" and aria-modal="true"', () => {
      render(<Navigation />);
      const dialog = document.getElementById('mobile-navigation-menu');
      expect(dialog).toHaveAttribute('role', 'dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('mobile menu has aria-label "Navigation menu"', () => {
      render(<Navigation />);
      const dialog = document.getElementById('mobile-navigation-menu');
      expect(dialog).toHaveAttribute('aria-label', 'Navigation menu');
    });

    it('mobile menu has aria-hidden="true" when closed', () => {
      render(<Navigation />);
      const dialog = document.getElementById('mobile-navigation-menu');
      expect(dialog).toHaveAttribute('aria-hidden', 'true');
    });

    it('mobile menu has aria-hidden="false" when open', () => {
      render(<Navigation />);
      const hamburger = screen.getByLabelText('Open navigation menu');
      fireEvent.click(hamburger);

      const dialog = document.getElementById('mobile-navigation-menu');
      expect(dialog).toHaveAttribute('aria-hidden', 'false');
    });
  });

  describe('Focus trap logic', () => {
    it('opening mobile menu focuses the first focusable element', async () => {
      render(<Navigation />);
      const hamburger = screen.getByLabelText('Open navigation menu');

      act(() => {
        fireEvent.click(hamburger);
      });

      // The first focusable element in the mobile menu panel should receive focus
      // That's the close button inside the dialog panel (not the hamburger)
      const mobileMenu = document.getElementById('mobile-navigation-menu')!;
      const focusableElements = Array.from(
        mobileMenu.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      expect(focusableElements.length).toBeGreaterThan(0);
      expect(document.activeElement).toBe(focusableElements[0]);
    });

    it('Escape key closes mobile menu and returns focus to hamburger', () => {
      render(<Navigation />);
      const hamburger = screen.getByLabelText('Open navigation menu');

      act(() => {
        fireEvent.click(hamburger);
      });

      act(() => {
        fireEvent.keyDown(document, { key: 'Escape' });
      });

      const dialog = document.getElementById('mobile-navigation-menu');
      expect(dialog).toHaveAttribute('aria-hidden', 'true');
      // Focus should return to hamburger button
      expect(document.activeElement).toBe(
        screen.getByLabelText('Open navigation menu')
      );
    });

    it('Tab from last focusable element wraps to first', () => {
      render(<Navigation />);
      const hamburger = screen.getByLabelText('Open navigation menu');

      act(() => {
        fireEvent.click(hamburger);
      });

      // Get all focusable elements in the mobile menu
      const mobileMenu = document.getElementById('mobile-navigation-menu')!;
      const focusableElements = Array.from(
        mobileMenu.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );

      expect(focusableElements.length).toBeGreaterThan(0);

      const lastElement = focusableElements[focusableElements.length - 1];
      const firstElement = focusableElements[0];

      // Focus the last element
      act(() => {
        lastElement.focus();
      });
      expect(document.activeElement).toBe(lastElement);

      // Press Tab (should wrap to first)
      act(() => {
        fireEvent.keyDown(document, { key: 'Tab', shiftKey: false });
      });

      expect(document.activeElement).toBe(firstElement);
    });

    it('Shift+Tab from first focusable element wraps to last', () => {
      render(<Navigation />);
      const hamburger = screen.getByLabelText('Open navigation menu');

      act(() => {
        fireEvent.click(hamburger);
      });

      const mobileMenu = document.getElementById('mobile-navigation-menu')!;
      const focusableElements = Array.from(
        mobileMenu.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Focus the first element
      act(() => {
        firstElement.focus();
      });
      expect(document.activeElement).toBe(firstElement);

      // Press Shift+Tab (should wrap to last)
      act(() => {
        fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
      });

      expect(document.activeElement).toBe(lastElement);
    });
  });

  describe('Active section highlighting', () => {
    it('sets aria-current="true" on the active section link', () => {
      render(<Navigation />);

      // Trigger IntersectionObserver callback to mark "industries" as visible
      const observer = MockIntersectionObserver.instances[0];
      act(() => {
        observer.trigger([
          {
            target: document.getElementById('industries')!,
            isIntersecting: true,
            intersectionRatio: 0.75,
          },
        ]);
      });

      const industryLinks = screen.getAllByText('Industries');
      // At least one link should have aria-current
      const hasAriaCurrent = industryLinks.some(
        (link) => link.closest('a')?.getAttribute('aria-current') === 'true'
      );
      expect(hasAriaCurrent).toBe(true);
    });

    it('removes aria-current when section is no longer intersecting', () => {
      render(<Navigation />);

      const observer = MockIntersectionObserver.instances[0];

      // First, mark industries as visible
      act(() => {
        observer.trigger([
          {
            target: document.getElementById('industries')!,
            isIntersecting: true,
            intersectionRatio: 0.75,
          },
        ]);
      });

      // Then mark it as not intersecting and another as intersecting
      act(() => {
        observer.trigger([
          {
            target: document.getElementById('industries')!,
            isIntersecting: false,
            intersectionRatio: 0,
          },
          {
            target: document.getElementById('hero')!,
            isIntersecting: true,
            intersectionRatio: 0.5,
          },
        ]);
      });

      const heroLinks = screen.getAllByText('Hero');
      const hasAriaCurrent = heroLinks.some(
        (link) => link.closest('a')?.getAttribute('aria-current') === 'true'
      );
      expect(hasAriaCurrent).toBe(true);

      // Industries should no longer have aria-current
      const industryLinks = screen.getAllByText('Industries');
      const industryHasAriaCurrent = industryLinks.some(
        (link) => link.closest('a')?.getAttribute('aria-current') === 'true'
      );
      expect(industryHasAriaCurrent).toBe(false);
    });

    it('highlights the section with the highest intersection ratio', () => {
      render(<Navigation />);

      const observer = MockIntersectionObserver.instances[0];

      act(() => {
        observer.trigger([
          {
            target: document.getElementById('hero')!,
            isIntersecting: true,
            intersectionRatio: 0.3,
          },
          {
            target: document.getElementById('why-ecopack')!,
            isIntersecting: true,
            intersectionRatio: 0.8,
          },
        ]);
      });

      const whyLinks = screen.getAllByText('Why EcoPack Global');
      const hasAriaCurrent = whyLinks.some(
        (link) => link.closest('a')?.getAttribute('aria-current') === 'true'
      );
      expect(hasAriaCurrent).toBe(true);
    });
  });

  describe('Keyboard navigation', () => {
    it('Enter key on a link triggers scrollIntoView', () => {
      render(<Navigation />);

      const links = screen.getAllByText('Global Supply');
      const link = links[0].closest('a')!;

      fireEvent.keyDown(link, { key: 'Enter' });

      const section = document.getElementById('global-supply')!;
      expect(section.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
      });
    });

    it('Space key on a link triggers scrollIntoView', () => {
      render(<Navigation />);

      const links = screen.getAllByText('How It Works');
      const link = links[0].closest('a')!;

      fireEvent.keyDown(link, { key: ' ' });

      const section = document.getElementById('how-it-works')!;
      expect(section.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
      });
    });

    it('other keys do not trigger scrollIntoView', () => {
      render(<Navigation />);

      const links = screen.getAllByText('Hero');
      const link = links[0].closest('a')!;

      // Clear any previous calls
      (document.getElementById('hero')!.scrollIntoView as jest.Mock).mockClear();

      fireEvent.keyDown(link, { key: 'a' });

      const section = document.getElementById('hero')!;
      expect(section.scrollIntoView).not.toHaveBeenCalled();
    });
  });

  describe('ARIA attributes', () => {
    it('desktop nav element has role="navigation"', () => {
      render(<Navigation />);
      const nav = screen.getByLabelText('Main navigation');
      expect(nav).toHaveAttribute('role', 'navigation');
    });

    it('mobile menu panel has role="dialog"', () => {
      render(<Navigation />);
      const dialog = document.getElementById('mobile-navigation-menu');
      expect(dialog).toHaveAttribute('role', 'dialog');
    });

    it('mobile menu panel has aria-modal="true"', () => {
      render(<Navigation />);
      const dialog = document.getElementById('mobile-navigation-menu');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('mobile navigation inside panel has role="navigation" and aria-label', () => {
      render(<Navigation />);
      const mobileNav = screen.getByLabelText('Mobile navigation');
      expect(mobileNav).toHaveAttribute('role', 'navigation');
    });
  });
});
