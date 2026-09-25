'use client';

/**
 * Efek suara tepuk tangan + sorak-sorai untuk Breaking News, dibuat murni
 * lewat Web Audio API — tidak ada file audio yang perlu diupload atau
 * di-hosting.
 *
 * Browser memblokir audio dengan suara sebelum ada interaksi pengguna di
 * halaman (autoplay policy). Karena itu playCheer() hanya berbunyi setelah
 * unlockAudio() dipanggil minimal sekali — lihat komponen AudioUnlockButton.
 */

let ctx: AudioContext | null = null;
let unlocked = false;

function getCtx(): AudioContext {
  if (!ctx) {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    ctx = new Ctor();
  }
  return ctx;
}

export function unlockAudio() {
  const c = getCtx();
  if (c.state === 'suspended') c.resume();
  unlocked = true;
  try {
    sessionStorage.setItem('j30e_audio_unlocked', '1');
  } catch {
    /* sessionStorage bisa gagal di mode privat — abaikan, tombol akan muncul lagi */
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

function noiseBuffer(c: AudioContext, seconds: number): AudioBuffer {
  const buffer = c.createBuffer(1, Math.ceil(c.sampleRate * seconds), c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

/** Satu "tepukan": noise pendek disaring band-pass supaya terdengar seperti clap, bukan white noise polos. */
function clap(c: AudioContext, time: number, volume: number) {
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, 0.08);

  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1500 + Math.random() * 1000;
  filter.Q.value = 1.1;

  const gain = c.createGain();
  gain.gain.setValueAtTime(volume, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);

  src.connect(filter).connect(gain).connect(c.destination);
  src.start(time);
  src.stop(time + 0.1);
}

/** Beberapa oscillator naik pitch bersamaan untuk kesan "sorak-sorai" di belakang tepuk tangan. */
function cheer(c: AudioContext, time: number, duration: number) {
  for (let i = 0; i < 6; i++) {
    const osc = c.createOscillator();
    osc.type = 'sawtooth';
    const base = 200 + Math.random() * 220;
    osc.frequency.setValueAtTime(base, time);
    osc.frequency.exponentialRampToValueAtTime(base * (1.4 + Math.random() * 0.6), time + duration);

    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2200;

    const gain = c.createGain();
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.035, time + 0.15);
    gain.gain.linearRampToValueAtTime(0, time + duration);

    osc.connect(filter).connect(gain).connect(c.destination);
    osc.start(time + Math.random() * 0.08);
    osc.stop(time + duration + 0.05);
  }
}

/** Dipanggil setiap Breaking News baru muncul. Diam saja kalau audio belum di-unlock. */
export function playCheer() {
  if (!isAudioUnlocked()) return;
  const c = getCtx();
  if (c.state === 'suspended') c.resume();
  const now = c.currentTime;

  const clapCount = 18;
  for (let i = 0; i < clapCount; i++) {
    // Tepukan makin rapat di awal, mereda menjelang akhir — pola tepuk tangan alami.
    const t = now + Math.pow(i / clapCount, 1.3) * 1.4 + Math.random() * 0.02;
    clap(c, t, 0.25 + Math.random() * 0.3);
  }
  cheer(c, now + 0.1, 1.8);
}
