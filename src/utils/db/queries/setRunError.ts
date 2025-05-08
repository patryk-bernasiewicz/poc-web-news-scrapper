'use server';

import prisma from '@/lib/prisma';

export default async function setRunError(runId: bigint) {
  await prisma.scrapperRun.update({
    where: { id: runId },
    data: { errored_at: new Date() },
  });
}
