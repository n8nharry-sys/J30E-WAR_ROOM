'use client';

import { useEffect, useState } from 'react';
import { getTimes } from '@/lib/prayerTimes';
import { usePrayer } from '@/contexts/PrayerContext';

export function PrayerCountdown() {
  const { overlayName, setOverlayName } = usePrayer();
  const [nextPrayer, setNextPrayer] = useState<{
    name: string;
    time: Date;
    remaining: number;
  } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let interval: NodeJS.Timeout;

    async function init() {
      try {
        const { name, time } = await getTimes();
        if (cancelled) return;

        const update = () => {
          const now = new Date();
          const remaining = Math.max(0, Math.floor((time.getTime() - now.getTime()) / 1000));
          setNextPrayer({ name, time, remaining });

          if (remaining === 0 && !cancelled) {
            setOverlayName(name);
            if (interval) clearInterval(interval);
            setNextPrayer(null);
          }
        };

        update();
        interval = setInterval(update, 1000);
      } catch (err) {
        if (!cancelled) setError(true);
      }
    }

    // Start or restart countdown only when overlay is closed
    if (!overlayName) {
      init();
    }

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [overlayName, setOverlayName]);

  if (error || !nextPrayer) return null;

  const hrs = Math.floor(nextPrayer.remaining / 3600);
  const mins = Math.floor((nextPrayer.remaining % 3600) / 60);
  const secs = nextPrayer.remaining % 60;

  return (
    <div className="flex items-center gap-2">
      <span className="text-base font-semibold whitespace-nowrap">Sholat {nextPrayer.name}</span>
      <span className="tabular-nums text-xl font-bold text-red-600 dark:text-red-500 whitespace-nowrap">-{String(hrs).padStart(2, '0')}:{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
    </div>
  );
}