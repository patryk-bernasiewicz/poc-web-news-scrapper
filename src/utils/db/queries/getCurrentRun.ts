'use server';

import { scrapper_runs } from '@prisma/client';

import prisma from '@/lib/prisma';

export default async function getCurrentRun(): Promise<scrapper_runs | null> {
  const tenMinutesAgo = new Date(Date.now() - 1 * 60 * 1000); // fix 1 to 10 to actually be 10 minutes
  const run = await prisma.scrapper_runs.findFirst({
    where: {
      finished_at: null,
      created_at: {
        gte: tenMinutesAgo,
      },
    },
  });
  return run;
}
