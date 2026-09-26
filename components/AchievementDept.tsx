import { DeptToday } from '@/lib/types';
import { rp, pct, gapClass, achvClass } from '@/lib/format';
import { RollingList } from './RollingList';

const PILL = { g: 'bg-green-100 text-green-800', o: 'bg-amber-100 text-amber-800', r: 'bg-red-100 text-red-800' };
const COLS = 'grid-cols-[minmax(0,1fr)_7rem_4.5rem_7rem]';

export function AchievementDept({ data }: { data: DeptToday[] }) {
  // AJ / AL (kode non-departemen, target 0) dilewati supaya tidak
  // menampilkan "0% achievement" yang membingungkan di TV.
  const rows = data
    .filter((d) => d.monthly_target > 0)
    .sort((a, b) => (b.achv_today ?? 0) - (a.achv_today ?? 0));

  return (
    <div className="card h-full min-h-0 flex flex-col">
      <div className="h shrink-0">Achievement Dept Today</div>
      <div className={`grid ${COLS} gap-2 text-[10px] uppercase font-bold text-mut px-0.5 pb-1 shrink-0`}>
        <span>Departemen</span>
        <span className="text-right">Sales</span>
        <span className="text-right">Achv</span>
        <span className="text-right">Gap</span>
      </div>
      <div className="flex-1 min-h-0">
        <RollingList
          rows={rows}
          keyOf={(r) => r.kode_dept}
          renderRow={(d) => (
            <div className={`grid ${COLS} gap-2 items-center w-full text-sm`}>
              <span className="truncate">{d.nama_dept}</span>
              <span className="text-right font-semibold">{rp(d.sales_today)}</span>
              <span className="text-right">
                <span className={`px-1.5 py-0.5 rounded-full font-bold text-[10px] ${PILL[achvClass(d.achv_today)]}`}>
                  {pct(d.achv_today)}
                </span>
              </span>
              <span className={`text-right font-bold text-xs ${gapClass(d.gap)}`}>{rp(d.gap)}</span>
            </div>
          )}
        />
      </div>
    </div>
  );
}
