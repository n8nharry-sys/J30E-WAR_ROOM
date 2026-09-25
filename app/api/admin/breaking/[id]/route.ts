import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { isAdmin } from '@/lib/adminAuth';

// PATCH { status: 'approved' | 'rejected' } — menyetujui atau menolak satu
// event (baik yang datang otomatis dari aturan KPI maupun input manual).
// Saat disetujui, tayang_at diisi now() dan TV (yang berlangganan Realtime
// di tabel ini) langsung menampilkannya.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { status } = await req.json();
  if (!['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'status tidak valid' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('breaking_events')
    .update({ status, tayang_at: status === 'approved' ? new Date().toISOString() : null })
    .eq('id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
