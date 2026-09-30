'use client';

import { useEffect, useState } from 'react';
import { unlockAudio, isAudioUnlocked } from '@/lib/audio/cheer';

/**
 * Browser memblokir suara autoplay sampai ada klik pengguna di halaman.
 * Tombol ini muncul sekali saat TV dinyalakan (atau tab dibuka ulang) —
 * setelah diklik sekali, breaking news berikutnya di sesi itu langsung
 * berbunyi tanpa perlu klik lagi.
 *
 * Auto-unlock pada interaksi pertama (click/tap/key) di halaman.
 * Unlock state disimpan di localStorage, persist setelah reload.
 */
export function AudioUnlockButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const unlocked = isAudioUnlocked();
    setShow(!unlocked);

    // Auto-unlock pada interaksi pertama di halaman (click/tap/key)
    if (!unlocked) {
      const handler = () => {
        unlockAudio();
        setShow(false);
        window.removeEventListener('click', handler);
        window.removeEventListener('keydown', handler);
        window.removeEventListener('touchstart', handler);
      };
      window.addEventListener('click', handler, { once: true });
      window.addEventListener('keydown', handler, { once: true });
      window.addEventListener('touchstart', handler, { once: true });
      return () => {
        window.removeEventListener('click', handler);
        window.removeEventListener('keydown', handler);
        window.removeEventListener('touchstart', handler);
      };
    }
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => {
        unlockAudio();
        setShow(false);
      }}
      className="fixed bottom-4 right-4 z-40 bg-navy text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-lg"
    >
      🔊 Aktifkan Suara
    </button>
  );
}
