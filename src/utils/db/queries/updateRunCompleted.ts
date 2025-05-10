'use server';

import prisma from '@/lib/prisma';

export default async function updateRunCompleted(
  runId: bigint,
  count?: number,
) {
  const run = await prisma.scrapperRun.update({
    where: { id: runId },
    data: { finished_at: new Date(), upserted_articles: count },
  });
  return run;
}
