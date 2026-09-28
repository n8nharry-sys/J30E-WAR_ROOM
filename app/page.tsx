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
 *
 * Padding & gap dipadatkan (p-3->p-2, gap-2.5->gap-2) supaya di layar
 * 1360x768 — yang tingginya jauh lebih pendek dari TV pada umumnya — sisa
 * ruang vertikal untuk kedua section utama tetap cukup lega.
 */
export default function DashboardPage() {
  const d = useDashboardData();
  const [dataConfirmedDate, setDataConfirmedDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data confirmation status on component mount
  useEffect(() => {
    async function fetchDataConfirmationStatus() {
      try {
        const res = await fetch('/api/admin/settings');
        if (!res.ok) throw new Error('Gagal mengambil status konfirmasi data');
        const data = await res.json();
        setDataConfirmedDate(data.data_confirmed_date ?? null);
      } catch (error) {
        console.error('Error fetching data confirmation status:', error);
        // If we can't fetch the status, we'll err on the side of caution and show waiting state
        setDataConfirmedDate(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDataConfirmationStatus();
  }, []);

  // If still loading, show loading state
  if (isLoading) {
    return (
      <main className="h-[100dvh] max-w-[1600px] mx-auto p-2 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full border-4 border-navy border-t-white h-12 w-12 mb-4"></div>
          <p className="text-sm text-mut">Memuat status konfirmasi data...</p>
        </div>
      </main>
    );
  }

  // Get today's date in WIB (UTC+7)
  const todayWib = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const todayString = todayWib.toISOString().split('T')[0]; // YYYY-MM-DD format

  // If data is not confirmed for today, show waiting message
  if (dataConfirmedDate !== todayString) {
    return (
      <main className="h-[100dvh] max-w-[1600px] mx-auto p-2 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="bg-nbg/10 border-2 border-nbg/20 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="h-8 w-8 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
            </div>
            <p className="text-base font-medium text-nbg mb-2">
              ⏳ Menunggu update data pagi ini...
            </p>
            <p className="text-sm text-mut">
              Data hari ini belum dikonfirmasi sebagai siap. Silakan konfirmasi
              lewat halaman admin setelah update data pagi selesai.
            </p>
            {dataConfirmedDate && (
              <p className="mt-2 text-xs text-mut">
                Konfirmasi terakhir: {dataConfirmedDate}
              </p>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={() => window.location.href = '/admin'}
              className="bg-navy text-white px-4 py-2 rounded-lg text-sm hover:bg-navy/80 transition-colors"
            >
              Buka Halaman Admin
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Data is confirmed, show normal dashboard
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
