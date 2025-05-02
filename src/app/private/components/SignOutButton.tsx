'use client';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push('/');
    }
  }

  return (
    <Button variant="destructive" onClick={signOut}>
      Sign Out
    </Button>
  );
}
