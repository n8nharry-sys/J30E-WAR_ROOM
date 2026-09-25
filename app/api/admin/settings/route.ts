import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { isAdmin } from '@/lib/adminAuth';

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { data } = await supabaseAdmin.from('settings').select('*').eq('key', 'breaking_mode').single();
  return NextResponse.json({ breaking_mode: data?.value ?? 'review' });
}

export async function POST(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { breaking_mode } = await req.json();
  if (!['auto', 'review'].includes(breaking_mode)) {
    return NextResponse.json({ error: 'nilai tidak valid' }, { status: 400 });
  }
  await supabaseAdmin.from('settings').update({ value: breaking_mode }).eq('key', 'breaking_mode');
  return NextResponse.json({ ok: true });
}
