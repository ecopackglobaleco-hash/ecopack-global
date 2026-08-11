import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

/**
 * Admin API: List all leads.
 * Protected by ADMIN_PASSWORD in Authorization header.
 */

function verifyAdmin(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;
  const password = authHeader.replace('Bearer ', '');
  return password === process.env.ADMIN_PASSWORD;
}

export async function GET(request: Request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ leads: data });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
