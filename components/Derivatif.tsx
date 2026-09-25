import { KpiRank } from '@/lib/types';
import { rp } from '@/lib/format';
import { RotatingTable } from './RotatingTable';

function SubTable({ title, color, data }: { title: string; color: string; data: KpiRank[] }) {
  const rows = [...data].sort((a, b) => (b.achv ?? 0) - (a.achv ?? 0));
  return (
    <div>
      <div className="text-[11px] font-extrabold mb-1" style={{ color }}>
        {title}
      </div>
      <RotatingTable
        rows={rows}
        rowsPerPage={6}
        keyOf={(r) => r.nik}
        renderHeader={() => <tr />}
        renderRow={(r, i) => (
          <>
            <td className="py-1 w-5">{i + 1}</td>
            <td className="py-1">{r.nama}</td>
            <td className="text-right py-1 font-bold">{rp(r.actual)}</td>
          </>
        )}
      />
    </div>
  );
}

export function Derivatif({ furnipro, comser }: { furnipro: KpiRank[]; comser: KpiRank[] }) {
  return (
    <div className="card">
      <div className="h">Derivatif (MTD)</div>
      <div className="grid grid-cols-2 gap-4">
        <SubTable title="FURNIPRO" color="#2563eb" data={furnipro} />
        <SubTable title="COMSER" color="#f59e0b" data={comser} />
      </div>
    </div>
  );
}
