'use client';

import { useEffect, useState } from 'react';
import { usePrayer } from '@/contexts/PrayerContext';
import { playAdzan, getAdzanElement } from '@/lib/audio/cheer';
import { getRandomHadith, type HadithData } from '@/lib/hadith';

export function PrayerOverlay() {
  const { overlayName, setOverlayName } = usePrayer();
  const [hadith, setHadith] = useState<HadithData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!overlayName) return;
    const audio = getAdzanElement();
    const handleEnded = () => setOverlayName(null);
    audio.addEventListener('ended', handleEnded);
    playAdzan();

    // Fallback: auto-close after 4 min if 'ended' never fires (play failed, etc.)
    const fallbackTimer = setTimeout(() => setOverlayName(null), 4 * 60 * 1000);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      clearTimeout(fallbackTimer);
    };
  }, [overlayName, setOverlayName]);

  useEffect(() => {
    if (overlayName && !hadith) {
      setLoading(true);
      getRandomHadith()
        .then(setHadith)
        .finally(() => setLoading(false));
    }
  }, [overlayName, hadith]);

  if (!overlayName) return null;

  const currentTime = new Date().toLocaleTimeString('id-ID', {
    hour12: false,
    timeZone: 'Asia/Jakarta'
  });

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 p-8 shadow-2xl">
        <button
          onClick={() => setOverlayName(null)}
          className="absolute top-4 right-4 text-2xl opacity-50 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg p-1"
          aria-label="Tutup"
        >
          ×
        </button>
        <div className="text-center space-y-4">
          <div className="text-6xl">🕌</div>
          <h2 className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
            {overlayName}
          </h2>
          <p className="text-lg text-emerald-700 dark:text-emerald-300">
            Waktu sholat telah tiba
          </p>
          <div className="text-2xl font-mono text-emerald-800 dark:text-emerald-200">
            {currentTime}
          </div>

          <div className="mt-6 pt-6 border-t border-emerald-200 dark:border-emerald-800">
            {loading ? (
              <p className="text-sm text-emerald-600 dark:text-emerald-400 animate-pulse">
                Memuat hadits...
              </p>
            ) : hadith ? (
              <>
                <p className="text-base text-emerald-900 dark:text-emerald-100 mb-3 leading-relaxed">
                  "{hadith.text}"
                </p>
                <div className="space-y-1">
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                    — {hadith.source}
                  </p>
                  {hadith.grade && (
                    <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-xs text-emerald-800 dark:text-emerald-200">
                      {hadith.grade}
                    </span>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}