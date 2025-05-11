'use server';

import { ScrapperRun } from '@prisma/client';
import type { User } from '@supabase/supabase-js';

import prisma from '@/lib/prisma';

import withUserAuth from './withUserAuth';

type GetPreviousRunsParams = {
  limit?: number;
  offset?: number;
};

async function getPreviousRuns(
  _: User,
  { limit = 10, offset = 0 }: GetPreviousRunsParams = {},
): Promise<ScrapperRun[]> {
  return prisma.scrapperRun.findMany({
    orderBy: {
      created_at: 'desc',
    },
    skip: offset,
    take: limit,
  });
}

export default withUserAuth(getPreviousRuns);
