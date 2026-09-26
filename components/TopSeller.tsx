import { TopSeller as TopSellerRow } from '@/lib/types';
import { rp, gapClass } from '@/lib/format';
import { StaffAvatar } from './StaffAvatar';

export function TopSeller({ data }: { data: TopSellerRow[] }) {
  const rows = data.slice(0, 5);

  return (
    <div className="card h-full flex flex-col overflow-hidden">
      <div className="h shrink-0">Live Top Seller Today</div>
      <div className="grid grid-cols-[1.6rem_2.2rem_1fr_6rem_5.5rem] gap-2.5 text-[10px] uppercase font-bold text-mut px-0.5 pb-1 shrink-0">
        <span />
        <span />
        <span>SMT</span>
        <span className="text-right">Sales Hari Ini</span>
        <span className="text-right">Gap</span>
      </div>
      {rows.length === 0 && <p className="text-mut text-center py-6 flex-1">Belum ada transaksi hari ini</p>}
      <div className="flex-1 flex flex-col justify-around min-w-0">
        {rows.map((r) => (
          <div
            key={r.nik}
            className="grid grid-cols-[1.6rem_2.2rem_1fr_6rem_5.5rem] gap-2.5 items-center py-1 border-t border-line first:border-0"
          >
            <div
              className={`w-6.5 h-6.5 rounded-lg text-white grid place-items-center font-extrabold text-xs ${
                r.no <= 3 ? 'bg-warn' : 'bg-navy'
              }`}
            >
              {r.no}
            </div>
            <StaffAvatar nik={r.nik} name={r.nama} size={38} />
            <b className="text-sm truncate">{r.nama}</b>
            <b className="text-sm text-right truncate max-w-xs">{rp(r.sales_today)}</b>
            <div className={`text-xs font-extrabold text-right ${gapClass(r.gap)} truncate max-w-xs`}>{rp(r.gap)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
