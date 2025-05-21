'use server';

import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

async function updateRunCompleted(runId: bigint, count?: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const run = await prisma.scrapperRun.update({
    where: { id: runId },
    data: { finished_at: new Date(), upserted_articles: count },
  });
  return run;
}

export default updateRunCompleted;
