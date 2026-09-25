# Panduan Instalasi J30E War Room — Dari Nol Sampai Live

Panduan ini mengasumsikan Anda mulai dari titik ini: sheet `Data_Java.xlsx` sudah punya sheet `API_*` yang bersih, skema `supabase-schema.sql` sudah tersedia, dan kode proyek Next.js sudah ada di folder ini. Ikuti urutan di bawah — tiap tahap bergantung pada tahap sebelumnya.

Yang perlu disiapkan dulu: akun **Supabase**, **GitHub**, dan **Vercel** (ketiganya gratis untuk skala ini).

---

## Tahap 1 — Buat proyek Supabase

1. Masuk ke [supabase.com](https://supabase.com) → **New project**.
2. Pilih nama, region terdekat (Singapore paling dekat ke Indonesia), dan buat password database (simpan baik-baik, hanya muncul sekali).
3. Tunggu proyek selesai dibuat (1–2 menit).
4. Buka **SQL Editor** di sidebar kiri → **New query**.
5. Buka file `supabase-schema.sql` dari paket ini, salin seluruh isinya, tempel ke SQL Editor, lalu klik **Run**.
   - Kalau muncul error, baca pesannya — kemungkinan besar skema sudah pernah dijalankan sebagian. Skema ini tidak aman dijalankan dua kali (bukan idempotent), jadi kalau perlu mengulang dari nol, hapus dulu semua tabel yang sudah dibuat.
6. Cek hasilnya: buka **Table Editor**, pastikan tabel seperti `employees`, `dept`, `store_daily`, `kpi_mtd`, `breaking_events`, dll sudah muncul.

### Ambil kredensial API
Buka **Project Settings → API**. Catat tiga hal ini, akan dipakai di Tahap 4 dan 6:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (klik "Reveal" — jaga kerahasiaan key ini)

### Buat Storage bucket untuk foto staff
1. Sidebar **Storage** → **New bucket**.
2. Nama bucket: `photos` (harus persis, kode sudah mengacu ke nama ini).
3. Set **Public bucket** = ON (supaya dashboard bisa menampilkan foto tanpa login).
4. Upload foto tiap SMT dengan nama file **persis NIK-nya**, contoh: `154340.jpg`. Kalau foto belum ada untuk NIK tertentu, dashboard otomatis menampilkan lingkaran berisi inisial nama — tidak akan rusak tampilannya.

### Isi tabel awal secara manual (sekali saja)
Beberapa data tidak datang dari sinkronisasi otomatis dan perlu diisi manual lewat **Table Editor**:
- **`target_harian`** — isi baris untuk hari ini (`tanggal`, `pct`). Ini juga bisa diisi lewat sheet `API_target_harian` kalau Anda mau, tapi kolom ini wajib ada nilainya sebelum dashboard menampilkan angka target yang masuk akal.
- Tabel lain (`employees`, `dept`, `store_daily`, dst) akan otomatis terisi begitu Apps Script berjalan di Tahap 3 — tidak perlu diisi manual.

---

## Tahap 2 — Push kode ke GitHub

1. Buat repository baru di GitHub (kosong, tanpa README/gitignore bawaan agar tidak bentrok).
2. Dari folder proyek ini di komputer Anda:

```bash
cd j30e-war-room
git init
git add .
git commit -m "Initial commit — J30E War Room"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git push -u origin main
```

> `.gitignore` sudah menyertakan `node_modules`, `.next`, dan `.env*` — pastikan file `.env.local` Anda **tidak pernah** ter-commit. Cek dengan `git status` sebelum commit pertama.

---

## Tahap 3 — Setup Google Apps Script (sinkronisasi data)

1. Buka spreadsheet `Data_Java` Anda → menu **Extensions → Apps Script**.
2. Hapus isi `Code.gs` bawaan, ganti dengan isi file `scripts/apps-script/Code.gs` dari paket ini.
3. Di sidebar kiri editor Apps Script, klik ikon gerigi **Project Settings** → scroll ke **Script Properties** → **Add script property**, isi dua baris:

   | Property | Value |
   |---|---|
   | `SUPABASE_URL` | Project URL dari Tahap 1 |
   | `SUPABASE_SERVICE_KEY` | **service_role key** dari Tahap 1 (bukan anon key — service_role diperlukan supaya Apps Script bisa menulis, bukan cuma membaca) |

4. Kembali ke tab **Editor**, pilih fungsi `testKoneksi` dari dropdown fungsi di toolbar, klik **Run**.
   - Pertama kali jalan, Google akan minta izin akses — klik **Review permissions**, pilih akun Anda, klik **Advanced → Go to (nama project) (unsafe)** lalu **Allow**. Ini normal untuk script buatan sendiri.
5. Cek log: **Execution log** di bagian bawah. Harus muncul `Sync sukses — ...`. Kalau ada error, baca pesannya — biasanya karena Script Property salah ketik atau sheet API_ belum sesuai nama.
6. Cek hasilnya di Supabase **Table Editor** — tabel seperti `employees` dan `store_daily` seharusnya sudah terisi.
7. Setelah berhasil manual, pasang trigger otomatis: ikon **jam (Triggers)** di sidebar kiri → **Add Trigger**:
   - Function: `syncAll`
   - Event source: `Time-driven`
   - Type: `Minutes timer` → `Every 2 minutes` (atau 5 menit kalau ingin lebih hemat kuota)
   - Save.

Sinkronisasi sekarang berjalan otomatis. Kalau suatu saat ingin berhenti sementara, hapus trigger ini dari halaman yang sama.

---

## Tahap 4 — Deploy ke Vercel

1. Masuk ke [vercel.com](https://vercel.com) dengan akun GitHub Anda.
2. **Add New → Project** → pilih repository yang tadi di-push.
3. Vercel otomatis mendeteksi ini proyek Next.js — biarkan pengaturan build default.
4. Sebelum klik Deploy, buka bagian **Environment Variables**, isi empat baris ini (nilainya dari Tahap 1, dan buat sendiri untuk yang terakhir):

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role key |
   | `ADMIN_PASSWORD` | password pilihan Anda untuk masuk ke `/admin` |

5. Klik **Deploy**. Tunggu 1–2 menit.
6. Setelah selesai, Vercel memberi URL seperti `j30e-war-room.vercel.app`. Buka URL itu — dashboard seharusnya sudah menampilkan data dari Supabase.

### Domain sendiri (opsional)
Kalau Anda punya domain (misalnya lewat `n8nharry.my.id` atau domain lain), buka **Project → Settings → Domains** di Vercel, tambahkan subdomain seperti `warroom.namadomain.com`, lalu ikuti instruksi Vercel untuk menambah CNAME record di pengelola DNS domain Anda.

### Setiap kali Anda push perubahan kode
Vercel otomatis mendeteksi push baru ke branch `main` di GitHub dan men-deploy ulang — tidak perlu langkah manual apa pun setelah setup awal ini.

---

## Tahap 5 — Ganti logo dan cek tampilan akhir

1. Ganti file `public/logo-informa.png` dengan logo resmi Informa × Java Mall Anda (format PNG, latar transparan atau putih), lalu commit & push — Vercel akan deploy ulang otomatis.
2. Buka dashboard di TV atau browser, cek tiap section tampil dengan data yang benar.
3. Buka `/admin`, masuk dengan `ADMIN_PASSWORD` yang tadi diisi, cek halaman tinjauan breaking news dan form manual berfungsi.

---

## Tahap 6 — Checklist uji end-to-end

- [ ] Ubah salah satu angka di sheet asli (misalnya sales sebuah SMT) → tunggu 2–5 menit → cek dashboard berubah otomatis tanpa refresh manual.
- [ ] Isi `target_harian` untuk hari ini → gauge Target Hari Ini di dashboard menampilkan angka yang sesuai.
- [ ] Buat satu SMT mencapai ambang breaking news (mis. sales naik ≥ Rp 10 juta dalam satu sync) → cek event baru muncul di `/admin` dengan status *pending*.
- [ ] Klik **Tayangkan** di `/admin` → banner breaking news + suara tepuk tangan muncul di dashboard dalam beberapa detik.
- [ ] Buka dashboard di TV pertama kali → klik tombol **🔊 Aktifkan Suara** sekali, supaya breaking news berikutnya berbunyi.
- [ ] Coba buat event manual dari form `/admin` → cek alurnya sama (masuk antrian → Tayangkan → muncul di TV).

---

## Pemeliharaan harian

- **Tiap pagi:** isi `pct` di `API_target_harian` (atau langsung di tabel `target_harian` Supabase) untuk target hari itu.
- **Kalau ada SMT/PS baru:** tambahkan ke `API_employee`, lalu upload foto ke Storage bucket `photos` dengan nama `{nik}.jpg`.
- **Kalau ada departemen baru:** tambahkan ke `API_dept` dengan `monthly_target`-nya.

## Troubleshooting singkat

| Gejala | Kemungkinan penyebab |
|---|---|
| Dashboard blank / error koneksi | `NEXT_PUBLIC_SUPABASE_URL` atau `ANON_KEY` salah di Vercel Environment Variables |
| Data tidak update | Trigger Apps Script belum terpasang, atau cek Execution log di Apps Script untuk error |
| `/admin` tidak bisa login | `ADMIN_PASSWORD` di Vercel berbeda dari yang diketik |
| Foto staff tidak muncul | Nama file di Storage bucket `photos` tidak persis sama dengan NIK, atau bucket belum di-set Public |
| Breaking news tidak berbunyi | Belum klik tombol "Aktifkan Suara" sejak tab TV dibuka/direfresh |
