import { NextRequest, NextResponse } from 'next/server';
  import { supabaseAdmin } from '@/lib/supabase/admin';
  import { isAdmin } from '@/lib/adminAuth';

  export async function GET() {
    if (!(await isAdmin())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    // Fetch both breaking_mode and data_confirmed_date
    const [breakingModeResult, dataConfirmedResult] = await Promise.all([
      supabaseAdmin.from('settings').select('value').eq('key', 'breaking_mode').single(),
      supabaseAdmin.from('settings').select('value').eq('key', 'data_confirmed_date').single()
    ]);

    return NextResponse.json({
      breaking_mode: breakingModeResult.data?.value ?? 'review',
      data_confirmed_date: dataConfirmedResult.data?.value ?? null
    });
  }

  export async function POST(req: NextRequest) {
    if (!(await isAdmin())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { breaking_mode, data_confirmed_date } = await req.json();

    // Handle breaking_mode update
    if (breaking_mode !== undefined) {
      if (!['auto', 'review'].includes(breaking_mode)) {
        return NextResponse.json({ error: 'nilai tidak valid untuk breaking_mode' }, { status: 400 });
      }
      await supabaseAdmin.from('settings').update({ value: breaking_mode }).eq('key', 'breaking_mode');
    }

    // Handle data_confirmed_date update
    if (data_confirmed_date !== undefined) {
      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(data_confirmed_date) && data_confirmed_date !== null) {
        return NextResponse.json({ error: 'format tanggal tidak valid. Gunakan YYYY-MM-DD' }, { status: 400 });
      }

      if (data_confirmed_date === null) {
        // Delete the setting if null is passed
        await supabaseAdmin.from('settings').delete().eq('key', 'data_confirmed_date');
      } else {
        // Upsert the setting
        const { data: existing } = await supabaseAdmin.from('settings').select('key').eq('key', 'data_confirmed_date').single();

        if (existing) {
          await supabaseAdmin.from('settings').update({ value: data_confirmed_date }).eq('key', 'data_confirmed_date');
        } else {
          await supabaseAdmin.from('settings').insert({ key: 'data_confirmed_date', value: data_confirmed_date });
        }
      }
    }

    return NextResponse.json({ ok: true });
  }