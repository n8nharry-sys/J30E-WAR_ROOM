import { KpiRank } from '@/lib/types';
import { rp, pct, gapClass, achvClass } from '@/lib/format';
import { RotatingTable } from './RotatingTable';

const PILL = { g: 'bg-green-100 text-green-800', o: 'bg-amber-100 text-amber-800', r: 'bg-red-100 text-red-800' };

export function SalesBySmt({ data }: { data: KpiRank[] }) {
  const rows = [...data].sort((a, b) => (b.achv ?? 0) - (a.achv ?? 0));

  return (
    <div className="card">
      <div className="h">Sales by SMT (MTD)</div>
      <RotatingTable
        rows={rows}
        keyOf={(r) => r.nik}
        renderHeader={() => (
          <tr className="text-mut text-[10px] uppercase font-bold">
            <th className="text-left py-1 w-6">#</th>
            <th className="text-left py-1">SMT</th>
            <th className="text-right py-1">Sales MTD</th>
            <th className="text-right py-1">%</th>
            <th className="text-right py-1">Gap</th>
          </tr>
        )}
        renderRow={(r, i) => (
          <>
            <td className="py-1.5">{i + 1}</td>
            <td className="py-1.5">{r.nama}</td>
            <td className="text-right py-1.5">{rp(r.actual)}</td>
            <td className="text-right py-1.5">
              <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${PILL[achvClass(r.achv)]}`}>
                {pct(r.achv)}
              </span>
            </td>
            <td className={`text-right py-1.5 font-bold ${gapClass(r.gap)}`}>{rp(r.gap)}</td>
          </>
        )}
      />
    </div>
  );
}
