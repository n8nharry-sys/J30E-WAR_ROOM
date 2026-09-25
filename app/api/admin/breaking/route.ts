import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { isAdmin } from '@/lib/adminAuth';

// GET: daftar event pending untuk ditinjau di halaman admin.
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { data, error } = await supabaseAdmin
    .from('breaking_events')
    .select('*, employees(nama)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST: buat event manual. Statusnya langsung "pending" — tetap lewat
// tinjauan admin memakai tombol approve yang sama, sesuai permintaan
// Harry ("dapat dilakukan melalui input manual sebelum ditampilkan").
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.json();
  const { nik, kategori, sub_judul, pesan, sales_today, furnipro_today, comser_today } = body;

  if (!nik || !kategori) {
    return NextResponse.json({ error: 'nik dan kategori wajib diisi' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('breaking_events')
    .insert({
      nik,
      kpi: 'MANUAL',
      source: 'manual',
      status: 'pending',
      kategori,
      sub_judul: sub_judul || 'SALES HEBAT',
      pesan: pesan || null,
      sales_today: sales_today || 0,
      furnipro_today: furnipro_today || 0,
      comser_today: comser_today || 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
