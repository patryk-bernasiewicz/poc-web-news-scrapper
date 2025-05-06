'use server';

import prisma from '@/lib/prisma';

export default async function updateRunCompleted(runId: bigint) {
  const run = await prisma.scrapper_runs.update({
    where: { id: runId },
    data: { finished_at: new Date() },
  });
  return run;
}
