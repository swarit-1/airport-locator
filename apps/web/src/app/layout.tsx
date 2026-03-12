import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GateShare — Never miss a flight, share the ride',
  description:
    'Know exactly when to leave for the airport. Find travel companions heading your way and split the ride.',
  openGraph: {
    title: 'GateShare',
    description: 'Know when to leave. Share the ride.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563EB',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
