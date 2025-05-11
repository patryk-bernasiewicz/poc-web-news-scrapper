'use server';

import { ScrapperRun } from '@prisma/client';
import type { User } from '@supabase/supabase-js';

import prisma from '@/lib/prisma';

import withUserAuth from './withUserAuth';

async function getCurrentRun(_: User): Promise<ScrapperRun | null> {
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

export default withUserAuth(getCurrentRun);
