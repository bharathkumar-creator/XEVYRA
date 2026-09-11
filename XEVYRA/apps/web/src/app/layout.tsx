import type { Metadata, Viewport } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { BottomNav } from '@/components/navigation/bottom-nav';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'XEVYRA — Train. Fuel. Evolve.',
  description:
    'Your AI-powered fitness companion for workouts, nutrition and a stronger tomorrow. Track Harder. Eat Smarter. Break Plateaus.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#090D16',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${outfit.variable}`}>
      <body className="bg-background text-text-primary antialiased min-h-screen flex flex-col selection:bg-primary selection:text-white">
        <main className="flex-1 flex flex-col">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
