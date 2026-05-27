import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HydroWells | Well & Pump Solutions in Maryland and DC',
  description: 'HydroWells provides well drilling, pump service, and constant pressure systems with professional 24/7 support.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
