# Prayer Countdown & Adzan Overlay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Islamic prayer time countdown near clock, trigger adzan overlay with sound when countdown reaches zero.

**Architecture:** React context provides prayer trigger state shared between `PrayerCountdown` (calculates next prayer, counts down) and `PrayerOverlay` (shows modal, plays adzan). `adhan` library computes daily prayer times client-side using static Semarang coordinates. Audio unlock reuses existing `AudioUnlockButton` flow.

**Tech Stack:** React 18, Next.js 16, `adhan` 5.0.0, Tailwind CSS, TypeScript

**Spec:** docs/superpowers/specs/2026-11-06-prayer-countdown-design.md (inferred from conversation)

## Global Constraints

- Static location: Semarang (-6.9932, 110.4213)
- Audio autoplay requires user unlock via existing `AudioUnlockButton`
- Calculation method: Singapore (best for Indonesia per `adhan` docs)
- Adzan audio file: `/sfx/adhan.mp3` (user must provide)
- All times display in WIB timezone (Asia/Jakarta)

## Review Focus

- Countdown shows "00:00" at prayer time but overlay doesn't appear → test `onTrigger` callback fired when `remaining === 0`
- Adzan audio plays when unlock hasn't happened → verify `playAdzan()` checks `isAudioUnlocked()` before play
- Prayer times wrong for Semarang → test `getTimes()` with known date returns expected Fajr/Dhuhr/Asr/Maghrib/Isha times for Semarang
- Overlay doesn't close when audio ends → test `ended` event listener calls `onClose`
- Context initial state null causes crash → verify `PrayerContext` provides default value and components handle null

---

### Task 1: Prayer times calculation library

**Files:**
- Create: `lib/prayerTimes.ts`
- Test: Manual verification (no test file for this task, verified in Task 2)

**Interfaces:**
- Consumes: `adhan` package (Coordinates, CalculationMethod, PrayerTimes)
- Produces: `getTimes(): Promise<{ name: string; time: Date }>` - returns next upcoming prayer name and time

- [ ] **Step 1: Write `lib/prayerTimes.ts` with Semarang coordinates**

```typescript
'use client';

import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';

const SEMARANG_LAT = -6.9932;
const SEMARANG_LNG = 110.4213;

function getNextPrayer(times: PrayerTimes): { name: string; time: Date } {
  const now = new Date();
  const prayers = [
    { name: 'Subuh', time: times.fajr },
    { name: 'Dzuhur', time: times.dhuhr },
    { name: 'Ashar', time: times.asr },
    { name: 'Maghrib', time: times.maghrib },
    { name: "Isya'", time: times.isha },
  ];

  for (const prayer of prayers) {
    if (prayer.time > now) {
      return prayer;
    }
  }

  // All prayers passed, return Fajr tomorrow
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const coords = new Coordinates(SEMARANG_LAT, SEMARANG_LNG);
  const params = CalculationMethod.Singapore();
  const tomorrowTimes = new PrayerTimes(coords, tomorrow, params);
  return { name: 'Subuh (Besok)', time: tomorrowTimes.fajr };
}

export async function getTimes(): Promise<{ name: string; time: Date }> {
  const coords = new Coordinates(SEMARANG_LAT, SEMARANG_LNG);
  const params = CalculationMethod.Singapore();
  const today = new Date();
  const prayerTimes = new PrayerTimes(coords, today, params);
  return getNextPrayer(prayerTimes);
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: No TypeScript errors in `lib/prayerTimes.ts`

- [ ] **Step 3: Commit**

```bash
git add lib/prayerTimes.ts
git commit -m "feat: add prayer times calculation for Semarang"
```

---

### Task 2: Prayer context

**Files:**
- Create: `contexts/PrayerContext.tsx`

**Interfaces:**
- Consumes: React Context API
- Produces: 
  - `PrayerContext: React.Context<{ overlayName: string | null; setOverlayName: (name: string | null) => void }>`
  - `PrayerProvider: React.FC<{ children: React.ReactNode }>` - wrap around app
  - `usePrayer(): { overlayName: string | null; setOverlayName: (name: string | null) => void }` - hook for components

- [ ] **Step 1: Write `contexts/PrayerContext.tsx`**

```typescript
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface PrayerContextValue {
  overlayName: string | null;
  setOverlayName: (name: string | null) => void;
}

const PrayerContext = createContext<PrayerContextValue | null>(null);

export function PrayerProvider({ children }: { children: ReactNode }) {
  const [overlayName, setOverlayName] = useState<string | null>(null);
  return (
    <PrayerContext.Provider value={{ overlayName, setOverlayName }}>
      {children}
    </PrayerContext.Provider>
  );
}

export function usePrayer() {
  const ctx = useContext(PrayerContext);
  if (!ctx) throw new Error('usePrayer must be used within PrayerProvider');
  return ctx;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: No TypeScript errors in `contexts/PrayerContext.tsx`

- [ ] **Step 3: Commit**

```bash
git add contexts/PrayerContext.tsx
git commit -m "feat: add prayer overlay state context"
```

---

### Task 3: Adzan audio playback

**Files:**
- Modify: `lib/audio/cheer.ts`

**Interfaces:**
- Consumes: `isAudioUnlocked(): boolean` (existing)
- Produces: `playAdzan(): void` - plays `/sfx/adzan.mp3` if audio unlocked

- [ ] **Step 1: Write test for playAdzan behavior**

Manual test: After unlock button clicked, `playAdzan()` should play audio; before unlock, it should return silently.

- [ ] **Step 2: Add adzan audio element and playAdzan function to `lib/audio/cheer.ts`**

Add after `playCheer()`:

```typescript
let adzanEl: HTMLAudioElement | null = null;

function getAdzanAudio(): HTMLAudioElement {
  if (!adzanEl) {
    adzanEl = new Audio('/sfx/adzan.mp3');
    adzanEl.preload = 'auto';
  }
  return adzanEl;
}

/** Play adzan sound. Silent if audio not unlocked. */
export function playAdzan() {
  if (!isAudioUnlocked()) return;
  const a = getAdzanAudio();
  a.currentTime = 0;
  a.volume = 0.7;
  a.play().catch(() => {
    /* browser still blocking — non-fatal */
  });
}

/** Get adzan audio element for event listeners (e.g. 'ended'). */
export function getAdzanElement(): HTMLAudioElement {
  return getAdzanAudio();
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npm run build`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add lib/audio/cheer.ts
git commit -m "feat: add adzan audio playback"
```

---

### Task 4: Prayer countdown component

**Files:**
- Create: `components/PrayerCountdown.tsx`

**Interfaces:**
- Consumes: 
  - `getTimes(): Promise<{ name: string; time: Date }>` from `lib/prayerTimes`
  - `usePrayer(): { setOverlayName: (name: string | null) => void }` from `contexts/PrayerContext`
- Produces: `PrayerCountdown: React.FC` - renders countdown, triggers overlay at zero

- [ ] **Step 1: Write `components/PrayerCountdown.tsx`**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getTimes } from '@/lib/prayerTimes';
import { usePrayer } from '@/contexts/PrayerContext';

export function PrayerCountdown() {
  const { setOverlayName } = usePrayer();
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
          }
        };

        update();
        interval = setInterval(update, 1000);
      } catch (err) {
        if (!cancelled) setError(true);
      }
    }

    init();

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [setOverlayName]);

  if (error || !nextPrayer) return null;

  const mins = Math.floor(nextPrayer.remaining / 60);
  const secs = nextPrayer.remaining % 60;

  return (
    <div className="text-right">
      <div className="text-xs opacity-70">Waktu Sholat</div>
      <div className="tabular-nums text-base font-medium">
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </div>
      <div className="text-xs opacity-60">{nextPrayer.name}</div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/PrayerCountdown.tsx
git commit -m "feat: add prayer countdown component"
```

---

### Task 5: Prayer overlay component

**Files:**
- Create: `components/PrayerOverlay.tsx`

**Interfaces:**
- Consumes:
  - `usePrayer(): { overlayName: string | null; setOverlayName: (name: string | null) => void }` from `contexts/PrayerContext`
  - `playAdzan(): void` from `lib/audio/cheer`
  - `getAdzanElement(): HTMLAudioElement` from `lib/audio/cheer`
- Produces: `PrayerOverlay: React.FC` - modal overlay that plays adzan, auto-closes when audio ends

- [ ] **Step 1: Write `components/PrayerOverlay.tsx`**

```typescript
'use client';

import { useEffect } from 'react';
import { usePrayer } from '@/contexts/PrayerContext';
import { playAdzan, getAdzanElement } from '@/lib/audio/cheer';

export function PrayerOverlay() {
  const { overlayName, setOverlayName } = usePrayer();

  useEffect(() => {
    if (!overlayName) return;

    playAdzan();

    const audio = getAdzanElement();
    const handleEnded = () => setOverlayName(null);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [overlayName, setOverlayName]);

  if (!overlayName) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 p-8 shadow-2xl">
        <button
          onClick={() => setOverlayName(null)}
          className="absolute top-4 right-4 text-2xl opacity-50 hover:opacity-100 transition-opacity"
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
            {new Date().toLocaleTimeString('id-ID', { 
              hour12: false, 
              timeZone: 'Asia/Jakarta' 
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/PrayerOverlay.tsx
git commit -m "feat: add prayer time overlay with adzan"
```

---

### Task 6: Integrate prayer context into app

**Files:**
- Modify: `app/layout.tsx:1-50` (wrap children with PrayerProvider)

**Interfaces:**
- Consumes: `PrayerProvider` from `contexts/PrayerContext`
- Produces: App tree with prayer context available

- [ ] **Step 1: Add PrayerProvider to `app/layout.tsx`**

Import at top:
```typescript
import { PrayerProvider } from '@/contexts/PrayerContext';
```

Wrap `{children}` in default export:
```typescript
<PrayerProvider>
  {children}
</PrayerProvider>
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: wrap app in prayer context provider"
```

---

### Task 7: Add countdown to header

**Files:**
- Modify: `components/Header.tsx:24-47` (add PrayerCountdown next to clock)

**Interfaces:**
- Consumes: `PrayerCountdown` from `components/PrayerCountdown`
- Produces: Header with prayer countdown displayed

- [ ] **Step 1: Import PrayerCountdown in `components/Header.tsx`**

Add import:
```typescript
import { PrayerCountdown } from './PrayerCountdown';
```

- [ ] **Step 2: Add PrayerCountdown to header JSX**

In the third column `div` (after date), before closing tag, add:
```typescript
<PrayerCountdown />
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npm run build`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add components/Header.tsx
git commit -m "feat: add prayer countdown to header"
```

---

### Task 8: Add overlay to dashboard

**Files:**
- Modify: `app/page.tsx:16-56` (render PrayerOverlay)

**Interfaces:**
- Consumes: `PrayerOverlay` from `components/PrayerOverlay`
- Produces: Dashboard with prayer overlay rendered when triggered

- [ ] **Step 1: Import PrayerOverlay in `app/page.tsx`**

Add import:
```typescript
import { PrayerOverlay } from '@/components/PrayerOverlay';
```

- [ ] **Step 2: Add PrayerOverlay to page JSX**

Before `<BreakingNewsOverlay />`, add:
```typescript
<PrayerOverlay />
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npm run build`
Expected: No errors, build succeeds

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: render prayer overlay on dashboard"
```

---

### Task 9: Add placeholder adzan audio and README note

**Files:**
- Create: `public/sfx/adzan.mp3` (1-second silent placeholder)
- Modify: `README.md` (add note about replacing adzan.mp3)

**Interfaces:**
- Produces: Placeholder audio file, documentation for user

- [ ] **Step 1: Create silent placeholder audio**

Create 1-second silent MP3 at `public/sfx/adzan.mp3`. Use FFmpeg:
```bash
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 1 -q:a 9 -acodec libmp3lame public/sfx/adzan.mp3
```

If FFmpeg not available, create empty file with note in README that user must provide.

- [ ] **Step 2: Add note to README.md**

Add section:
```markdown
## Audio Files

The dashboard uses two audio files in `public/sfx/`:

- `applause.mp3` - Breaking news cheer sound (included)
- `adzan.mp3` - Prayer time adzan sound (placeholder - **replace with actual adzan audio**)

Replace `public/sfx/adzan.mp3` with your preferred adzan recording (MP3 format recommended).
```

- [ ] **Step 3: Commit**

```bash
git add public/sfx/adzan.mp3 README.md
git commit -m "docs: add placeholder adzan audio and setup note"
```

---

### Task 10: Install dependencies and verify build

**Files:**
- Modify: `package.json` (already has `adhan` in dependencies from earlier)

**Interfaces:**
- Produces: Working build with all dependencies installed

- [ ] **Step 1: Install dependencies**

Run: `npm install`
Expected: `adhan@^5.0.0` installed successfully

- [ ] **Step 2: Run full build**

Run: `npm run build`
Expected: Build completes without errors

- [ ] **Step 3: Start dev server and verify countdown appears**

Run: `npm run dev`
Open browser, verify:
- Countdown appears in header next to clock
- Shows "Waktu Sholat", countdown timer, and next prayer name
- No console errors

- [ ] **Step 4: Test audio unlock and overlay**

- Click audio unlock button in dashboard
- Wait for countdown to reach 00:00 (or manually set system time to near prayer time for faster test)
- Verify overlay appears with prayer name, current time, mosque emoji
- Verify adzan sound plays (if real audio provided)
- Verify overlay auto-closes when audio ends, or close button works

- [ ] **Step 5: Commit if any final tweaks**

```bash
git add .
git commit -m "test: verify prayer countdown and overlay integration"
```
