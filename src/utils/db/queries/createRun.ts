'use server';

import prisma from '@/lib/prisma';

export default async function createRun() {
  const run = await prisma.scrapperRun.create({});
  return run;
}
