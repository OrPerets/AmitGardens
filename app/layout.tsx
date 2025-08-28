import './globals.css';
import type { ReactNode } from 'react';
import { Alef } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

const font = Alef({ subsets: ['hebrew'], weight: ['400', '700'], variable: '--font-sans' });

export const metadata = {
  title: 'Amit Gardens',
  viewport: { width: 'device-width', initialScale: 1 },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body className={cn('min-h-screen bg-background font-sans antialiased', font.variable)}>
        <Toaster>{children}</Toaster>
      </body>
    </html>
  );
}
