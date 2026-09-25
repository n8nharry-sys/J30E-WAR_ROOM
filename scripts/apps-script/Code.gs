/**
 * J30E WAR ROOM — Sinkronisasi Google Sheets → Supabase
 * =====================================================
 * Tempel file ini sebagai Code.gs di spreadsheet Data_Java Anda
 * (Extensions > Apps Script).
 *
 * SETUP SEKALI:
 *  1. Project Settings (ikon gerigi) > Script Properties > Add script property:
 *       SUPABASE_URL          = https://xxxxx.supabase.co
 *       SUPABASE_SERVICE_KEY  = (service_role key dari Supabase — BUKAN anon key)
 *  2. Jalankan fungsi testKoneksi() sekali secara manual (klik Run di editor)
 *     untuk memberi izin akses ke Google Sheets & internet.
 *  3. Triggers (ikon jam di sidebar kiri) > Add Trigger:
 *       Function: syncAll | Event source: Time-driven | Every 2 minutes (atau 5 menit)
 *
 * CATATAN:
 *  - Baris kosong, baris tanpa NIK/kode_dept, dan sel berisi teks error
 *    (diawali '#', seperti #DIV/0!) otomatis dilewati.
 *  - kpi_mtd TIDAK mengirim day_start_actual — nilai itu dihitung otomatis
 *    oleh trigger di database (lihat supabase-schema.sql).
 *  - running_text pakai NOMOR BARIS sebagai id. Jangan menyisipkan baris di
 *    tengah sheet API_running-text; untuk menonaktifkan pesan, cukup ubah
 *    kolom 'aktif' jadi FALSE.
 */

const TZ = 'Asia/Jakarta';

function cfg_() {
  const p = PropertiesService.getScriptProperties();
  return {
    url: p.getProperty('SUPABASE_URL'),
    key: p.getProperty('SUPABASE_SERVICE_KEY'),
  };
}

function todayStr_() {
  return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');
}
function monthStr_() {
  return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-01');
}

function sheetRows_(name) {
  const sh = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sh) {
    Logger.log('Sheet tidak ditemukan, dilewati: ' + name);
    return null;
  }
  const values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  const header = values[0].map((h) => String(h).trim());
  return values.slice(1).map((row) => {
    const obj = {};
    header.forEach((h, i) => (obj[h] = row[i]));
    return obj;
  });
}

function isBad_(v) {
  return v === '' || v === null || v === undefined || (typeof v === 'string' && v.trim().charAt(0) === '#');
}

function toNum_(v) {
  return isBad_(v) ? null : Number(v);
}

function toDateStr_(v) {
  if (isBad_(v)) return null;
  if (v instanceof Date) return Utilities.formatDate(v, TZ, 'yyyy-MM-dd');
  return String(v);
}

function toBool_(v) {
  return v === true || String(v).trim().toUpperCase() === 'TRUE';
}

/** Kirim upsert ke PostgREST Supabase. `onConflict` = nama kolom PK, dipisah koma. */
function upsert_(table, rows, onConflict) {
  if (!rows || rows.length === 0) return;
  const { url, key } = cfg_();
  if (!url || !key) {
    throw new Error('SUPABASE_URL / SUPABASE_SERVICE_KEY belum diisi di Script Properties');
  }

  const endpoint = url.replace(/\/$/, '') + '/rest/v1/' + table + '?on_conflict=' + onConflict;
  const res = UrlFetchApp.fetch(endpoint, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      apikey: key,
      Authorization: 'Bearer ' + key,
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    payload: JSON.stringify(rows),
    muteHttpExceptions: true,
  });

  const code = res.getResponseCode();
  if (code >= 300) {
    throw new Error('Upsert ' + table + ' gagal (' + code + '): ' + res.getContentText().slice(0, 300));
  }
}

// ---------- Sinkronisasi per sheet ----------

function syncStoreToday_() {
  const rows = sheetRows_('API_store_today');
  if (!rows) return;
  const snapshot_date = todayStr_();
  const payload = rows
    .filter((r) => !isBad_(r.tahun))
    .map((r) => ({
      snapshot_date,
      tahun: toNum_(r.tahun),
      sales: toNum_(r.sales) || 0,
      traffic: toNum_(r.traffic) || 0,
      transaksi: toNum_(r.transaksi) || 0,
      qty: toNum_(r.qty) || 0,
      sku: toNum_(r.sku) || 0,
    }));
  upsert_('store_daily', payload, 'snapshot_date,tahun');
}

function syncDept_() {
  const rows = sheetRows_('API_dept');
  if (!rows) return;
  const snapshot_date = todayStr_();
  const clean = rows.filter((r) => !isBad_(r.kode_dept));

  upsert_(
    'dept',
    clean.map((r) => ({
      kode_dept: r.kode_dept,
      kategori: isBad_(r.kategori) ? null : r.kategori,
      nama_dept: r.nama_dept,
      monthly_target: toNum_(r.monthly_target) || 0,
      pic_nik: toNum_(r.pic_nik),
    })),
    'kode_dept'
  );

  upsert_(
    'dept_daily',
    clean.map((r) => ({
      snapshot_date,
      kode_dept: r.kode_dept,
      sales_today: toNum_(r.sales_today) || 0,
      achv_mtd: toNum_(r.achv_mtd),
      gap_mtd: toNum_(r.gap_mtd),
      space_prod: toNum_(r.space_prod),
      smt_berjualan: toNum_(r.smt_berjualan),
      smt_achieve: toNum_(r.smt_achieve),
    })),
    'snapshot_date,kode_dept'
  );
}

function syncSmtToday_() {
  const rows = sheetRows_('API_smt_today');
  if (!rows) return;
  const snapshot_date = todayStr_();
  const payload = rows
    .filter((r) => !isBad_(r.nik) && !isBad_(r.kode_dept))
    .map((r) => ({
      snapshot_date,
      nik: toNum_(r.nik),
      kode_dept: r.kode_dept,
      sales_today: toNum_(r.sales_today) || 0,
    }));
  upsert_('smt_daily', payload, 'snapshot_date,nik,kode_dept');
}

function syncKpiMtd_() {
  const rows = sheetRows_('API_kpi_mtd');
  if (!rows) return;
  const periode = monthStr_();
  const payload = rows
    .filter((r) => !isBad_(r.nik) && !isBad_(r.kpi))
    .map((r) => ({
      periode,
      nik: toNum_(r.nik),
      kpi: r.kpi,
      target: toNum_(r.target) || 0,
      actual: toNum_(r.actual) || 0,
      gap: toNum_(r.gap),
      incentive: toNum_(r.incentive) || 0,
    }));
  upsert_('kpi_mtd', payload, 'periode,nik,kpi');
}

function syncEmployee_() {
  const rows = sheetRows_('API_employee');
  if (!rows) return;
  const payload = rows
    .filter((r) => !isBad_(r.nik) && !isBad_(r.nama))
    .map((r) => ({
      nik: toNum_(r.nik),
      nama: String(r.nama).trim(),
      jabatan: isBad_(r.jabatan) ? null : r.jabatan,
      active: true,
    }));
  upsert_('employees', payload, 'nik');
}

function syncTargetHarian_() {
  const rows = sheetRows_('API_target_harian');
  if (!rows) return;
  const payload = rows
    .filter((r) => !isBad_(r.tanggal) && !isBad_(r.pct))
    .map((r) => ({ tanggal: toDateStr_(r.tanggal), pct: toNum_(r.pct) }));
  upsert_('target_harian', payload, 'tanggal');
}

function syncRunningText_() {
  const rows = sheetRows_('API_running-text');
  if (!rows) return;
  const payload = rows
    .map((r, i) => ({
      id: i + 1, // nomor baris — jangan sisipkan baris baru di tengah
      teks: r.teks,
      aktif: toBool_(r.aktif),
      urutan: toNum_(r.urutan) || i + 1,
      mulai: toDateStr_(r.mulai),
      selesai: toDateStr_(r.selesai),
    }))
    .filter((r) => !isBad_(r.teks));
  upsert_('running_text', payload, 'id');
}

/** Fungsi utama — dipanggil oleh trigger tiap 2–5 menit. */
function syncAll() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    Logger.log('Sync sebelumnya masih berjalan, lewati giliran ini.');
    return;
  }
  const jobs = [
    ['store_today', syncStoreToday_],
    ['dept', syncDept_],
    ['smt_today', syncSmtToday_],
    ['kpi_mtd', syncKpiMtd_],
    ['employee', syncEmployee_],
    ['target_harian', syncTargetHarian_],
    ['running_text', syncRunningText_],
  ];
  const errors = [];
  try {
    jobs.forEach(([name, fn]) => {
      try {
        fn();
      } catch (e) {
        errors.push(name + ': ' + e.message);
        Logger.log(name + ' ERROR: ' + e.message);
      }
    });
  } finally {
    lock.releaseLock();
  }
  if (errors.length) {
    Logger.log('Sync selesai dengan error pada: ' + errors.join(' | '));
  } else {
    Logger.log('Sync sukses — ' + new Date());
  }
}

/** Jalankan manual sekali dari editor untuk uji koneksi & memberi izin OAuth. */
function testKoneksi() {
  syncAll();
}
