import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import BrandStatement from '@/components/BrandStatement';

// Mock GSAP and ScrollTrigger
jest.mock('@/lib/gsap', () => ({
  gsap: {
    fromTo: jest.fn(),
    context: jest.fn((_cb: () => void) => ({ revert: jest.fn() })),
    registerPlugin: jest.fn(),
  },
  ScrollTrigger: {},
}));

describe('BrandStatement Component', () => {
  it('renders the tagline "PACKAGING SHOULD MOVE FORWARD"', () => {
    render(<BrandStatement />);
    expect(
      screen.getByText('PACKAGING SHOULD MOVE FORWARD')
    ).toBeInTheDocument();
  });

  it('uses a section element with id="brand-statement"', () => {
    render(<BrandStatement />);
    const section = document.getElementById('brand-statement');
    expect(section).toBeInTheDocument();
    expect(section?.tagName.toLowerCase()).toBe('section');
  });

  it('has aria-label="Brand Statement" for accessibility landmark', () => {
    render(<BrandStatement />);
    const section = screen.getByLabelText('Brand Statement');
    expect(section).toBeInTheDocument();
  });

  it('renders the tagline as an h2 heading', () => {
    render(<BrandStatement />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('PACKAGING SHOULD MOVE FORWARD');
  });

  it('applies the Sora font class to the heading', () => {
    render(<BrandStatement />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveClass('font-sora');
  });
});
