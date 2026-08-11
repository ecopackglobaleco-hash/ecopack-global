'use client';

import { useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { useGsap } from '@/lib/useGsap';
import { useReducedMotion } from '@/lib/useReducedMotion';
import EnquiryForm from '@/components/EnquiryForm';
import type { EnquiryFormData, FormSubmissionStatus } from '@/types/form';

/**
 * Client wrapper component that manages form submission state
 * and wires the EnquiryForm to the API route.
 * Adds scroll-position-linked entrance transitions to the enquiry section.
 * Validates: Requirements 2.1, 4.3, 4.7
 */
export default function EnquiryFormWrapper({ className }: { className?: string }) {
  const [submissionStatus, setSubmissionStatus] = useState<FormSubmissionStatus>('idle');
  const [submissionError, setSubmissionError] = useState<string | undefined>(undefined);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Scroll-position-linked entrance animation
  useGsap(() => {
    if (prefersReducedMotion || !wrapperRef.current) return;

    const el = wrapperRef.current;
    gsap.fromTo(
      el,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          end: 'top 50%',
          scrub: true,
        },
      }
    );
  }, wrapperRef, [prefersReducedMotion]);

  const handleSubmit = async (data: EnquiryFormData): Promise<void> => {
    setSubmissionStatus('submitting');
    setSubmissionError(undefined);

    try {
      // Include honeypot field value for spam protection
      const honeyField = document.querySelector<HTMLInputElement>('input[name="_honey"]');
      const payload = { ...data, _honey: honeyField?.value || '' };

      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmissionStatus('success');
      } else {
        // Server returned an error (400 validation or 500 server error)
        setSubmissionStatus('error');
        setSubmissionError(
          result.message || 'Submission failed. Please try again.'
        );
      }
    } catch {
      // Network error — preserve user data for retry
      setSubmissionStatus('error');
      setSubmissionError(
        'Unable to connect to the server. Please check your internet connection and try again.'
      );
    }
  };

  return (
    <div ref={wrapperRef} className={prefersReducedMotion ? '' : 'opacity-0'}>
      <EnquiryForm
        onSubmit={handleSubmit}
        submissionStatus={submissionStatus}
        submissionError={submissionError}
        className={className}
      />
    </div>
  );
}
