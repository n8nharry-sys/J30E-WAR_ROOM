# Full Replace Strategy for smt_daily

## Problem
Apps Script upsert dengan `on_conflict='snapshot_date,nik,kode_dept'` hanya update/insert baris yang ada di sheet hari ini. Baris lama dari hari sebelumnya yang tidak ada di sheet baru tetap tersimpan, menyebabkan `v_top_seller` menjumlahkan data ganda.

### Contoh
- Google Sheets hari ini: Yoga punya 7 dept (AJ, BH, BJ, BM, BN, BR, X) = 6.4 juta
- Supabase masih simpan: Yoga punya 14 dept (7 lama + 7 baru) = 12.9 juta
- View sum semua = salah

## Solution
Full replace per hari: hapus **semua** `smt_daily` untuk `snapshot_date = CURRENT_DATE`, lalu insert batch baru dari sheet.

## Changes

### Code.gs
1. Tambah function `deleteToday_(table)` — DELETE via PostgREST dengan filter `snapshot_date=eq.TODAY`
2. Update `syncSmtToday_()` untuk:
   - Hapus semua smt_daily hari ini (`deleteToday_('smt_daily')`)
   - Lalu insert batch baru dari sheet (`upsert_()`)

### Impact
- Setiap sync (15 menit default), smt_daily hari ini di-reset dan di-isi ulang
- Data lama tidak pernah tertinggal
- v_top_seller selalu akurat untuk hari ini

## Deployment
1. Copy updated `Code.gs` ke Google Apps Script editor
2. Run `syncAll()` manual atau tunggu trigger 15 menit berikutnya
3. Verify Supabase: `SELECT * FROM v_top_seller LIMIT 5;`
