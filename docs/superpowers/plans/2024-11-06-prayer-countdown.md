I’m using the writing-plans skill to create the implementation plan.

# Prayer countdown & Adzan overlay

## Overview
Add Islamic prayer time countdown near the clock in `Header`. Detect user location automatically (geolocation then IP fallback). Compute daily prayer times using the `adhan` library (client‑side). Show countdown to next prayer. When countdown reaches zero, display a modal‑style overlay (similar to `BreakingNewsOverlay`) with Islamic design, play an Adzan audio file, and hide overlay automatically when audio ends.

## Files to touch / create
1. **`components/PrayerCountdown.tsx`** – new component that:
   - obtains location on mount (geolocation → IP fallback).
   - uses `adhan` to calculate today’s prayer times.
   - determines next prayer name & remaining time.
   - updates every second.
   - triggers `showPrayerOverlay` via a context or callback when time hits zero.
2. **`components/PrayerOverlay.tsx`** – new overlay component:
   - styled with Tailwind (`bg-white/90 dark:bg-black/90`) and subtle Islamic motif (e.g., arabic calligraphy background via CSS class `prayer-bg`).
   - shows prayer name, current time, and a “Close” button that also closes after audio ends.
   - uses `playAdhan()` from `lib/audio/cheer.ts`.
3. **`components/Header.tsx`** – modify to import and render `<PrayerCountdown />` next to the clock.
4. **`lib/audio/cheer.ts`** – add new function `playAdhan()` similar to `playCheer()` but loading `/sfx/adhan.mp3`.
5. **`public/sfx/adhan.mp3`** – placeholder file (user must provide actual adzan audio). Add note in README.
6. **`app/page.tsx`** – import and render `<PrayerOverlay />` (perhaps placed before `BreakingNewsOverlay`).
7. **`package.json`** – add dependency `adhan` (latest version).
8. **`components/PrayerOverlay.tsx`** may need a small state store; easiest: use a React context `PrayerContext` to share `showOverlay` flag between `PrayerCountdown` and overlay, but to keep minimal, lift state to `DashboardPage`:
   - add `const [prayerOverlay, setPrayerOverlay] = useState<{name:string}|null>(null);`
   - pass `setPrayerOverlay` as prop to `<PrayerCountdown />`.
   - render `<PrayerOverlay name={prayerOverlay?.name} onClose={() => setPrayerOverlay(null)} />` when not null.
9. **`components/PrayerCountdown.tsx`** will call `setPrayerOverlay({name: nextPrayerName})` when countdown reaches ≤0.

## Implementation steps (bite‑sized)
1. **Add `adhan` dependency** – `npm i adhan` (or `yarn add adhan`).
2. **Create `components/PrayerContext.tsx` (optional)** – simple context with `show` and `setShow`.
3. **Implement `PrayerCountdown`**:
   - State: `location` (lat, lng), `times` (object of Date), `nextPrayer` (name & time), `remaining` (seconds).
   - Effect: on mount, get location → compute times → start interval updating `remaining`.
   - When `remaining <= 0` and overlay not yet shown, call `onTrigger()` prop.
4. **Implement `PrayerOverlay`**:
   - Props: `name`, `onClose`.
   - Use `useEffect` to call `playAdhan()` on mount; attach `ended` event to audio to call `onClose`.
   - Render overlay with Tailwind, include prayer name and a close “×”.
5. **Update `Header`**:
   - Import `PrayerCountdown`.
   - Place component inside the right‑hand `div` after the clock.
6. **Update `cheer.ts`**:
   - Add `playAdhan()` similar to `playCheer` but using `/sfx/adhan.mp3`.
   - Ensure unlock works – reuse `unlockAudio()`.
7. **Update `app/page.tsx`**:
   - Add state `prayerOverlay`.
   - Pass `setPrayerOverlay` to `PrayerCountdown`.
   - Render `<PrayerOverlay />` when state non‑null.
8. **Add audio file placeholder** – note in repo README for user to add actual adzan MP3.
9. **Write tests (optional)** – simple unit test for `getNextPrayer` logic using known coordinates.
10. **Commit each logical change with clear message**.
11. **Run lint/inspect (design‑taste‑frontend)** to ensure no banned patterns.
12. **Verify on Chrome 152** – check that audio plays after unlock, countdown correct, overlay hides after sound.

## Acceptance criteria
- Countdown displayed, updates every second.
- When time reaches prayer, overlay appears with prayer name.
- Adzan sound plays automatically (after user unlocked audio via existing button or silent unlock).
- Overlay disappears when audio ends.
- No console errors, respects autoplay policy.
- Responsive: looks good on desktop TV (large) and on smaller widths.
- Code passes existing TypeScript checks.

## Risks / mitigations
- **Geolocation denied** – fallback to IP API (free, no key). Provide default lat/lng (Jakarta) if both fail.
- **Audio autoplay blocked** – rely on existing unlock flow; also start silent audio on page load if not unlocked.
- **Time zone mismatch** – use `Intl.DateTimeFormat` with `timeZone: 'Asia/Jakarta'` for display, but prayer calculation uses local timezone from JS Date (should be fine if server UTC but client location is used).
- **Library size** – `adhan` is small; bundle impact acceptable.

---

**Next step**: apply changes.
