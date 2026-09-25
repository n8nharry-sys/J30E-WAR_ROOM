import { DeptToday } from '@/lib/types';
import { rp, pct, gapClass, achvClass } from '@/lib/format';
import { RotatingTable } from './RotatingTable';

const PILL = { g: 'bg-green-100 text-green-800', o: 'bg-amber-100 text-amber-800', r: 'bg-red-100 text-red-800' };

export function AchievementDept({ data }: { data: DeptToday[] }) {
  // AJ / AL (kode non-departemen, target 0) dilewati supaya tidak
  // menampilkan "0% achievement" yang membingungkan di TV.
  const rows = data
    .filter((d) => d.monthly_target > 0)
    .sort((a, b) => (b.achv_today ?? 0) - (a.achv_today ?? 0));

  return (
    <div className="card">
      <div className="h">Achievement Dept Today</div>
      <RotatingTable
        rows={rows}
        keyOf={(r) => r.kode_dept}
        renderHeader={() => (
          <tr className="text-mut text-[10px] uppercase font-bold">
            <th className="text-left py-1">Departemen</th>
            <th className="text-right py-1">Sales</th>
            <th className="text-right py-1">Achv</th>
            <th className="text-right py-1">Gap</th>
          </tr>
        )}
        renderRow={(d) => (
          <>
            <td className="py-1.5">{d.nama_dept}</td>
            <td className="text-right py-1.5">{rp(d.sales_today)}</td>
            <td className="text-right py-1.5">
              <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${PILL[achvClass(d.achv_today)]}`}>
                {pct(d.achv_today)}
              </span>
            </td>
            <td className={`text-right py-1.5 font-bold ${gapClass(d.gap)}`}>{rp(d.gap)}</td>
          </>
        )}
      />
    </div>
  );
}
