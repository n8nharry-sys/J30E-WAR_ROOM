'use client';

import { useEffect, useRef } from 'react';

/**
 * Daftar yang menggulir vertikal terus-menerus (bukan berhalaman) — dipakai
 * untuk Achievement Dept Today, Sales by SMT (MTD), dan Derivatif (MTD).
 * Data HARUS sudah diurutkan tertinggi→terendah oleh pemanggil; komponen ini
 * hanya menggulirkannya, tidak menyortir ulang.
 *
 * Tinggi kontainer diukur otomatis dari parent (h-full) — bukan jumlah baris
 * tetap — supaya pas mengisi space yang tersedia di layout satu layar TV
 * tanpa perlu scroll.
 *
 * Perilaku: CONTINUOUS ROLLING — bergulir halus satu arah dengan kecepatan
 * tetap (px/detik), tanpa berhenti/snap. Daftarnya dirender dua kali
 * berurutan (asli + duplikat) dipisah satu baris kosong berdivider; begitu
 * posisi scroll melewati satu siklus penuh (data asli + divider), posisinya
 * dikurangi persis satu siklus — karena salinan kedua identik dengan yang
 * pertama, lompatan ini tidak terlihat sehingga loop terasa mulus/menerus.
 */
export function RollingList<T>({
  rows,
  rowHeight = 30,
  speed = 24, // px per detik
  renderRow,
  keyOf,
  emptyLabel = 'Belum ada data',
}: {
  rows: T[];
  rowHeight?: number;
  speed?: number;
  renderRow: (row: T, index: number) => React.ReactNode;
  keyOf: (row: T) => string | number;
  emptyLabel?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);

  const rowKey = rows.map(keyOf).join('|');
  const dividerHeight = rowHeight; // "jeda 1 line kosong" antara data terakhir & data pertama
  const cycleHeight = rows.length * rowHeight + dividerHeight;

  useEffect(() => {
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
      // Kalau seluruh siklus (data + divider) sudah muat di dalam container,
      // tidak perlu menggulir sama sekali.
      const needsScroll = cycleHeight > containerHeight;

      if (needsScroll) {
        posRef.current += speed * dt;
        if (posRef.current >= cycleHeight) posRef.current -= cycleHeight; // loop mulus, tanpa jeda/snap
        if (trackRef.current) trackRef.current.style.transform = `translateY(-${posRef.current}px)`;
      }
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [rows.length, rowHeight, speed, cycleHeight]);

  if (rows.length === 0) {
    return <p className="text-mut text-sm text-center py-6">{emptyLabel}</p>;
  }

  const Row = ({ r, i, dup }: { r: T; i: number; dup?: boolean }) => (
    <div
      key={(dup ? 'dup-' : '') + String(keyOf(r))}
      style={{ height: rowHeight }}
      className="flex items-center border-t border-line first:border-0"
    >
      {renderRow(r, i)}
    </div>
  );

  return (
    <div ref={containerRef} className="h-full overflow-hidden">
      <div ref={trackRef} style={{ willChange: 'transform' }}>
        {rows.map((r, i) => (
          <Row key={keyOf(r)} r={r} i={i} />
        ))}
        {/* Divider penanda batas satu siklus data, sebelum data diulang dari awal */}
        <div style={{ height: dividerHeight }} className="flex items-center px-0.5">
          <div className="w-full border-t border-dashed border-line/70" />
        </div>
        {rows.map((r, i) => (
          <Row key={`dup-${keyOf(r)}`} r={r} i={i} dup />
        ))}
      </div>
    </div>
  );
}
