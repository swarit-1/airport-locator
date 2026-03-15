import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Boarding — never miss a flight again',
  description:
    'Know when to leave, understand why, and coordinate a shared airport ride without gambling on the timing.',
  openGraph: {
    title: 'Boarding',
    description: 'never miss a flight again',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1E4AA8',
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
