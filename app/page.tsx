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
      <main className="h-[100dvh] max-w-[1600px] mx-auto p-2 flex flex-col gap-2 overflow-hidden">
        <div className="shrink-0">
          <Header />
        </div>

        {/* Champion Spotlight butuh lebih banyak ruang horizontal supaya sub-box
            Sales/Furnipro/Comser tidak terpotong di layar 1360x768, jadi
            porsinya dinaikkan (1.2fr -> 1.4fr); TargetGauge & TopSeller sedikit
            dikurangi (1fr->0.9fr, 1.5fr->1.4fr) untuk mengimbangi. */}
        <section className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.4fr_1.4fr] auto-rows-fr gap-2 flex-[1.05] min-h-0">
          <TargetGauge data={d.target} />
          <TopSeller data={d.topSeller} />
          <ChampionSpotlight data={d.champion} />
        </section>

        <div className="shrink-0">
          <KpiMatrix data={d.store} />
        </div>

        {/* Kolom nama departemen di Achievement Dept dipersempit (22ch -> 12ch),
            jadi box-nya diperkecil dari 1.15fr -> 0.95fr; selisihnya (0.2fr)
            dipindahkan ke Derivatif (1fr -> 1.2fr) supaya kolom jumlah
            penjualan Furnipro & Comser tidak lagi terpotong. SalesBySmt tetap. */}
        <section className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr_1.2fr] auto-rows-fr gap-2 flex-[1.3] min-h-0">
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