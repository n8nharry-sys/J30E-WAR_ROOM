import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { isAdmin } from '@/lib/adminAuth';

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { data } = await supabaseAdmin.from('employees').select('nik, nama').eq('active', true).order('nama');
  return NextResponse.json({ data: data ?? [] });
}
