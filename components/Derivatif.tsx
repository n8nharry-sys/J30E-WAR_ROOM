import { KpiRank } from '@/lib/types';
import { rp, pcs } from '@/lib/format';
import { RollingList } from './RollingList';

function SubTable({
  title,
  color,
  data,
  unit,
  valueWidth,
}: {
  title: string;
  color: string;
  data: KpiRank[];
  unit: 'rp' | 'pcs';
  // Lebar kolom "jumlah penjualan" dipatok per tabel (bukan "auto") supaya
  // tidak lagi ikut terpotong saat ruang section ini disesuaikan.
  valueWidth: string;
}) {
  // Diurutkan berdasarkan nilai yang ditampilkan (bukan %), tertinggi dulu.
  const rows = [...data].sort((a, b) => (b.actual ?? 0) - (a.actual ?? 0));
  const fmt = unit === 'pcs' ? pcs : rp;
  const gridTemplateColumns = `1.4rem 12ch ${valueWidth}`;

  return (
    <div className="h-full min-h-0 flex flex-col min-w-0">
      <div className="text-[11px] font-extrabold mb-1.5 shrink-0" style={{ color }}>
        {title}
      </div>
      <div className="flex-1 min-h-0">
        <RollingList
          rows={rows}
          rowHeight={30}
          keyOf={(r) => r.nik}
          renderRow={(r, i) => (
            <div className="grid gap-2 items-center w-full text-sm" style={{ gridTemplateColumns }}>
              <span className="text-mut">{i + 1}</span>
              <span className="truncate" title={r.nama}>
                {r.nama}
              </span>
              <span className="font-bold whitespace-nowrap text-right">{fmt(r.actual)}</span>
            </div>
          )}
        />
      </div>
    </div>
  );
}

export function Derivatif({ furnipro, comser }: { furnipro: KpiRank[]; comser: KpiRank[] }) {
  return (
    <div className="card h-full min-h-0 flex flex-col">
      <div className="h shrink-0">Derivatif (MTD)</div>
      {/* Porsi lebar FURNIPRO vs COMSER disesuaikan dengan kebutuhan kolom
          nilainya masing-masing (6ch vs 12ch) supaya keduanya pas, tidak
          ada yang kesempitan atau kelebihan ruang. */}
      <div className="grid grid-cols-[0.9fr_1.1fr] auto-rows-fr gap-4 flex-1 min-h-0">
        <SubTable title="FURNIPRO" color="#2563eb" data={furnipro} unit="pcs" valueWidth="6ch" />
        <SubTable title="COMSER" color="#f59e0b" data={comser} unit="rp" valueWidth="12ch" />
      </div>
    </div>
  );
}
