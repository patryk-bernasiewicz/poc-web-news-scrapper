'use server';

import { ScrapperRun } from '@prisma/client';

import prisma from '@/lib/prisma';

export default async function getRunById(
  id: bigint,
): Promise<ScrapperRun | null> {
  const run = await prisma.scrapperRun.findFirst({
    where: { id },
  });
  return run;
}
