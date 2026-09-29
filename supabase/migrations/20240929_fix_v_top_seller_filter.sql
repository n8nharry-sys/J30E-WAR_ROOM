-- Fix: Update v_top_seller view to restore today_target & gap calculation
-- plus add filter updated_at >= snapshot_date to prevent stale data from
-- midnight snapshot showing before morning manual data update.
--
-- Root cause: Previous fix only returned sales_today, missing today_target
-- which is calculated from kpi_mtd.target * daily_percentage / 100.

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
                   and k.periode = date_trunc('month', wib_today())::date
WHERE s.snapshot_date = wib_today()
  AND s.updated_at::date >= s.snapshot_date
GROUP BY e.nik, e.nama, t.pct;

COMMENT ON VIEW public.v_top_seller IS 'Top seller hari ini dengan gap (sales - today_target). Filter updated_at untuk hindari data lama dari snapshot tengah malam.';
