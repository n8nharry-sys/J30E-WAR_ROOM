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

export default function DashboardPage() {
  const d = useDashboardData();

  return (
    <main className="max-w-[1500px] mx-auto p-3.5 grid gap-3">
      <Header />

      <section className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr_1.2fr] gap-3">
        <TargetGauge data={d.target} />
        <TopSeller data={d.topSeller} />
        <ChampionSpotlight data={d.champion} />
      </section>

      <KpiMatrix data={d.store} />

      <section className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr_1.25fr] gap-3">
        <AchievementDept data={d.dept} />
        <SalesBySmt data={d.salesMtd} />
        <Derivatif furnipro={d.furnipro} comser={d.comser} />
      </section>

      <RunningText data={d.runningText} />
      <BreakingNewsOverlay />
      <AudioUnlockButton />
    </main>
  );
}
