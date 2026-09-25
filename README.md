# J30E War Room

Dashboard TV real-time untuk performa sales Informa Java Mall.

**Stack:** Next.js 14 (App Router) · Supabase (Postgres + Realtime + Storage) · Google Apps Script (sinkronisasi dari Google Sheets) · Vercel (hosting)

## Struktur proyek

```
app/
  page.tsx              → dashboard TV (halaman utama)
  admin/page.tsx         → halaman admin (login, tinjau/buat breaking news, setting)
  api/admin/...          → API routes yang dipakai halaman admin (pakai service_role key)
components/               → semua bagian UI dashboard
lib/
  supabase/client.ts     → koneksi browser (anon key, read-only)
  supabase/admin.ts      → koneksi server (service_role key, JANGAN diimpor ke client)
  audio/cheer.ts         → efek suara breaking news (disintesis, tanpa file audio)
  useDashboardData.ts     → hook fetch + Realtime untuk seluruh data dashboard
scripts/apps-script/Code.gs → kode yang ditempel di Google Apps Script (Sheets → Supabase)
supabase-schema.sql        → skema database lengkap (jalankan di Supabase SQL Editor)
```

Panduan instalasi lengkap dari nol sampai live: lihat **INSTALL_GUIDE.md**.

## Menjalankan secara lokal

```bash
npm install
cp .env.example .env.local   # isi dengan kredensial Supabase Anda
npm run dev
```

Buka `http://localhost:3000` untuk dashboard, dan `http://localhost:3000/admin` untuk halaman admin.

## Variabel lingkungan

Lihat `.env.example`. `SUPABASE_SERVICE_ROLE_KEY` dan `ADMIN_PASSWORD` bersifat rahasia — jangan pernah commit ke Git atau expose ke browser.
