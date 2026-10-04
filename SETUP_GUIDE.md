# J30E WAR Room – Setup & Deployment Guide

## Overview
War room dashboard untuk monitoring penjualan harian SMT (Sales Marketing Team). Dibangun dengan Next.js 15 + Supabase + Google Sheets sync via Apps Script.

## Prerequisites
- Node.js 18+ & npm
- Supabase account (https://supabase.com)
- Google Account (untuk Apps Script)
- GitHub account
- Vercel account (https://vercel.com)

---

## Step 1 – Clone & Install
```bash
git clone <repository-url>
cd j30e-war-room
npm install
```

---

## Step 2 – Setup Supabase

### 2.1 Buat Project Supabase
1. Login ke https://supabase.com
2. Buat project baru
3. Tunggu hingga initialized

### 2.2 Jalankan Database Migrations
1. Di Supabase Dashboard, buka **SQL Editor**
2. Buat query baru & jalankan semua file di folder `supabase/migrations/`:
   - `20240929_fix_v_top_seller_filter.sql`

### 2.3 Verifikasi Tabel & Views
Pastikan tabel berikut ada di Database:
- `smt_daily` – snapshot harian SMT
- `store_daily` – performa toko harian
- `dept_daily` – performa departemen
- `kpi_mtd` – KPI month-to-date
- `target_harian` – target harian (%)
- `running_text` – breaking news
- `employees` – data karyawan

Pastikan view berikut ada:
- `v_top_seller` – top seller hari ini (dengan filter stale data)
- `v_store_today` – performa toko hari ini
- `v_dept_today` – achievement per departemen
- `v_kpi_rank` – ranking KPI (SALES, FURNIPRO, COMSER)
- `v_champion` – champion spotlight
- `v_running_text` – running text
- `v_target_today` – target percentage hari ini

### 2.4 Ambil Environment Variables
Di Supabase Dashboard → **Project Settings** → **API**:
- Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy `service_role secret` key → `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 3 – Setup Local Environment Variables

Buat file `.env.local` di root project untuk development lokal:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
ADMIN_PASSWORD=your-secure-admin-password
```

---

## Step 4 – Setup Google Apps Script

### 4.1 Persiapan Google Sheets
Buka Google Sheets data input dengan sheet berikut:
- `API_smt_today` – data SMT hari ini
- `API_store_today` – data toko hari ini
- `API_dept` – master departemen
- `API_kpi_mtd` – KPI month-to-date
- `API_target_harian` – target harian (%)
- `API_running_text` – breaking news
- `API_employee` – master karyawan

### 4.2 Setup Apps Script
1. Di Google Sheets, klik **Extensions** → **Apps Script**
2. Hapus code template bawaan
3. Copy seluruh isi file `scripts/apps-script/Code.gs` ke editor
4. Save (Ctrl+S)

### 4.3 Set Script Properties
1. Di Apps Script editor, klik **Project Settings** (gear icon)
2. Scroll ke bagian **Script Properties**
3. Klik **Add script property**:
   - `SUPABASE_URL` = `https://your-project.supabase.co`
   - `SUPABASE_SERVICE_KEY` = `your-service-role-key-here`
4. Save script properties

### 4.4 Setup Trigger Otomatis
1. Di Apps Script editor, klik **Triggers** (clock icon)
2. Klik **+ Add Trigger**
3. Atur:
   - **Choose which function to run**: `syncAll_`
   - **Choose which deployment should run**: `Head`
   - **Select event source**: `Time-driven`
   - **Select type of time based trigger**: `Minutes timer` atau `Hour timer`
   - **Select interval**: `Every 15 minutes`
4. Klik **Save** dan berikan otorisasi izin

---

## Step 5 – Deployment ke Vercel (Produksi)

### 5.1 Push Repository ke GitHub
1. Pastikan seluruh code terbaru sudah ter-commit:
   ```bash
   git add .
   git commit -m "feat: setup project"
   git push origin main
   ```

### 5.2 Hubungkan ke Vercel
1. Buka [https://vercel.com](https://vercel.com) dan login via GitHub.
2. Klik tombol **Add New...** → pilih **Project**.
3. Di daftar repository GitHub Anda, cari repo ini dan klik **Import**.

### 5.3 Atur Configuration & Environment Variables di Vercel
1. Pada menu **Configure Project**:
   - **Framework Preset**: biarkan otomatis `Next.js`.
   - **Root Directory**: `./` (default).
2. Buka accordion **Environment Variables**, masukkan 4 variabel berikut satu per satu:
   - Name: `NEXT_PUBLIC_SUPABASE_URL` | Value: `https://your-project.supabase.co`
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Value: `eyJ...` (anon key)
   - Name: `SUPABASE_SERVICE_ROLE_KEY` | Value: `eyJ...` (service role key)
   - Name: `ADMIN_PASSWORD` | Value: `password-admin-anda`
3. Pastikan checkbox `Production`, `Preview`, dan `Development` tercentang.

### 5.4 Deploy
1. Klik tombol **Deploy**.
2. Tunggu proses build selesai (1-2 menit).
3. Setelah deployment selesai, Vercel akan memberikan production URL (contoh: `https://j30e-war-room.vercel.app`).
4. Buka URL tersebut di browser untuk menguji dashboard.

### 5.5 Setup Tampilan TV Display di Toko
1. Buka URL Vercel di browser Smart TV / PC Display.
2. Tekan `F11` untuk Fullscreen.
3. Klik 1x di layar saat halaman selesai load untuk meng-unlock suara Breaking News (otomatis tersimpan via `localStorage`).

---

## Troubleshooting

1. **Data di Vercel tidak mau muncul**:
   - Cek apakah Environment Variables di Vercel Settings → Environment Variables sudah terisi lengkap.
   - Lakukan **Redeploy** jika baru menambahkan variabel.
2. **Supabase Realtime tidak update**:
   - Pastikan tabel di Supabase sudah diaktifkan fitur **Realtime** (Database → Replication → aktifkan untuk tabel `smt_daily`, `store_daily`, dll).
3. **Data stale/kemarin masuk ke Top Seller**:
   - Pastikan migration `20240929_fix_v_top_seller_filter.sql` sudah dieksekusi di Supabase SQL Editor.
