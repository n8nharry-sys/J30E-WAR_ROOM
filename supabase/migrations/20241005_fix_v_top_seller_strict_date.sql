-- Fix v_top_seller: remove updated_at filter, use strict snapshot_date = CURRENT_DATE
-- Root cause: updated_at::date >= snapshot_date allows yesterday's data with same date
-- Solution: Trust snapshot_date from Apps Script, filter only by current date

DROP VIEW IF EXISTS public.v_top_seller CASCADE;

CREATE OR REPLACE VIEW public.v_top_seller AS
SELECT rank() OVER (ORDER BY sum(s.sales_today) DESC) as no,
       e.nik, e.nama, e.nik || '.jpg' as photo_path,
       sum(s.sales_today) as sales_today,
       round(max(k.target) * t.pct / 100) as today_target,
       sum(s.sales_today) - round(max(k.target) * t.pct / 100) as gap
FROM smt_daily s
JOIN employees e on e.nik = s.nik
CROSS JOIN v_target_today t
LEFT JOIN kpi_mtd k on k.nik = s.nik and k.kpi = 'SALES'
                   and k.periode = date_trunc('month', CURRENT_DATE)::date
WHERE s.snapshot_date = CURRENT_DATE
GROUP BY e.nik, e.nama, t.pct;

COMMENT ON VIEW public.v_top_seller IS 'Top seller hari ini dengan gap (sales - today_target). Filter snapshot_date = CURRENT_DATE strict, tanpa check updated_at.';
