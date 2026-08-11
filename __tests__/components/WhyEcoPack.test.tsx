import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import WhyEcoPack from '@/components/WhyEcoPack';

// Mock GSAP and ScrollTrigger
jest.mock('@/lib/gsap', () => ({
  gsap: {
    fromTo: jest.fn(),
    context: jest.fn((_cb: () => void) => ({ revert: jest.fn() })),
    registerPlugin: jest.fn(),
  },
  ScrollTrigger: {},
}));

describe('WhyEcoPack Component', () => {
  it('renders a section with id="why-ecopack"', () => {
    render(<WhyEcoPack />);
    const section = document.getElementById('why-ecopack');
    expect(section).toBeInTheDocument();
    expect(section?.tagName.toLowerCase()).toBe('section');
  });

  it('has aria-label="Why EcoPack Global" for accessibility', () => {
    render(<WhyEcoPack />);
    const section = screen.getByLabelText('Why EcoPack Global');
    expect(section).toBeInTheDocument();
  });

  it('renders an h2 heading with "Why EcoPack Global"', () => {
    render(<WhyEcoPack />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Why EcoPack Global');
  });

  it('renders four value blocks with h3 headings', () => {
    render(<WhyEcoPack />);
    const h3Headings = screen.getAllByRole('heading', { level: 3 });
    expect(h3Headings).toHaveLength(4);
  });

  it('renders the four required block titles', () => {
    render(<WhyEcoPack />);
    expect(screen.getByText('Sustainability')).toBeInTheDocument();
    expect(screen.getByText('Premium Design')).toBeInTheDocument();
    expect(screen.getByText('Custom Branding')).toBeInTheDocument();
    expect(screen.getByText('Global B2B')).toBeInTheDocument();
  });

  it('renders descriptive text for each block', () => {
    render(<WhyEcoPack />);
    const articles = document.querySelectorAll('article');
    expect(articles).toHaveLength(4);
    articles.forEach((article) => {
      const paragraph = article.querySelector('p');
      expect(paragraph).toBeInTheDocument();
      expect(paragraph?.textContent?.length).toBeGreaterThan(0);
    });
  });

  it('applies glass-card class to each block', () => {
    render(<WhyEcoPack />);
    const articles = document.querySelectorAll('article');
    articles.forEach((article) => {
      expect(article).toHaveClass('glass-card');
    });
  });

  it('applies Sora font to the section heading', () => {
    render(<WhyEcoPack />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveClass('font-sora');
  });

  it('applies Sora font to block headings', () => {
    render(<WhyEcoPack />);
    const h3Headings = screen.getAllByRole('heading', { level: 3 });
    h3Headings.forEach((heading) => {
      expect(heading).toHaveClass('font-sora');
    });
  });
});
