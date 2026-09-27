'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export function Header() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const time = now?.toLocaleTimeString('id-ID', { hour12: false, timeZone: 'Asia/Jakarta' }) ?? '--:--:--';
  const date = now?.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }) ?? '';

  return (
    <header className="card !p-2.5 grid grid-cols-3 items-center gap-3">
      <div>
        {/* Ganti /public/logo-informa.png dengan file logo resmi Informa x Java Mall.
            Ukuran dikecilkan (220x66 -> 170x51) supaya header tidak makan
            terlalu banyak tinggi layar di resolusi 1360x768. */}
        <Image src="/logo-informa.png" alt="Informa Java Mall" width={170} height={51} priority />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-black tracking-tight">
          J30E <span className="text-good">WAR ROOM</span>
        </h1>
        <p className="text-[9px] tracking-[.3em] text-mut">REAL-TIME PERFORMANCE MONITOR</p>
      </div>
      <div className="flex justify-end items-center gap-3">
        <div className="text-right">
          <b className="text-xl tabular-nums">{time}</b>
          <small className="block text-mut text-[11px]">{date}</small>
        </div>
        <div className="live !px-3 !py-1">LIVE</div>
      </div>
    </header>
  );
}
