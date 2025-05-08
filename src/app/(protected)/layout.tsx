import { redirect } from 'next/navigation';

import { createClient } from '@/utils/supabase/server';

import { Navbar } from './components/Navbar';
import { ProtectedWrapper } from './components/ProtectedWrapper';

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
    <ProtectedWrapper className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col p-24">{children}</main>
    </ProtectedWrapper>
  );
}
