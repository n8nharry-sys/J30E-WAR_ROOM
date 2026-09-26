'use client';

import { Header } from '@/components/Header';
import { TargetGauge } from '@/components/TargetGauge';
import { TopSeller } from '@/components/TopSeller';
import { ChampionSpotlight } from '@/components/ChampionSpotlight';
import { KpiMatrix } from '@/components/KpiMatrix';
import { AchievementDept } from '@/components/AchievementDept';
import { SalesBySmt } from '@/components/SalesBySmt';
import { Derivatif } from '@/components/Derivatif';
import { RunningText } from '@/components/RunningText';
import { BreakingNewsOverlay } from '@/components/BreakingNewsOverlay';
import { AudioUnlockButton } from '@/components/AudioUnlockButton';
import { useDashboardData } from '@/lib/useDashboardData';

/**
 * Layout satu layar penuh (TV, tanpa scroll): main dibatasi tepat 100dvh,
 * flex-column. Header/KPI Matrix/Running Text tingginya mengikuti konten
 * (shrink-0), dua baris section membagi SISA ruang lewat flex-[...] — jadi
 * proporsinya tetap terjaga di berbagai resolusi TV/monitor tanpa perlu
 * scroll maupun elemen terpotong.
 */
export default function DashboardPage() {
  const d = useDashboardData();

  return (
    <main className="h-[100dvh] max-w-[1600px] mx-auto p-3 flex flex-col gap-2.5 overflow-hidden">
      <div className="shrink-0">
        <Header />
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr_1.2fr] auto-rows-fr gap-2.5 flex-[1.05] min-h-0">
        <TargetGauge data={d.target} />
        <TopSeller data={d.topSeller} />
        <ChampionSpotlight data={d.champion} />
      </section>

      <div className="shrink-0">
        <KpiMatrix data={d.store} />
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr_1.4fr] auto-rows-fr gap-2.5 flex-[1.3] min-h-0">
        <AchievementDept data={d.dept} />
        <SalesBySmt data={d.salesMtd} />
        <Derivatif furnipro={d.furnipro} comser={d.comser} />
      </section>

      <div className="shrink-0">
        <RunningText data={d.runningText} />
      </div>

      <BreakingNewsOverlay />
      <AudioUnlockButton />
    </main>
  );
}
