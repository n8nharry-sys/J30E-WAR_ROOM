-- v_champion: Top performer per category (TOP_SALES, TOP_FP, TOP_COMSER, TOP_DEPARTEMEN)
-- Returns Champion type: kategori, nik, nama, photo_path, sales_mtd, fp_mtd, comser_mtd

DROP VIEW IF EXISTS v_champion;

CREATE OR REPLACE VIEW v_champion AS
WITH ranks_sales AS (
  SELECT 
    'TOP_SALES'::text AS kategori,
    ROW_NUMBER() OVER (ORDER BY k.actual DESC) AS rnk,
    k.nik,
    e.nama,
    COALESCE(e.photo_path, '') AS photo_path,
    k.actual AS sales_mtd,
    NULL::numeric AS fp_mtd,
    NULL::numeric AS comser_mtd
  FROM kpi_mtd k
  JOIN employees e ON e.nik = k.nik
  WHERE k.kpi = 'SALES'
    AND k.periode = date_trunc('month', CURRENT_DATE)::date
),
ranks_fp AS (
  SELECT 
    'TOP_FP'::text AS kategori,
    ROW_NUMBER() OVER (ORDER BY k.actual DESC) AS rnk,
    k.nik,
    e.nama,
    COALESCE(e.photo_path, '') AS photo_path,
    NULL::numeric AS sales_mtd,
    k.actual AS fp_mtd,
    NULL::numeric AS comser_mtd
  FROM kpi_mtd k
  JOIN employees e ON e.nik = k.nik
  WHERE k.kpi = 'FURNIPRO'
    AND k.periode = date_trunc('month', CURRENT_DATE)::date
),
ranks_comser AS (
  SELECT 
    'TOP_COMSER'::text AS kategori,
    ROW_NUMBER() OVER (ORDER BY k.actual DESC) AS rnk,
    k.nik,
    e.nama,
    COALESCE(e.photo_path, '') AS photo_path,
    NULL::numeric AS sales_mtd,
    NULL::numeric AS fp_mtd,
    k.actual AS comser_mtd
  FROM kpi_mtd k
  JOIN employees e ON e.nik = k.nik
  WHERE k.kpi = 'COMSER'
    AND k.periode = date_trunc('month', CURRENT_DATE)::date
),
ranks_dept AS (
  SELECT 
    'TOP_DEPARTEMEN'::text AS kategori,
    ROW_NUMBER() OVER (ORDER BY dd.achv_mtd DESC NULLS LAST) AS rnk,
    dept.pic_nik AS nik,
    e.nama,
    COALESCE(e.photo_path, '') AS photo_path,
    dd.achv_mtd AS sales_mtd,
    NULL::numeric AS fp_mtd,
    NULL::numeric AS comser_mtd
  FROM dept_daily dd
  JOIN dept ON dept.kode_dept = dd.kode_dept
  JOIN employees e ON e.nik = dept.pic_nik
  WHERE dd.snapshot_date = CURRENT_DATE
    AND dept.pic_nik IS NOT NULL
)
SELECT kategori, nik, nama, photo_path, sales_mtd, fp_mtd, comser_mtd
FROM ranks_sales WHERE rnk = 1
UNION ALL
SELECT kategori, nik, nama, photo_path, sales_mtd, fp_mtd, comser_mtd
FROM ranks_fp WHERE rnk = 1
UNION ALL
SELECT kategori, nik, nama, photo_path, sales_mtd, fp_mtd, comser_mtd
FROM ranks_comser WHERE rnk = 1
UNION ALL
SELECT kategori, nik, nama, photo_path, sales_mtd, fp_mtd, comser_mtd
FROM ranks_dept WHERE rnk = 1;
