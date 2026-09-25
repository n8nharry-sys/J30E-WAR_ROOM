'use client';

import { useEffect, useState } from 'react';
import { unlockAudio, isAudioUnlocked } from '@/lib/audio/cheer';

/**
 * Browser memblokir suara autoplay sampai ada klik pengguna di halaman.
 * Tombol ini muncul sekali saat TV dinyalakan (atau tab dibuka ulang) —
 * setelah diklik sekali, breaking news berikutnya di sesi itu langsung
 * berbunyi tanpa perlu klik lagi.
 */
export function AudioUnlockButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(!isAudioUnlocked());
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
