import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Kaly',
  description: 'Privacy Policy for Kaly, the AI calorie tracker app.',
};

export default function KalyPrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body style={{ margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
