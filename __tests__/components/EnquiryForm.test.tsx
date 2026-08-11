import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import EnquiryForm from '@/components/EnquiryForm';
import { enquiryFormSchema } from '@/components/EnquiryForm';
import type { EnquiryFormProps } from '@/types/form';

const defaultProps: EnquiryFormProps = {
  onSubmit: jest.fn().mockResolvedValue(undefined),
  submissionStatus: 'idle',
};

function renderForm(props: Partial<EnquiryFormProps> = {}) {
  return render(<EnquiryForm {...defaultProps} {...props} />);
}

describe('EnquiryForm', () => {
  describe('Rendering and Structure (Req 4.1, 4.8)', () => {
    it('renders all required form fields', () => {
      renderForm();
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/product interest/i)).toBeInTheDocument();
    });

    it('renders optional form fields', () => {
      renderForm();
      expect(screen.getByLabelText(/whatsapp/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/customization/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    });

    it('marks required fields with asterisk', () => {
      renderForm();
      // Required fields have aria-required="true"
      expect(screen.getByLabelText(/^name/i)).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText(/^company/i)).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText(/^email/i)).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText(/^country/i)).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText(/product interest/i)).toHaveAttribute('aria-required', 'true');
    });

    it('associates labels with inputs via htmlFor/id (Req 4.8)', () => {
      renderForm();
      const nameInput = screen.getByLabelText(/^name/i);
      expect(nameInput).toHaveAttribute('id', 'enquiry-name');

      const emailInput = screen.getByLabelText(/^email/i);
      expect(emailInput).toHaveAttribute('id', 'enquiry-email');

      const countrySelect = screen.getByLabelText(/^country/i);
      expect(countrySelect).toHaveAttribute('id', 'enquiry-country');
    });

    it('renders submit button', () => {
      renderForm();
      expect(screen.getByRole('button', { name: /submit enquiry/i })).toBeInTheDocument();
    });

    it('renders product interest dropdown with correct options', () => {
      renderForm();
      const select = screen.getByLabelText(/product interest/i);
      expect(select).toBeInTheDocument();
      expect(screen.getByText('Paper Cups')).toBeInTheDocument();
      expect(screen.getByText('Tissues')).toBeInTheDocument();
      expect(screen.getByText('Compostable Food Packaging')).toBeInTheDocument();
      expect(screen.getByText('Shopping Bags')).toBeInTheDocument();
      expect(screen.getByText('Garbage Bags')).toBeInTheDocument();
      expect(screen.getByText('Biomedical Waste Bags')).toBeInTheDocument();
      expect(screen.getByText('Paper Water Bottles')).toBeInTheDocument();
    });
  });

  describe('Zod Schema Validation', () => {
    it('validates valid email format (Req 4.5)', () => {
      const validResult = enquiryFormSchema.safeParse({
        name: 'John',
        company: 'Acme',
        email: 'john@acme.com',
        country: 'United States',
        productInterest: 'Paper Cups',
      });
      expect(validResult.success).toBe(true);
    });

    it('rejects email without @ symbol', () => {
      const result = enquiryFormSchema.safeParse({
        name: 'John',
        company: 'Acme',
        email: 'johnatacme.com',
        country: 'United States',
        productInterest: 'Paper Cups',
      });
      expect(result.success).toBe(false);
    });

    it('rejects email with multiple @ symbols', () => {
      const result = enquiryFormSchema.safeParse({
        name: 'John',
        company: 'Acme',
        email: 'john@@acme.com',
        country: 'United States',
        productInterest: 'Paper Cups',
      });
      expect(result.success).toBe(false);
    });

    it('rejects email without dot in domain', () => {
      const result = enquiryFormSchema.safeParse({
        name: 'John',
        company: 'Acme',
        email: 'john@acme',
        country: 'United States',
        productInterest: 'Paper Cups',
      });
      expect(result.success).toBe(false);
    });

    it('validates valid WhatsApp number (Req 4.6)', () => {
      const result = enquiryFormSchema.safeParse({
        name: 'John',
        company: 'Acme',
        email: 'john@acme.com',
        country: 'United States',
        productInterest: 'Paper Cups',
        whatsapp: '+1 234 567 8901',
      });
      expect(result.success).toBe(true);
    });

    it('rejects WhatsApp number with fewer than 7 digits', () => {
      const result = enquiryFormSchema.safeParse({
        name: 'John',
        company: 'Acme',
        email: 'john@acme.com',
        country: 'United States',
        productInterest: 'Paper Cups',
        whatsapp: '+1 234',
      });
      expect(result.success).toBe(false);
    });

    it('rejects WhatsApp number with invalid characters', () => {
      const result = enquiryFormSchema.safeParse({
        name: 'John',
        company: 'Acme',
        email: 'john@acme.com',
        country: 'United States',
        productInterest: 'Paper Cups',
        whatsapp: '+1 (234) 567-8901',
      });
      expect(result.success).toBe(false);
    });

    it('allows empty WhatsApp (optional field)', () => {
      const result = enquiryFormSchema.safeParse({
        name: 'John',
        company: 'Acme',
        email: 'john@acme.com',
        country: 'United States',
        productInterest: 'Paper Cups',
        whatsapp: '',
      });
      expect(result.success).toBe(true);
    });

    it('rejects name exceeding 100 characters', () => {
      const result = enquiryFormSchema.safeParse({
        name: 'A'.repeat(101),
        company: 'Acme',
        email: 'john@acme.com',
        country: 'United States',
        productInterest: 'Paper Cups',
      });
      expect(result.success).toBe(false);
    });

    it('rejects quantity outside valid range', () => {
      const result = enquiryFormSchema.safeParse({
        name: 'John',
        company: 'Acme',
        email: 'john@acme.com',
        country: 'United States',
        productInterest: 'Paper Cups',
        quantity: '0',
      });
      expect(result.success).toBe(false);

      const result2 = enquiryFormSchema.safeParse({
        name: 'John',
        company: 'Acme',
        email: 'john@acme.com',
        country: 'United States',
        productInterest: 'Paper Cups',
        quantity: '10000001',
      });
      expect(result2.success).toBe(false);
    });
  });

  describe('Inline Validation Errors (Req 4.4)', () => {
    it('displays error for empty required fields on blur', async () => {
      const user = userEvent.setup();
      renderForm();

      const nameInput = screen.getByLabelText(/^name/i);
      await user.click(nameInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      });
    });

    it('displays email validation error for invalid email', async () => {
      const user = userEvent.setup();
      renderForm();

      const emailInput = screen.getByLabelText(/^email/i);
      await user.type(emailInput, 'invalidemail');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/valid email address/i)).toBeInTheDocument();
      });
    });
  });

  describe('Submission States', () => {
    it('shows submitting state when submissionStatus is submitting', () => {
      renderForm({ submissionStatus: 'submitting' });
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent(/submitting/i);
    });

    it('shows success message when submissionStatus is success', () => {
      renderForm({ submissionStatus: 'success' });
      expect(screen.getByText(/enquiry has been received/i)).toBeInTheDocument();
    });

    it('shows error message when submissionStatus is error', () => {
      renderForm({
        submissionStatus: 'error',
        submissionError: 'Network error occurred',
      });
      expect(screen.getByText(/network error occurred/i)).toBeInTheDocument();
    });
  });
});
