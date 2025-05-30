'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/Button';
import { createClient } from '@/utils/supabase/client';

export function SignOutButton() {
  const router = useRouter();
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };
  return (
    <Button variant="secondary" onClick={handleSignOut}>
      Wyloguj się
    </Button>
  );
}
