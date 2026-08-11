import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase';
import { sendLeadNotificationEmail } from '@/lib/email';

/**
 * Server-side validation schema for B2B Enquiry Form submissions.
 * Validates: Requirements 4.3, 4.7
 */
const enquirySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  company: z.string().min(1, 'Company is required').max(150),
  email: z
    .string()
    .min(1, 'Email is required')
    .max(254)
    .refine(
      (val) => {
        const atIndex = val.indexOf('@');
        if (atIndex === -1) return false;
        if (val.indexOf('@', atIndex + 1) !== -1) return false;
        const localPart = val.slice(0, atIndex);
        if (localPart.length === 0) return false;
        const domain = val.slice(atIndex + 1);
        if (domain.length === 0) return false;
        const dotIndex = domain.indexOf('.');
        if (dotIndex === -1 || dotIndex === 0 || dotIndex === domain.length - 1) return false;
        return true;
      },
      { message: 'Please enter a valid email address' }
    ),
  country: z.string().min(1, 'Country is required'),
  whatsapp: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.length === 0) return true;
        const pattern = /^\+?[\d\s\-]+$/;
        if (!pattern.test(val)) return false;
        const digitCount = val.replace(/\D/g, '').length;
        return digitCount >= 7 && digitCount <= 20;
      },
      { message: 'WhatsApp number must contain 7-20 digits' }
    ),
  productInterest: z.string().min(1, 'Product Interest is required'),
  quantity: z.number().min(1).max(10000000).optional(),
  customization: z.string().max(1000).optional(),
  message: z.string().max(2000).optional(),
  // Honeypot field for spam protection
  _honey: z.string().max(0).optional(),
});

// Simple rate limiting (in-memory, per-IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 3; // max 3 submissions per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.count++;
  return false;
}

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, message: 'Too many submissions. Please wait a moment and try again.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Honeypot check (spam bots fill hidden fields)
    if (body._honey && body._honey.length > 0) {
      // Silently reject without revealing the honeypot
      return NextResponse.json({ success: true, message: 'Thank you! Your enquiry has been received.' }, { status: 200 });
    }

    const result = enquirySchema.safeParse(body);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, message: 'Validation failed. Please check your input.', errors: fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;
    const submittedAt = new Date().toISOString();

    // Save to Supabase
    let dbSaved = false;
    try {
      const supabase = createServiceClient();
      const { error: dbError } = await supabase.from('leads').insert({
        name: data.name,
        company: data.company,
        email: data.email,
        country: data.country,
        whatsapp: data.whatsapp || null,
        product_interest: data.productInterest,
        quantity: data.quantity || null,
        customization_requirements: data.customization || data.message || null,
        status: 'New',
      });

      if (dbError) {
        console.error('[Enquiry] Supabase insert error:', dbError);
      } else {
        dbSaved = true;
      }
    } catch (dbErr) {
      console.error('[Enquiry] Database error:', dbErr);
    }

    // Send email notification (non-blocking — don't fail the request if email fails)
    sendLeadNotificationEmail({
      name: data.name,
      company: data.company,
      email: data.email,
      country: data.country,
      whatsapp: data.whatsapp,
      productInterest: data.productInterest,
      quantity: data.quantity,
      customizationRequirements: data.customization || data.message,
      submittedAt: new Date(submittedAt).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    }).catch((err) => {
      console.error('[Enquiry] Email notification failed:', err);
    });

    if (!dbSaved) {
      return NextResponse.json(
        { success: false, message: 'Something went wrong. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for your enquiry. Our team will contact you shortly.',
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
