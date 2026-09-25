'use client';

import { useEffect, useState } from 'react';
import { Champion } from '@/lib/types';
import { rp } from '@/lib/format';
import { StaffAvatar } from './StaffAvatar';

const TABS: { key: Champion['kategori']; label: string; icon: string }[] = [
  { key: 'TOP_SALES', label: 'Top Sales', icon: '🏆' },
  { key: 'TOP_FP', label: 'Top FP', icon: '🛋️' },
  { key: 'TOP_COMSER', label: 'Top Comser', icon: '🔧' },
  { key: 'TOP_DEPARTEMEN', label: 'Top Departemen', icon: '🏬' },
];

export function ChampionSpotlight({ data }: { data: Champion[] }) {
  const [tab, setTab] = useState(0);

  // Berganti kategori otomatis tiap 5 detik, sama seperti mockup awal.
  useEffect(() => {
    const t = setInterval(() => setTab((i) => (i + 1) % TABS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const current = data.find((d) => d.kategori === TABS[tab].key);

  return (
    <div className="card bg-gradient-to-br from-navy to-blue-900 text-white">
      <div className="h text-amber-400">Champion Spotlight</div>
      <div className="flex gap-1.5 mb-2.5 flex-wrap">
        {TABS.map((t, i) => (
          <button
            key={t.key}
            onClick={() => setTab(i)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
              i === tab ? 'bg-amber-400 text-navy' : 'bg-white/10'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {!current && <p className="text-white/70 text-center py-8">Belum ada data</p>}
      {current && (
        <div className="grid grid-cols-[110px_1fr] gap-3.5 items-center">
          <StaffAvatar nik={current.nik} name={current.nama} size={110} />
          <div>
            <div className="text-amber-400 font-bold text-[11px] tracking-wide">
              {TABS[tab].icon} CHAMPION {TABS[tab].label.toUpperCase()}
            </div>
            <h2 className="text-xl font-black">{current.nama}</h2>
            <div className="grid grid-cols-3 gap-1.5 mt-2.5">
              <div className="bg-white/10 rounded-lg p-1.5">
                <small className="block text-[9px] opacity-70">SALES MTD</small>
                <b className="text-sm">{rp(current.sales_mtd)}</b>
              </div>
              <div className="bg-white/10 rounded-lg p-1.5">
                <small className="block text-[9px] opacity-70">FP MTD</small>
                <b className="text-sm">{rp(current.fp_mtd)}</b>
              </div>
              <div className="bg-white/10 rounded-lg p-1.5">
                <small className="block text-[9px] opacity-70">COMSER MTD</small>
                <b className="text-sm">{rp(current.comser_mtd)}</b>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
