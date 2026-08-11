import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

function verifyAdmin(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;
  const password = authHeader.replace('Bearer ', '');
  return password === process.env.ADMIN_PASSWORD;
}

/**
 * Admin API: Update lead status.
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { status } = body;

    const validStatuses = ['New', 'Contacted', 'Qualified', 'Quoted', 'Converted', 'Closed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
