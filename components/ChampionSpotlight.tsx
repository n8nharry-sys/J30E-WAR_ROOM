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

  useEffect(() => {
    const t = setInterval(() => setTab((i) => (i + 1) % TABS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const current = data.find((d) => d.kategori === TABS[tab].key);

  return (
    <div className="card h-full flex flex-col relative overflow-hidden bg-gradient-to-br from-navy to-blue-900 text-white overflow-hidden">
      {/* watermark besar biar ruang kosong di kartu ini tidak terasa hampa */}
      <span className="absolute -right-6 -bottom-8 text-[160px] opacity-[0.06] leading-none select-none pointer-events-none">
        {TABS[tab].icon}
      </span>

      <div className="h text-amber-400 shrink-0 relative">Champion Spotlight</div>
      <div className="flex gap-1.5 mb-3 flex-wrap shrink-0 relative">
        {TABS.map((t, i) => (
          <button
            key={t.key}
            onClick={() => setTab(i)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
              i === tab ? 'bg-amber-400 text-navy' : 'bg-white/10'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!current && <p className="text-white/70 text-center py-8 flex-1 relative">Belum ada data</p>}

      {current && (
        <div className="flex-1 flex flex-col justify-center gap-4 relative">
          <div className="flex items-center gap-5">
            <div
              className="rounded-full p-1.5 shrink-0"
              style={{ background: 'conic-gradient(#f59e0b,#e5484d,#7c3aed,#2563eb,#0f9d58,#f59e0b)' }}
            >
              <div className="rounded-full overflow-hidden bg-slate-200" style={{ width: 128, height: 128 }}>
                <StaffAvatar nik={current.nik} name={current.nama} size={128} />
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-amber-400 font-bold text-xs tracking-wide">
                {TABS[tab].icon} CHAMPION {TABS[tab].label.toUpperCase()}
              </div>
              <h2 className="text-3xl font-black leading-tight truncate">{current.nama}</h2>
              <div className="text-xs text-white/60 mt-1">MTD — bulan berjalan</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-white/10 rounded-xl p-2.5">
              <small className="block text-[10px] opacity-70 font-semibold">SALES MTD</small>
              <b className="text-base truncate max-w-xs">{rp(current.sales_mtd)}</b>
            </div>
            <div className="bg-white/10 rounded-xl p-2.5">
              <small className="block text-[10px] opacity-70 font-semibold">FP MTD</small>
              <b className="text-base">{rp(current.fp_mtd)}</b>
            </div>
            <div className="bg-white/10 rounded-xl p-2.5">
              <small className="block text-[10px] opacity-70 font-semibold">COMSER MTD</small>
              <b className="text-base">{rp(current.comser_mtd)}</b>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
