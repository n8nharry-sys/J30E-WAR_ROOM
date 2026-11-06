import type { Metadata } from 'next';
import { PrayerProvider } from '@/contexts/PrayerContext';

import './globals.css';

export const metadata: Metadata = {
  title: 'J30E War Room',
  description: 'Real-time performance monitor — Informa Java Mall',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <PrayerProvider>
          {children}
        </PrayerProvider>
      </body>
    </html>
  );
}
