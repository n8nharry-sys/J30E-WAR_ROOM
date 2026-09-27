'use client';

import { useEffect, useRef } from 'react';

/**
 * Daftar yang menggulir vertikal terus-menerus TANPA JEDA BERHENTI — dipakai
 * untuk Achievement Dept Today, Sales by SMT (MTD), dan Derivatif (MTD).
 * Data HARUS sudah diurutkan tertinggi→terendah oleh pemanggil; komponen ini
 * hanya menggulirkannya, tidak menyortir ulang.
 *
 * Teknik: konten dirender DUA KALI berturut-turut (dipisah satu baris
 * divider kosong), lalu digulir dengan kecepatan tetap. Begitu posisi
 * gulir mencapai persis satu set (rows + divider), posisi dikurangi
 * sebesar itu juga (bukan direset ke 0) — sehingga potongan pixel yang
 * tersisa tetap terbawa dan gulirannya benar-benar mulus tanpa lompatan/
 * jeda saat berputar dari data terakhir kembali ke data pertama.
 */
export function RollingList<T>({
  rows,
  rowHeight = 30,
  speed = 22, // px per detik
  dividerHeight = 16,
  renderRow,
  keyOf,
  emptyLabel = 'Belum ada data',
}: {
  rows: T[];
  rowHeight?: number;
  speed?: number;
  dividerHeight?: number;
  renderRow: (row: T, index: number) => React.ReactNode;
  keyOf: (row: T) => string | number;
  emptyLabel?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);

  const rowKey = rows.map(keyOf).join('|');

  useEffect(() => {
    // Reset posisi hanya kalau isi/urutan baris benar-benar berubah — data
    // dashboard di-poll ulang tiap 60 detik, jangan sampai "loncat" tiap
    // poll walau datanya sama.
    posRef.current = 0;
    if (trackRef.current) trackRef.current.style.transform = 'translateY(0px)';
  }, [rowKey]);

  useEffect(() => {
    let raf: number;
    let last = performance.now();

    function tick(now: number) {
      const dt = (now - last) / 1000;
      last = now;
      const containerHeight = containerRef.current?.clientHeight ?? 0;
      const oneSetHeight = rows.length * rowHeight + dividerHeight;

      if (oneSetHeight > containerHeight && rows.length > 0) {
        posRef.current += speed * dt;
        if (posRef.current >= oneSetHeight) {
          posRef.current -= oneSetHeight; // wrap mulus, sisa pixel tetap terbawa
        }
        if (trackRef.current) trackRef.current.style.transform = `translateY(-${posRef.current}px)`;
      }
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [rows.length, rowHeight, speed, dividerHeight]);

  if (rows.length === 0) {
    return <p className="text-mut text-sm text-center py-6">{emptyLabel}</p>;
  }

  const renderSet = (suffix: string) => (
    <>
      {rows.map((r, i) => (
        <div
          key={`${keyOf(r)}-${suffix}`}
          style={{ height: rowHeight }}
          className="flex items-center border-t border-line first:border-0"
        >
          {renderRow(r, i)}
        </div>
      ))}
    </>
  );

  return (
    <div ref={containerRef} className="h-full overflow-hidden">
      <div ref={trackRef} style={{ willChange: 'transform' }}>
        {renderSet('a')}
        {/* Divider: penanda batas data terakhir → data pertama saat berputar */}
        <div style={{ height: dividerHeight }} className="flex items-center">
          <div className="w-full border-t border-dashed border-line" />
        </div>
        {renderSet('b')}
      </div>
    </div>
  );
}
