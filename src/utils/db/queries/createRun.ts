'use server';

import prisma from '@/lib/prisma';

export default async function createRun() {
  const run = await prisma.scrapper_runs.create({});
  return run;
}
