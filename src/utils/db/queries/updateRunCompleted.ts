'use server';

import prisma from '@/lib/prisma';

export default async function updateRunCompleted(
  runId: bigint,
  count?: number,
) {
  const run = await prisma.scrapperRun.update({
    where: { id: runId, upserted_articles: count },
    data: { finished_at: new Date() },
  });
  return run;
}
