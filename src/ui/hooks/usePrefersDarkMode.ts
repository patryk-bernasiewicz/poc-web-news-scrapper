'use client';

import { useEffect, useState } from 'react';

export function usePrefersDarkMode(): boolean {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const localStorageTheme = localStorage.getItem('theme');

    if (localStorageTheme) {
      setIsDark(localStorageTheme === 'dark');
    } else {
      setIsDark(media.matches);
    }

    const listener = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
      localStorage.setItem('theme', e.matches ? 'dark' : 'light');
    };

    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, []);

  return isDark;
}
