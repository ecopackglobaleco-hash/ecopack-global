'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { EnquiryFormProps, ProductInterest } from '@/types/form';

/**
 * Zod validation schema for the B2B Enquiry Form.
 * Validates: Requirements 4.1, 4.2, 4.5, 4.6
 */
export const enquiryFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
  company: z
    .string()
    .min(1, 'Company is required')
    .max(150, 'Company must be 150 characters or less'),
  email: z
    .string()
    .min(1, 'Email is required')
    .max(254, 'Email must be 254 characters or less')
    .refine(
      (val) => {
        // Must contain exactly one "@" followed by a domain with at least one dot
        const atIndex = val.indexOf('@');
        if (atIndex === -1) return false;
        // Ensure exactly one "@"
        if (val.indexOf('@', atIndex + 1) !== -1) return false;
        // Non-empty local part
        const localPart = val.slice(0, atIndex);
        if (localPart.length === 0) return false;
        // Domain must have at least one dot
        const domain = val.slice(atIndex + 1);
        if (domain.length === 0) return false;
        const dotIndex = domain.indexOf('.');
        if (dotIndex === -1 || dotIndex === 0 || dotIndex === domain.length - 1) return false;
        return true;
      },
      { message: 'Please enter a valid email address (e.g., user@domain.com)' }
    ),
  country: z
    .string()
    .min(1, 'Country is required'),
  whatsapp: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.length === 0) return true;
        // Only digits, spaces, hyphens, or a leading "+"
        const pattern = /^\+?[\d\s\-]+$/;
        if (!pattern.test(val)) return false;
        // Digit count must be between 7 and 20
        const digitCount = val.replace(/\D/g, '').length;
        return digitCount >= 7 && digitCount <= 20;
      },
      { message: 'WhatsApp number must contain 7-20 digits, with only digits, spaces, hyphens, or a leading "+"' }
    ),
  productInterest: z
    .string()
    .min(1, 'Product Interest is required'),
  quantity: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.length === 0) return true;
        const num = Number(val);
        if (isNaN(num)) return false;
        return num >= 1 && num <= 10000000;
      },
      { message: 'Quantity must be between 1 and 10,000,000' }
    ),
  customization: z
    .string()
    .max(1000, 'Customization must be 1000 characters or less')
    .optional(),
  message: z
    .string()
    .max(2000, 'Message must be 2000 characters or less')
    .optional(),
});

export type EnquiryFormValues = z.infer<typeof enquiryFormSchema>;

const PRODUCT_OPTIONS: ProductInterest[] = [
  'Paper Cups',
  'Tissues',
  'Compostable Food Packaging',
  'Shopping Bags',
  'Garbage Bags',
  'Biomedical Waste Bags',
  'Paper Water Bottles',
];

const COUNTRIES = [
  'United States',
  'United Kingdom',
  'Canada',
  'India',
  'United Arab Emirates',
  'Australia',
  'Germany',
  'France',
  'Japan',
  'Singapore',
  'Saudi Arabia',
  'South Africa',
  'Brazil',
  'Mexico',
  'Netherlands',
  'Italy',
  'Spain',
  'South Korea',
  'Malaysia',
  'Nigeria',
  'Other',
];

/**
 * B2B Enquiry Lead Generation Form
 * Validates: Requirements 4.1, 4.2, 4.4, 4.5, 4.6, 4.8, 5.7
 */
export default function EnquiryForm({ onSubmit, submissionStatus, submissionError, className }: EnquiryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EnquiryFormValues>({
    resolver: zodResolver(enquiryFormSchema),
    mode: 'onBlur',
  });

  const onFormSubmit = async (data: EnquiryFormValues) => {
    const quantity = data.quantity ? Number(data.quantity) : undefined;
    await onSubmit({
      name: data.name,
      company: data.company,
      email: data.email,
      country: data.country,
      whatsapp: data.whatsapp || undefined,
      productInterest: data.productInterest as ProductInterest,
      quantity: quantity && !isNaN(quantity) ? quantity : undefined,
      customization: data.customization || undefined,
      message: data.message || undefined,
    });
  };

  return (
    <section
      id="enquiry"
      aria-labelledby="enquiry-heading"
      className={`w-full px-section py-16 overflow-x-hidden ${className ?? ''}`}
    >
      <div className="mx-auto max-w-2xl w-full">
        <h2
          id="enquiry-heading"
          className="font-sora text-h2 text-ivory mb-8 text-center"
        >
          B2B Enquiry
        </h2>

        <form
          onSubmit={handleSubmit(onFormSubmit)}
          noValidate
          className="flex flex-col gap-6"
        >
          {/* Honeypot field — hidden from users, catches bots */}
          <input
            type="text"
            name="_honey"
            tabIndex={-1}
            autoComplete="off"
            style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0 }}
            aria-hidden="true"
          />

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="enquiry-name"
              className="font-inter text-sm text-ivory/90"
            >
              Name <span className="text-champagne-gold">*</span>
            </label>
            <input
              id="enquiry-name"
              type="text"
              maxLength={100}
              aria-required="true"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'enquiry-name-error' : undefined}
              className="w-full rounded-glass border-glass bg-glass-obsidian backdrop-blur-glass px-4 py-3 font-inter text-base text-ivory placeholder:text-ivory/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-gold transition-colors"
              placeholder="Your full name"
              {...register('name')}
            />
            {errors.name && (
              <p id="enquiry-name-error" role="alert" className="font-inter text-sm text-red-400">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Company */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="enquiry-company"
              className="font-inter text-sm text-ivory/90"
            >
              Company <span className="text-champagne-gold">*</span>
            </label>
            <input
              id="enquiry-company"
              type="text"
              maxLength={150}
              aria-required="true"
              aria-invalid={!!errors.company}
              aria-describedby={errors.company ? 'enquiry-company-error' : undefined}
              className="w-full rounded-glass border-glass bg-glass-obsidian backdrop-blur-glass px-4 py-3 font-inter text-base text-ivory placeholder:text-ivory/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-gold transition-colors"
              placeholder="Your company name"
              {...register('company')}
            />
            {errors.company && (
              <p id="enquiry-company-error" role="alert" className="font-inter text-sm text-red-400">
                {errors.company.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="enquiry-email"
              className="font-inter text-sm text-ivory/90"
            >
              Email <span className="text-champagne-gold">*</span>
            </label>
            <input
              id="enquiry-email"
              type="email"
              maxLength={254}
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'enquiry-email-error' : undefined}
              className="w-full rounded-glass border-glass bg-glass-obsidian backdrop-blur-glass px-4 py-3 font-inter text-base text-ivory placeholder:text-ivory/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-gold transition-colors"
              placeholder="your.email@company.com"
              {...register('email')}
            />
            {errors.email && (
              <p id="enquiry-email-error" role="alert" className="font-inter text-sm text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Country */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="enquiry-country"
              className="font-inter text-sm text-ivory/90"
            >
              Country <span className="text-champagne-gold">*</span>
            </label>
            <select
              id="enquiry-country"
              aria-required="true"
              aria-invalid={!!errors.country}
              aria-describedby={errors.country ? 'enquiry-country-error' : undefined}
              className="w-full rounded-glass border-glass bg-glass-obsidian backdrop-blur-glass px-4 py-3 font-inter text-base text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-gold transition-colors appearance-none"
              defaultValue=""
              {...register('country')}
            >
              <option value="" disabled className="bg-obsidian text-ivory/40">
                Select your country
              </option>
              {COUNTRIES.map((country) => (
                <option key={country} value={country} className="bg-obsidian text-ivory">
                  {country}
                </option>
              ))}
            </select>
            {errors.country && (
              <p id="enquiry-country-error" role="alert" className="font-inter text-sm text-red-400">
                {errors.country.message}
              </p>
            )}
          </div>

          {/* WhatsApp */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="enquiry-whatsapp"
              className="font-inter text-sm text-ivory/90"
            >
              WhatsApp Number
            </label>
            <input
              id="enquiry-whatsapp"
              type="tel"
              maxLength={25}
              aria-invalid={!!errors.whatsapp}
              aria-describedby={errors.whatsapp ? 'enquiry-whatsapp-error' : undefined}
              className="w-full rounded-glass border-glass bg-glass-obsidian backdrop-blur-glass px-4 py-3 font-inter text-base text-ivory placeholder:text-ivory/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-gold transition-colors"
              placeholder="+1 234 567 8901"
              {...register('whatsapp')}
            />
            {errors.whatsapp && (
              <p id="enquiry-whatsapp-error" role="alert" className="font-inter text-sm text-red-400">
                {errors.whatsapp.message}
              </p>
            )}
          </div>

          {/* Product Interest */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="enquiry-product-interest"
              className="font-inter text-sm text-ivory/90"
            >
              Product Interest <span className="text-champagne-gold">*</span>
            </label>
            <select
              id="enquiry-product-interest"
              aria-required="true"
              aria-invalid={!!errors.productInterest}
              aria-describedby={errors.productInterest ? 'enquiry-product-interest-error' : undefined}
              className="w-full rounded-glass border-glass bg-glass-obsidian backdrop-blur-glass px-4 py-3 font-inter text-base text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-gold transition-colors appearance-none"
              defaultValue=""
              {...register('productInterest')}
            >
              <option value="" disabled className="bg-obsidian text-ivory/40">
                Select a product
              </option>
              {PRODUCT_OPTIONS.map((product) => (
                <option key={product} value={product} className="bg-obsidian text-ivory">
                  {product}
                </option>
              ))}
            </select>
            {errors.productInterest && (
              <p id="enquiry-product-interest-error" role="alert" className="font-inter text-sm text-red-400">
                {errors.productInterest.message}
              </p>
            )}
          </div>

          {/* Quantity */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="enquiry-quantity"
              className="font-inter text-sm text-ivory/90"
            >
              Quantity
            </label>
            <input
              id="enquiry-quantity"
              type="number"
              min={1}
              max={10000000}
              aria-invalid={!!errors.quantity}
              aria-describedby={errors.quantity ? 'enquiry-quantity-error' : undefined}
              className="w-full rounded-glass border-glass bg-glass-obsidian backdrop-blur-glass px-4 py-3 font-inter text-base text-ivory placeholder:text-ivory/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-gold transition-colors"
              placeholder="e.g., 10000"
              {...register('quantity')}
            />
            {errors.quantity && (
              <p id="enquiry-quantity-error" role="alert" className="font-inter text-sm text-red-400">
                {errors.quantity.message}
              </p>
            )}
          </div>

          {/* Customization */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="enquiry-customization"
              className="font-inter text-sm text-ivory/90"
            >
              Customization Requirements
            </label>
            <textarea
              id="enquiry-customization"
              maxLength={1000}
              rows={3}
              aria-invalid={!!errors.customization}
              aria-describedby={errors.customization ? 'enquiry-customization-error' : undefined}
              className="w-full rounded-glass border-glass bg-glass-obsidian backdrop-blur-glass px-4 py-3 font-inter text-base text-ivory placeholder:text-ivory/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-gold transition-colors resize-y"
              placeholder="Describe your customization needs (logo, colors, sizes, etc.)"
              {...register('customization')}
            />
            {errors.customization && (
              <p id="enquiry-customization-error" role="alert" className="font-inter text-sm text-red-400">
                {errors.customization.message}
              </p>
            )}
          </div>

          {/* Message */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="enquiry-message"
              className="font-inter text-sm text-ivory/90"
            >
              Message
            </label>
            <textarea
              id="enquiry-message"
              maxLength={2000}
              rows={4}
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? 'enquiry-message-error' : undefined}
              className="w-full rounded-glass border-glass bg-glass-obsidian backdrop-blur-glass px-4 py-3 font-inter text-base text-ivory placeholder:text-ivory/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-gold transition-colors resize-y"
              placeholder="Any additional details about your enquiry"
              {...register('message')}
            />
            {errors.message && (
              <p id="enquiry-message-error" role="alert" className="font-inter text-sm text-red-400">
                {errors.message.message}
              </p>
            )}
          </div>

          {/* Submission error */}
          {submissionStatus === 'error' && submissionError && (
            <div role="alert" className="rounded-glass border border-red-400/30 bg-red-900/20 px-4 py-3">
              <p className="font-inter text-sm text-red-400">{submissionError}</p>
            </div>
          )}

          {/* Success message */}
          {submissionStatus === 'success' && (
            <div role="status" className="rounded-glass border border-green-400/30 bg-green-900/20 px-4 py-3">
              <p className="font-inter text-sm text-green-400">
                Thank you! Your enquiry has been received. Our team will get back to you shortly.
              </p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={submissionStatus === 'submitting'}
            className="mt-2 w-full rounded-glass bg-champagne-gold px-6 py-4 font-sora text-base font-semibold text-obsidian transition-all hover:bg-champagne-gold/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-gold disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            {submissionStatus === 'submitting' ? 'Submitting...' : 'Submit Enquiry'}
          </button>
        </form>
      </div>
    </section>
  );
}
