'use server';

import type { User } from '@supabase/supabase-js';

import prisma from '@/lib/prisma';

import withUserAuth from './withUserAuth';

async function updateRunCompleted(_: User, runId: bigint, count?: number) {
  const run = await prisma.scrapperRun.update({
    where: { id: runId },
    data: { finished_at: new Date(), upserted_articles: count },
  });
  return run;
}

export default withUserAuth(updateRunCompleted);
