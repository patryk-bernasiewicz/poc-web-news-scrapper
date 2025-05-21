'use server';

import type { ScrapperRun } from '@prisma/client';

import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

async function getLastRun(): Promise<ScrapperRun | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  return prisma.scrapperRun.findFirst({
    orderBy: {
      created_at: 'desc',
    },
  });
}

export default getLastRun;
