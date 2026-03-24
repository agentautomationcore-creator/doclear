import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DocLear — Scan documents, understand instantly',
  description:
    'Take a photo of any official document — AI explains it in 5 seconds in your language. Perfect for immigrants, expats, and anyone dealing with foreign bureaucracy.',
  metadataBase: new URL('https://doclear.app'),
  openGraph: {
    title: 'DocLear — Scan documents, understand instantly',
    description:
      'Take a photo of any official document — AI explains it in 5 seconds in your language.',
    url: 'https://doclear.app',
    siteName: 'DocLear',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DocLear',
    description:
      'Take a photo of any official document — AI explains it in 5 seconds in your language.',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#2A2A3E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
