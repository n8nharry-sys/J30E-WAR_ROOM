'use client';

import { createClient } from '@supabase/supabase-js';

// Dipakai di komponen client (TV dashboard) untuk membaca data via anon key.
// Anon key hanya boleh SELECT — lihat policy RLS di supabase-schema.sql.
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { realtime: { params: { eventsPerSecond: 5 } } }
);
