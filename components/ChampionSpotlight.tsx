'use client';

import { useEffect, useState } from 'react';
import { Champion } from '@/lib/types';
import { rp, pcs } from '@/lib/format';
import { StaffAvatar } from './StaffAvatar';

const TABS: { key: Champion['kategori']; label: string; icon: string }[] = [
  { key: 'TOP_SALES', label: 'Top Sales', icon: '🏆' },
  { key: 'TOP_FP', label: 'Top FP', icon: '🛋️' },
  { key: 'TOP_COMSER', label: 'Top Comser', icon: '🔧' },
  { key: 'TOP_DEPARTEMEN', label: 'Top Departemen', icon: '🏬' },
];

// Lebar tiap kotak statistik dipatok manual (bukan grid-cols-3 rata) supaya:
// - SALES cukup lebar untuk angka 9 digit, mis. "Rp 123.456.789"
// - FP MTD dipersempit karena satuannya Pcs (angka pendek), bukan Rupiah
// - COMSER MTD di tengah, Rupiah tapi biasanya lebih kecil dari Sales
const STAT_GRID = { gridTemplateColumns: '15ch 7ch 12ch' };

export function ChampionSpotlight({ data }: { data: Champion[] }) {
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTab((i) => (i + 1) % TABS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const current = data.find((d) => d.kategori === TABS[tab].key);

  return (
    <div className="card h-full min-h-0 flex flex-col relative overflow-hidden bg-gradient-to-br from-navy to-blue-900 text-white">
      {/* watermark besar biar ruang kosong di kartu ini tidak terasa hampa */}
      <span className="absolute -right-6 -bottom-8 text-[130px] opacity-[0.06] leading-none select-none pointer-events-none">
        {TABS[tab].icon}
      </span>

      <div className="h text-amber-400 shrink-0 relative">Champion Spotlight</div>
      <div className="flex gap-1.5 mb-2 flex-wrap shrink-0 relative">
        {TABS.map((t, i) => (
          <button
            key={t.key}
            onClick={() => setTab(i)}
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
              i === tab ? 'bg-amber-400 text-navy' : 'bg-white/10'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!current && <p className="text-white/70 text-center py-8 flex-1 relative">Belum ada data</p>}

      {current && (
        <div className="flex-1 min-h-0 flex flex-col justify-center gap-2.5 relative">
          <div className="flex items-center gap-3">
            <div
              className="rounded-full p-1 shrink-0"
              style={{ background: 'conic-gradient(#f59e0b,#e5484d,#7c3aed,#2563eb,#0f9d58,#f59e0b)' }}
            >
              <div className="rounded-full overflow-hidden bg-slate-200" style={{ width: 96, height: 96 }}>
                <StaffAvatar nik={current.nik} name={current.nama} size={96} />
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-amber-400 font-bold text-[11px] tracking-wide">
                {TABS[tab].icon} CHAMPION {TABS[tab].label.toUpperCase()}
              </div>
              <h2 className="text-2xl font-black leading-tight truncate">{current.nama}</h2>
              <div className="text-[11px] text-white/60 mt-0.5">MTD — bulan berjalan</div>
            </div>
          </div>

          <div className="grid gap-2 w-full" style={STAT_GRID}>
            <div className="bg-white/10 rounded-xl p-2 min-w-0">
              <small className="block text-[9px] opacity-70 font-semibold">SALES MTD</small>
              <b className="text-sm block truncate">{rp(current.sales_mtd)}</b>
            </div>
            <div className="bg-white/10 rounded-xl p-2 min-w-0">
              <small className="block text-[9px] opacity-70 font-semibold">FP MTD</small>
              <b className="text-sm block truncate">{pcs(current.fp_mtd)}</b>
            </div>
            <div className="bg-white/10 rounded-xl p-2 min-w-0">
              <small className="block text-[9px] opacity-70 font-semibold">COMSER MTD</small>
              <b className="text-sm block truncate">{rp(current.comser_mtd)}</b>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
