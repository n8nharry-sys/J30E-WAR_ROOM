// Tipe-tipe ini mengikuti kolom view di supabase-schema.sql.
// Jika Anda mengubah view, sesuaikan juga tipe di sini.

export type StoreToday = {
  tahun: number;
  sales: number;
  traffic: number;
  transaksi: number;
  qty: number;
  sku: number;
  scr: number | null;
  basket_size: number | null;
  upt: number | null;
  aur: number | null;
};

export type TargetSummary = {
  tanggal: string;
  pct: number;
  target: number;
  sales: number;
  gap: number;
  achv: number | null;
};

export type DeptToday = {
  kode_dept: string;
  kategori: string | null;
  nama_dept: string;
  monthly_target: number;
  today_target: number;
  sales_today: number;
  gap: number;
  achv_today: number | null;
  achv_mtd: number | null;
  gap_mtd: number | null;
  space_prod: number | null;
  smt_berjualan: number | null;
  smt_achieve: number | null;
};

export type TopSeller = {
  no: number;
  nik: number;
  nama: string;
  photo_path: string;
  sales_today: number;
  today_target: number;
  gap: number;
};

export type KpiRank = {
  kpi: 'SALES' | 'SALES_FURN' | 'SALES_ACC' | 'FURNIPRO' | 'COMSER';
  no: number;
  nik: number;
  nama: string;
  photo_path: string;
  target: number;
  actual: number;
  gap: number | null;
  achv: number | null;
};

export type Champion = {
  kategori: 'TOP_SALES' | 'TOP_FP' | 'TOP_COMSER' | 'TOP_DEPARTEMEN';
  nik: number;
  nama: string;
  photo_path: string;
  sales_mtd: number | null;
  fp_mtd: number | null;
  comser_mtd: number | null;
};

export type BreakingEvent = {
  id: number;
  tanggal: string;
  nik: number;
  kpi: string;
  source: 'auto' | 'manual';
  status: 'pending' | 'approved' | 'rejected';
  tayang_at: string | null;
  kategori: string | null;
  sub_judul: string | null;
  pesan: string | null;
  nilai: number | null;
  threshold: number | null;
  sales_today: number | null;
  furnipro_today: number | null;
  comser_today: number | null;
  created_at: string;
  nama: string;
  photo_path: string;
};

export type RunningTextRow = { id: number; teks: string; urutan: number };
