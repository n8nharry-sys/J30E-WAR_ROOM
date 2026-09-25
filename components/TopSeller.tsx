import { TopSeller as TopSellerRow } from '@/lib/types';
import { rp, gapClass } from '@/lib/format';
import { StaffAvatar } from './StaffAvatar';

export function TopSeller({ data }: { data: TopSellerRow[] }) {
  return (
    <div className="card">
      <div className="h">Live Top Seller Today</div>
      {data.length === 0 && <p className="text-mut text-center py-6">Belum ada transaksi hari ini</p>}
      {data.slice(0, 5).map((r) => (
        <div key={r.nik} className="grid grid-cols-[28px_38px_1fr_auto_auto] gap-2.5 items-center py-1.5 border-t border-line first:border-0">
          <div className={`w-6.5 h-6.5 rounded-lg text-white grid place-items-center font-extrabold text-xs ${r.no <= 3 ? 'bg-warn' : 'bg-navy'}`}>
            {r.no}
          </div>
          <StaffAvatar nik={r.nik} name={r.nama} size={36} />
          <b className="text-sm">{r.nama}</b>
          <b className="text-sm">{rp(r.sales_today)}</b>
          <div className={`text-xs font-extrabold text-right ${gapClass(r.gap)}`}>{rp(r.gap)}</div>
        </div>
      ))}
    </div>
  );
}
