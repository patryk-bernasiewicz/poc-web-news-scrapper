'use server';

import { ScrapperRun } from '@prisma/client';

import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

type GetPreviousRunsParams = {
  limit?: number;
  offset?: number;
};

async function getPreviousRuns({
  limit = 10,
  offset = 0,
}: GetPreviousRunsParams = {}): Promise<ScrapperRun[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  return prisma.scrapperRun.findMany({
    orderBy: {
      created_at: 'desc',
    },
    skip: offset,
    take: limit,
  });
}

export default getPreviousRuns;
