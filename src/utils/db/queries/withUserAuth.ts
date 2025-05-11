import type { User } from '@supabase/supabase-js';

import { createClient } from '@/utils/supabase/server';

export default function withUserAuth<Args extends unknown[], R>(
  fn: (user: User, ...args: Args) => R,
) {
  return async (...args: Args): Promise<R> => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');
    return fn(user, ...args);
  };
}
