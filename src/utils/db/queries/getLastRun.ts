'use server';

import type { ScrapperRun } from '@prisma/client';

import prisma from '@/lib/prisma';

export default async function getLastRun(): Promise<ScrapperRun | null> {
  return prisma.scrapperRun.findFirst({
    orderBy: {
      created_at: 'desc',
    },
  });
}
