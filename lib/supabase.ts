import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client for server-side operations (API routes).
 * Uses the service role key for full DB access (bypasses RLS).
 * NEVER expose this on the client side.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables. Check .env.local');
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

/**
 * Lead data shape matching the `leads` table.
 */
export interface LeadRow {
  id: string;
  created_at: string;
  name: string;
  company: string;
  email: string;
  country: string;
  whatsapp: string | null;
  product_interest: string;
  quantity: number | null;
  customization_requirements: string | null;
  status: string;
}
