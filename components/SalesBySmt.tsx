import { KpiRank } from '@/lib/types';
import { rp, pct, gapClass, achvClass } from '@/lib/format';
import { RollingList } from './RollingList';

const PILL = { g: 'bg-green-100 text-green-800', o: 'bg-amber-100 text-amber-800', r: 'bg-red-100 text-red-800' };
const COLS = 'grid-cols-[1.6rem_minmax(0,1fr)_7rem_4.5rem_7rem]';

export function SalesBySmt({ data }: { data: KpiRank[] }) {
  const rows = [...data].sort((a, b) => (b.achv ?? 0) - (a.achv ?? 0));

  return (
    <div className="card h-full min-h-0 flex flex-col">
      <div className="h shrink-0">Sales by SMT (MTD)</div>
      <div className={`grid ${COLS} gap-2 text-[10px] uppercase font-bold text-mut px-0.5 pb-1 shrink-0`}>
        <span>#</span>
        <span>SMT</span>
        <span className="text-right">Sales MTD</span>
        <span className="text-right">%</span>
        <span className="text-right">Gap</span>
      </div>
      <div className="flex-1 min-h-0">
        <RollingList
          rows={rows}
          keyOf={(r) => r.nik}
          renderRow={(r, i) => (
            <div className={`grid ${COLS} gap-2 items-center w-full text-sm`}>
              <span className="text-mut">{i + 1}</span>
              <span className="truncate">{r.nama}</span>
              <span className="text-right font-semibold">{rp(r.actual)}</span>
              <span className="text-right">
                <span className={`px-1.5 py-0.5 rounded-full font-bold text-[10px] ${PILL[achvClass(r.achv)]}`}>
                  {pct(r.achv)}
                </span>
              </span>
              <span className={`text-right font-bold text-xs ${gapClass(r.gap)}`}>{rp(r.gap)}</span>
            </div>
          )}
        />
      </div>
    </div>
  );
}
