import { ScrapperRun } from '@prisma/client';

import prisma from '@/lib/prisma';

type GetPreviousRunsParams = {
  limit?: number;
  offset?: number;
};

const defaultLimit = 10;
const defaultOffset = 0;

export default async function getPreviousRuns({
  limit = defaultLimit,
  offset = defaultOffset,
}: GetPreviousRunsParams): Promise<ScrapperRun[] | null> {
  return prisma.scrapperRun.findMany({
    orderBy: {
      created_at: 'desc',
    },
    take: limit,
    skip: offset,
  });
}
