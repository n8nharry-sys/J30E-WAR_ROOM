import { RunningTextRow } from '@/lib/types';

export function RunningText({ data }: { data: RunningTextRow[] }) {
  const joined = data.map((d) => d.teks).join('   •   ') + (data.length ? '   •   ' : '');

  return (
    <div className="bg-navy text-white rounded-2xl flex items-center overflow-hidden">
      <b className="bg-bad px-4 py-3 text-[11px] tracking-widest whitespace-nowrap flex-none">INFO TERKINI</b>
      <div className="flex-1 min-w-0 overflow-hidden whitespace-nowrap">
        <span className="inline-block pl-[100%] animate-[ticker_40s_linear_infinite] font-semibold text-base">
          {joined || 'Belum ada info terkini'}
        </span>
      </div>
    </div>
  );
}
