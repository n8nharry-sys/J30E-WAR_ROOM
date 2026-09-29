-- Fix: Filter v_top_seller to only include rows where updated_at matches snapshot_date
-- This prevents stale data from yesterday being shown after the midnight snapshot
-- but before the morning manual data update (08:00 - 10:00).

-- Drop existing view
DROP VIEW IF EXISTS public.v_top_seller CASCADE;

-- Recreate view with updated_at filter
CREATE OR REPLACE VIEW public.v_top_seller AS
SELECT 
  e.nik,
  e.nama,
  sd.sales_today,
  sd.snapshot_date
FROM smt_daily sd
JOIN employees e ON e.nik = sd.nik
WHERE sd.snapshot_date = CURRENT_DATE
  AND sd.updated_at::date >= sd.snapshot_date
ORDER BY sd.sales_today DESC
LIMIT 10;

-- Comment to document purpose
COMMENT ON VIEW public.v_top_seller IS 'Menampilkan top 10 seller hari ini yang datanya sudah diupdate pada hari snapshot_date (mencegah data lama terbawa dari snapshot tengah malam)';