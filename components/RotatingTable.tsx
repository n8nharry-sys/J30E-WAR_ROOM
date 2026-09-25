'use client';

import { useEffect, useMemo, useState } from 'react';

/**
 * Tabel yang berputar otomatis per halaman, dipakai untuk Achievement Dept
 * Today, Sales by SMT (MTD), dan Derivatif (MTD) — semua daftar staff yang
 * panjang tampil dengan pola yang sama: N baris per halaman, ganti otomatis,
 * titik indikator halaman di pojok.
 *
 * Data yang dikirim ke komponen ini HARUS sudah diurutkan (achievement
 * tertinggi dulu, sesuai keputusan Harry), komponen ini hanya membagi
 * halaman dan memutar — tidak menyortir ulang.
 */
export function RotatingTable<T>({
  rows,
  rowsPerPage = 5,
  intervalMs = 6000,
  renderHeader,
  renderRow,
  keyOf,
  emptyLabel = 'Belum ada data',
}: {
  rows: T[];
  rowsPerPage?: number;
  intervalMs?: number;
  renderHeader: () => React.ReactNode;
  renderRow: (row: T, indexOnPage: number) => React.ReactNode;
  keyOf: (row: T) => string | number;
  emptyLabel?: string;
}) {
  const pages = useMemo(() => {
    const out: T[][] = [];
    for (let i = 0; i < rows.length; i += rowsPerPage) out.push(rows.slice(i, i + rowsPerPage));
    return out.length ? out : [[]];
  }, [rows, rowsPerPage]);

  const [page, setPage] = useState(0);

  // Reset ke halaman 0 kalau jumlah halaman berubah (data baru masuk),
  // supaya tidak "nyangkut" di halaman yang sudah tidak ada.
  useEffect(() => {
    setPage((p) => (p >= pages.length ? 0 : p));
  }, [pages.length]);

  useEffect(() => {
    if (pages.length <= 1) return;
    const t = setInterval(() => setPage((p) => (p + 1) % pages.length), intervalMs);
    return () => clearInterval(t);
  }, [pages.length, intervalMs]);

  const current = pages[page];

  return (
    <div>
      <table className="w-full text-xs tabular-nums border-collapse">
        <thead>{renderHeader()}</thead>
        <tbody>
          {current.length === 0 && (
            <tr>
              <td className="py-6 text-center text-mut" colSpan={10}>
                {emptyLabel}
              </td>
            </tr>
          )}
          {current.map((r, i) => (
            <tr key={keyOf(r)} className="border-t border-line">
              {renderRow(r, i)}
            </tr>
          ))}
        </tbody>
      </table>
      {pages.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {pages.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === page ? 'w-4 bg-blue' : 'w-1.5 bg-line'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
