import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import EnquiryFormWrapper from '@/components/EnquiryFormWrapper';

/**
 * Unit tests for the full form submission flow through EnquiryFormWrapper.
 * Validates: Requirements 4.3, 4.4, 4.7
 */

// Mock useReducedMotion to avoid matchMedia dependency
jest.mock('@/lib/useReducedMotion', () => ({
  useReducedMotion: () => true,
}));

// Mock useGsap to avoid GSAP dependency
jest.mock('@/lib/useGsap', () => ({
  useGsap: jest.fn(),
}));

// Helper to fill all required fields with valid data
async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/^name/i), 'Jane Smith');
  await user.type(screen.getByLabelText(/^company/i), 'GreenPack Ltd');
  await user.type(screen.getByLabelText(/^email/i), 'jane@greenpack.com');
  await user.selectOptions(screen.getByLabelText(/^country/i), 'United States');
  await user.selectOptions(screen.getByLabelText(/product interest/i), 'Paper Cups');
}

describe('EnquiryFormWrapper – Submission Flows', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('Successful submission (Req 4.3)', () => {
    it('shows acknowledgment message after successful submission', async () => {
      const user = userEvent.setup();
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Thank you! Your enquiry has been received.',
        }),
      });

      render(<EnquiryFormWrapper />);
      await fillRequiredFields(user);
      await user.click(screen.getByRole('button', { name: /submit enquiry/i }));

      await waitFor(() => {
        expect(screen.getByText(/enquiry has been received/i)).toBeInTheDocument();
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/enquiry', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }));
    });
  });

  describe('Network error preserves data (Req 4.7)', () => {
    it('shows error message and retains form data on network failure', async () => {
      const user = userEvent.setup();
      global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));

      render(<EnquiryFormWrapper />);
      await fillRequiredFields(user);
      await user.click(screen.getByRole('button', { name: /submit enquiry/i }));

      await waitFor(() => {
        expect(screen.getByText(/unable to connect/i)).toBeInTheDocument();
      });

      // Form data is preserved for retry
      expect(screen.getByLabelText(/^name/i)).toHaveValue('Jane Smith');
      expect(screen.getByLabelText(/^company/i)).toHaveValue('GreenPack Ltd');
      expect(screen.getByLabelText(/^email/i)).toHaveValue('jane@greenpack.com');
      expect(screen.getByLabelText(/^country/i)).toHaveValue('United States');
      expect(screen.getByLabelText(/product interest/i)).toHaveValue('Paper Cups');
    });
  });

  describe('Validation error display for each required field (Req 4.4)', () => {
    it('shows inline validation errors when submitting empty form', async () => {
      const user = userEvent.setup();
      render(<EnquiryFormWrapper />);

      await user.click(screen.getByRole('button', { name: /submit enquiry/i }));

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      });
      expect(screen.getByText(/company is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/country is required/i)).toBeInTheDocument();
      expect(screen.getByText(/product interest is required/i)).toBeInTheDocument();
    });
  });

  describe('Submit button disabled during submission', () => {
    it('prevents double-submit by disabling the button while submitting', async () => {
      const user = userEvent.setup();
      // Use a fetch that never resolves to keep the form in "submitting" state
      global.fetch = jest.fn().mockImplementation(() => new Promise(() => {}));

      render(<EnquiryFormWrapper />);
      await fillRequiredFields(user);
      await user.click(screen.getByRole('button', { name: /submit enquiry/i }));

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeDisabled();
      });
      expect(screen.getByRole('button')).toHaveTextContent(/submitting/i);
    });
  });

  describe('Server error preserves data', () => {
    it('shows error message and retains form data on server error response', async () => {
      const user = userEvent.setup();
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          success: false,
          message: 'An unexpected error occurred. Please try again later.',
        }),
      });

      render(<EnquiryFormWrapper />);
      await fillRequiredFields(user);
      await user.click(screen.getByRole('button', { name: /submit enquiry/i }));

      await waitFor(() => {
        expect(screen.getByText(/unexpected error occurred/i)).toBeInTheDocument();
      });

      // Form data preserved for retry
      expect(screen.getByLabelText(/^name/i)).toHaveValue('Jane Smith');
      expect(screen.getByLabelText(/^company/i)).toHaveValue('GreenPack Ltd');
      expect(screen.getByLabelText(/^email/i)).toHaveValue('jane@greenpack.com');
    });
  });
});
