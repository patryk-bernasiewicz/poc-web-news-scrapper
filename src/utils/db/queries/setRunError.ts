'use server';

import prisma from '@/lib/prisma';

export default async function setRunError(runId: bigint) {
  await prisma.scrapper_runs.update({
    where: { id: runId },
    data: { errored_at: new Date() },
  });
}
