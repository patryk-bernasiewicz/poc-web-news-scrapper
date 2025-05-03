import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import SignOutButton from '@/components/SignOutButton';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex items-center justify-between px-8 py-4 border-b bg-white">
        <div className="flex items-center gap-6">
          <Link
            href="/articles"
            className="font-semibold text-lg hover:underline"
          >
            Articles
          </Link>
          <Link
            href="/scrapper"
            className="font-semibold text-lg hover:underline"
          >
            Scrapper
          </Link>
        </div>
        <SignOutButton />
      </nav>
      <main className="flex-1 flex flex-col p-24">
        <div>{children}</div>
      </main>
    </div>
  );
}
