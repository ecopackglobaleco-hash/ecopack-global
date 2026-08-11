/**
 * Types for the B2B Enquiry Lead Generation Form
 * Validates: Requirements 4
 */

/** Product categories available for selection */
export type ProductInterest =
  | 'Paper Water Bottles'
  | 'Paper Cups'
  | 'Tissues'
  | 'Compostable Food Packaging'
  | 'Shopping Bags'
  | 'Garbage Bags'
  | 'Biomedical Waste Bags';

/** Enquiry form data collected from B2B buyers */
export interface EnquiryFormData {
  /** Full name of the contact person (required, max 100 characters) */
  name: string;
  /** Company or organization name (required, max 150 characters) */
  company: string;
  /** Business email address (required, max 254 characters) */
  email: string;
  /** Country of operation (required, selected from predefined list) */
  country: string;
  /** WhatsApp number with country code (optional, max 20 digits) */
  whatsapp?: string;
  /** Product category of interest (required) */
  productInterest: ProductInterest;
  /** Desired order quantity (optional, range 1 to 10,000,000) */
  quantity?: number;
  /** Customization requirements description (optional, max 1000 characters) */
  customization?: string;
  /** Additional message or notes (optional, max 2000 characters) */
  message?: string;
}

/** Validation error state for form fields */
export interface EnquiryFormErrors {
  name?: string;
  company?: string;
  email?: string;
  country?: string;
  whatsapp?: string;
  productInterest?: string;
  quantity?: string;
  customization?: string;
  message?: string;
}

/** Form submission state */
export type FormSubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

/** Props for the EnquiryForm component */
export interface EnquiryFormProps {
  /** Callback when form is successfully submitted */
  onSubmit: (data: EnquiryFormData) => Promise<void>;
  /** Current submission status */
  submissionStatus: FormSubmissionStatus;
  /** Error message from failed submission */
  submissionError?: string;
  /** Additional CSS class name */
  className?: string;
}
