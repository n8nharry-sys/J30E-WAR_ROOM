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