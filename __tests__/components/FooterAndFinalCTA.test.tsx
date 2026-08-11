import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import Footer from '@/components/Footer';
import FinalCTA from '@/components/FinalCTA';

describe('Footer', () => {
  it('renders mailto link with correct href', () => {
    render(<Footer />);
    const emailLink = screen.getByText('ecopackglobaleco@gmail.com');
    expect(emailLink).toHaveAttribute('href', 'mailto:ecopackglobaleco@gmail.com');
  });

  it('renders WhatsApp link that opens in new tab with correct number', () => {
    render(<Footer />);
    const whatsappLink = screen.getByText('+91 93472 32843');
    expect(whatsappLink).toHaveAttribute('href', 'https://wa.me/919347232843');
    expect(whatsappLink).toHaveAttribute('target', '_blank');
    expect(whatsappLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders Instagram link that opens in new tab', () => {
    render(<Footer />);
    const instaLink = screen.getByText('ecopackglobal');
    expect(instaLink).toHaveAttribute('href', 'https://www.instagram.com/ecopackglobal');
    expect(instaLink).toHaveAttribute('target', '_blank');
    expect(instaLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
});

describe('FinalCTA', () => {
  it('renders the headline text', () => {
    render(<FinalCTA />);
    expect(screen.getByText('READY TO MOVE FORWARD?')).toBeInTheDocument();
  });

  it('scrolls to enquiry form when Send Enquiry button is clicked', () => {
    // Create a mock enquiry section in the DOM
    const enquirySection = document.createElement('div');
    enquirySection.id = 'enquiry';
    document.body.appendChild(enquirySection);

    render(<FinalCTA />);
    const button = screen.getByRole('button', { name: 'Send Enquiry' });
    fireEvent.click(button);

    expect(enquirySection.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });

    // Cleanup
    document.body.removeChild(enquirySection);
  });
});
