import { redirect } from 'next/navigation';

import { createClient } from '@/utils/supabase/server';

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data?.user) {
    redirect('/articles');
  }
  return <div>Hello World</div>;
}
