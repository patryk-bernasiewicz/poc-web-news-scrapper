'use client';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';

export default function SignOutButton() {
  const router = useRouter();
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };
  return (
    <Button variant="destructive" onClick={handleSignOut}>
      Sign Out
    </Button>
  );
}
