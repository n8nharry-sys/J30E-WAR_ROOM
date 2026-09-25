import 'server-only';
import { createClient } from '@supabase/supabase-js';

// PENTING: hanya diimpor dari kode server (route handler / server action).
// service_role bisa menulis apa saja, jadi jangan pernah dikirim ke browser.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);
