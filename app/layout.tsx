import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'J30E War Room',
  description: 'Real-time performance monitor — Informa Java Mall',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
