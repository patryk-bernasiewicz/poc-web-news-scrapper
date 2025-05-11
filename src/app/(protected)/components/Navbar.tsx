'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { SignOutButton } from '@/components/auth/SignOutButton';
import { cn } from '@/lib/utils';

const links = [
  {
    href: '/articles',
    label: 'Artykuły',
  },
  {
    href: '/scrapper',
    label: 'Scrapper',
  },
  {
    href: '/sources',
    label: 'Źródła',
  },
  {
    href: '/keywords',
    label: 'Słowa kluczowe',
  },
];

export const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between px-8 py-4 border-b bg-background-dim">
      <ul className="flex items-center gap-6">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  'font-semibold text-lg hover:underline',
                  isActive && 'text-blue-500',
                )}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <SignOutButton />
    </nav>
  );
};
