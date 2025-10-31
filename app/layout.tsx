import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '2048 Merge Master',
  description: 'Join the numbers to reach 2048! Classic puzzle game on Base.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000'),
  openGraph: {
    title: '2048 Merge Master',
    description: 'Join the numbers to reach 2048! Classic puzzle game on Base.',
    images: ['/splash.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
