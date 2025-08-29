import './globals.css';
import type { ReactNode } from 'react';
import { Alef } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import DirectionToggle from '@/components/DirectionToggle';
import LanguageToggle from '@/components/LanguageToggle';

const font = Alef({
  subsets: ['hebrew'],
  weight: ['400', '700'],
  variable: '--font-sans',
});

export const metadata = {
  title: 'Amit Gardens',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          font.variable,
        )}
      >
        <DirectionToggle />
        <LanguageToggle />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
