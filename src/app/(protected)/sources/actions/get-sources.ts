'use server';

import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

export async function getSources() {
  // Validate user (example: Supabase auth)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Fetch sources from Prisma
  const sources = await prisma.source.findMany({
    include: {
      sourceKeywords: {
        include: { keyword: true },
      },
    },
    orderBy: { created_at: 'desc' },
  });
  return sources;
}
