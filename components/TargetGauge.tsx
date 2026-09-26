import { TargetSummary } from '@/lib/types';
import { rp, pct, gapClass } from '@/lib/format';

export function TargetGauge({ data }: { data: TargetSummary | null }) {
  const achv = data?.achv ?? 0;
  const deg = Math.min(100, Math.max(0, achv * 100));
  // Skala bar dibuat 130% dari target supaya bar tidak selalu "penuh" saat
  // pencapaian mendekati/melewati 100% — memberi ruang visual di sisa bar.
  const barPct = Math.min(100, ((data?.sales ?? 0) / ((data?.target ?? 1) * 1.3)) * 100);

  return (
    <div className="card h-full flex flex-col overflow-hidden">
      <div className="h shrink-0">Target Hari Ini</div>

      <div className="flex-1 flex flex-col justify-center gap-3 min-w-0">
        <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
          <div>
            <div className="space-y-4">
              <div>
                <div className="lbl">Target</div>
                <div className="text-2xl font-black truncate max-w-xs">{rp(data?.target)}</div>
              </div>
              <div>
                <div className="lbl">Sales Hari Ini</div>
                <div className="text-2xl font-black text-good truncate max-w-xs">{rp(data?.sales)}</div>
              </div>
            </div>
            <div className="lbl mt-3">
              Gap: <b className={`text-sm ${gapClass(data?.gap)}`}>{rp(data?.gap)}</b>
            </div>
          </div>
          <div
            className="w-[130px] h-[130px] rounded-full grid place-items-center shrink-0"
            style={{ background: `conic-gradient(#0f9d58 0 ${deg}%, #e3e9f2 0)` }}
          >
            <div className="w-[98px] h-[98px] rounded-full bg-white grid place-items-center">
              <span className="text-2xl font-black text-center">
                {pct(achv, 1)}
                <small className="block text-[9px] text-mut font-semibold tracking-wide">ACHIEVEMENT</small>
              </span>
            </div>
          </div>
        </div>

        <div>
          <div className="h-3 rounded-full bg-line overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-good to-emerald-400 transition-all"
              style={{ width: `${barPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-mut mt-1 font-semibold">
            <span>Rp 0</span>
            <span>Target: {rp(data?.target)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
