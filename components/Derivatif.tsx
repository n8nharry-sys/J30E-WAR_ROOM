import { KpiRank } from '@/lib/types';
import { rp, pcs } from '@/lib/format';
import { RollingList } from './RollingList';

function SubTable({
  title,
  color,
  data,
  unit,
}: {
  title: string;
  color: string;
  data: KpiRank[];
  unit: 'rp' | 'pcs';
}) {
  // Diurutkan berdasarkan nilai yang ditampilkan (bukan %), tertinggi dulu.
  const rows = [...data].sort((a, b) => (b.actual ?? 0) - (a.actual ?? 0));
  const fmt = unit === 'pcs' ? pcs : rp;

  return (
    <div className="h-full flex flex-col min-w-0">
      <div className="text-[11px] font-extrabold mb-1.5 shrink-0" style={{ color }}>
        {title}
      </div>
      <div className="flex-1 min-h-0">
        <RollingList
          rows={rows}
          rowHeight={30}
          keyOf={(r) => r.nik}
          renderRow={(r, i) => (
            <div className="grid grid-cols-[1.4rem_1fr_auto] gap-2 items-center w-full text-sm">
              <span className="text-mut">{i + 1}</span>
              <span className="truncate" title={r.nama}>
                {r.nama}
              </span>
              <span className="font-bold whitespace-nowrap">{fmt(r.actual)}</span>
            </div>
          )}
        />
      </div>
    </div>
  );
}

export function Derivatif({ furnipro, comser }: { furnipro: KpiRank[]; comser: KpiRank[] }) {
  return (
    <div className="card h-full flex flex-col">
      <div className="h shrink-0">Derivatif (MTD)</div>
      {/* Comser diberi porsi lebar lebih besar — nama & nilai Rupiah butuh
          ruang lebih supaya tidak membungkus jadi 2 baris (memakan tinggi). */}
      <div className="grid grid-cols-[0.8fr_1.2fr] gap-4 flex-1 min-h-0">
        <SubTable title="FURNIPRO" color="#2563eb" data={furnipro} unit="pcs" />
        <SubTable title="COMSER" color="#f59e0b" data={comser} unit="rp" />
      </div>
    </div>
  );
}
