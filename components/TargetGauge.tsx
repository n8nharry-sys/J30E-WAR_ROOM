import { TargetSummary } from '@/lib/types';
import { rp, pct, gapClass } from '@/lib/format';

export function TargetGauge({ data }: { data: TargetSummary | null }) {
  const achv = data?.achv ?? 0;
  const deg = Math.min(100, Math.max(0, achv * 100));
  // Skala bar dibuat 130% dari target supaya bar tidak selalu "penuh" saat
  // pencapaian mendekati/melewati 100% — memberi ruang visual di sisa bar.
  const barPct = Math.min(100, ((data?.sales ?? 0) / ((data?.target ?? 1) * 1.3)) * 100);

  return (
    <div className="card h-full min-h-0 flex flex-col">
      <div className="h shrink-0">Target Hari Ini</div>

      <div className="flex-1 min-h-0 flex flex-col justify-center gap-3">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 items-center">
          {/* Target & Sales ditumpuk vertikal (bukan berdampingan) supaya
              nilai Rupiah yang panjang punya ruang penuh, tidak berdesakan
              dengan gauge lingkaran di sisi kanan. */}
          <div className="min-w-0">
            <div>
              <div className="lbl">Target</div>
              <div className="text-xl font-black truncate">{rp(data?.target)}</div>
            </div>
            <div className="mt-2">
              <div className="lbl">Sales Hari Ini</div>
              <div className="text-xl font-black text-good truncate">{rp(data?.sales)}</div>
            </div>
            <div className="lbl mt-2">
              Gap: <b className={`text-sm ${gapClass(data?.gap)}`}>{rp(data?.gap)}</b>
            </div>
          </div>
          <div
            className="w-[110px] h-[110px] rounded-full grid place-items-center shrink-0"
            style={{ background: `conic-gradient(#0f9d58 0 ${deg}%, #e3e9f2 0)` }}
          >
            <div className="w-[82px] h-[82px] rounded-full bg-white grid place-items-center">
              <span className="text-xl font-black text-center">
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
            <span className="truncate ml-2">Target: {rp(data?.target)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
