import { TargetSummary } from '@/lib/types';
import { rp, pct, gapClass } from '@/lib/format';

export function TargetGauge({ data }: { data: TargetSummary | null }) {
  const achv = data?.achv ?? 0;
  const deg = Math.min(100, Math.max(0, achv * 100));

  return (
    <div className="card">
      <div className="h">Target Hari Ini</div>
      <div className="grid grid-cols-[1fr_auto] gap-3 items-center">
        <div>
          <div className="lbl">Target</div>
          <div className="text-2xl font-black">{rp(data?.target)}</div>
          <div className="lbl mt-2">Sales Hari Ini</div>
          <div className="text-2xl font-black text-good">{rp(data?.sales)}</div>
          <div className="lbl mt-1.5">
            Gap: <b className={gapClass(data?.gap)}>{rp(data?.gap)}</b>
          </div>
        </div>
        <div
          className="w-[110px] h-[110px] rounded-full grid place-items-center"
          style={{ background: `conic-gradient(#0f9d58 0 ${deg}%, #e3e9f2 0)` }}
        >
          <div className="w-[82px] h-[82px] rounded-full bg-white grid place-items-center">
            <span className="text-xl font-black text-center">
              {pct(achv, 1)}
              <small className="block text-[9px] text-mut font-semibold">ACHIEVEMENT</small>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
