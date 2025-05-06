'use client';

import { Roboto } from 'next/font/google';

import { cn } from '@/lib/utils';
import { usePrefersDarkMode } from '@/ui/hooks/usePrefersDarkMode';

const roboto = Roboto({
  variable: '--font-roboto',
  subsets: ['latin-ext'],
});

type ThemeBodyProps = {
  children: React.ReactNode;
};

export function ThemeBody({ children }: ThemeBodyProps) {
  const prefersDarkMode = usePrefersDarkMode();

  return (
    <body
      className={cn(
        roboto.variable,
        'antialiased',
        prefersDarkMode ? 'dark' : 'light',
      )}
    >
      {children}
    </body>
  );
}
