'use server';

import { ScrapperRun } from '@prisma/client';

import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

async function getCurrentRun(): Promise<ScrapperRun | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const tenMinutesAgo = new Date(Date.now() - 1 * 60 * 1000); // fix 1 to 10 to actually be 10 minutes
  const run = await prisma.scrapperRun.findFirst({
    where: {
      finished_at: null,
      created_at: {
        gte: tenMinutesAgo,
      },
    },
  });
  return run;
}

export default getCurrentRun;
