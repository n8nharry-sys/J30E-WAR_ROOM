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
 * Perilaku: bergulir halus dengan kecepatan tetap (px/detik), berhenti
 * sejenak saat mencapai baris terakhir, lalu lompat ke atas dan mengulang.
 */
export function RollingList<T>({
  rows,
  rowHeight = 30,
  speed = 24, // px per detik
  pauseMs = 1600,
  renderRow,
  keyOf,
  emptyLabel = 'Belum ada data',
}: {
  rows: T[];
  rowHeight?: number;
  speed?: number;
  pauseMs?: number;
  renderRow: (row: T, index: number) => React.ReactNode;
  keyOf: (row: T) => string | number;
  emptyLabel?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const pausedUntilRef = useRef(0);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const rowKey = rows.map(keyOf).join('|');

  useEffect(() => {
    posRef.current = 0;
    pausedUntilRef.current = 0;
    clearTimeout(resetTimeoutRef.current);
    if (trackRef.current) trackRef.current.style.transform = 'translateY(0px)';
  }, [rowKey]);

  useEffect(() => {
    let raf: number;
    let last = performance.now();

    function tick(now: number) {
      const dt = (now - last) / 1000;
      last = now;
      const containerHeight = containerRef.current?.clientHeight ?? 0;
      const totalHeight = rows.length * rowHeight;
      const maxScroll = Math.max(0, totalHeight - containerHeight);

      if (maxScroll > 0 && now >= pausedUntilRef.current) {
        posRef.current = Math.min(maxScroll, posRef.current + speed * dt);
        if (trackRef.current) trackRef.current.style.transform = `translateY(-${posRef.current}px)`;

        if (posRef.current >= maxScroll) {
          pausedUntilRef.current = now + pauseMs;
          clearTimeout(resetTimeoutRef.current);
          resetTimeoutRef.current = setTimeout(() => {
            posRef.current = 0;
          }, pauseMs);
        }
      }
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resetTimeoutRef.current);
    };
  }, [rows.length, rowHeight, speed, pauseMs]);

  if (rows.length === 0) {
    return <p className="text-mut text-sm text-center py-6">{emptyLabel}</p>;
  }

  return (
    <div ref={containerRef} className="h-full overflow-hidden">
      <div ref={trackRef} style={{ willChange: 'transform' }}>
        {rows.map((r, i) => (
          <div
            key={keyOf(r)}
            style={{ height: rowHeight }}
            className="flex items-center border-t border-line first:border-0"
          >
            {renderRow(r, i)}
          </div>
        ))}
      </div>
    </div>
  );
}
