import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { AppShell } from '@/components/navigation/AppShell';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'XEVYRA — Train. Fuel. Evolve.',
  description:
    'High-performance athlete fitness platform. Precision gym tracking, weight-based macro fuel, and progressive analytics.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#070A0F',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${poppins.variable}`}>
      <body className="font-sans bg-background-deep text-text-primary antialiased min-h-screen selection:bg-primary selection:text-background-deep">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
