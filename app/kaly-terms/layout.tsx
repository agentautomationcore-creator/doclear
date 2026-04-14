import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — Kaly',
  description: 'Terms of Service for Kaly, the AI calorie tracker app.',
};

export default function KalyTermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
