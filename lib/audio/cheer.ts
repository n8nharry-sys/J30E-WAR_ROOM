'use client';

/**
 * Efek suara Breaking News, memakai file MP3 tepuk tangan (public/sfx/applause.mp3).
 *
 * Browser memblokir audio dengan suara sebelum ada interaksi pengguna di
 * halaman (autoplay policy). Karena itu playCheer() hanya berbunyi setelah
 * unlockAudio() dipanggil minimal sekali — lihat komponen AudioUnlockButton.
 */

let audioEl: HTMLAudioElement | null = null;
let unlocked = false;

function getAudio(): HTMLAudioElement {
  if (!audioEl) {
    audioEl = new Audio('/sfx/applause.mp3');
    audioEl.preload = 'auto';
  }
  return audioEl;
}

export function unlockAudio() {
  const a = getAudio();
  // Putar nyaris tanpa suara sekali untuk membuka izin autoplay browser,
  // lalu hentikan dan kembalikan ke volume normal untuk pemakaian berikutnya.
  a.volume = 0.001;
  a.play()
    .then(() => {
      a.pause();
      a.currentTime = 0;
      a.volume = 0.85;
    })
    .catch(() => {
      /* diabaikan — kalau gagal, playCheer() nanti akan mencoba lagi */
    });
  unlocked = true;
  try {
    sessionStorage.setItem('j30e_audio_unlocked', '1');
  } catch {
    /* sessionStorage bisa gagal di mode privat — abaikan */
  }
}

export function isAudioUnlocked(): boolean {
  if (unlocked) return true;
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem('j30e_audio_unlocked') === '1';
  } catch {
    return false;
  }
}

/** Dipanggil setiap Breaking News baru muncul. Diam saja kalau audio belum di-unlock. */
export function playCheer() {
  if (!isAudioUnlocked()) return;
  const a = getAudio();
  a.currentTime = 0;
  a.volume = 0.85;
  a.play().catch(() => {
    /* browser mungkin masih menahan — tidak fatal, banner tetap tampil */
  });
}
