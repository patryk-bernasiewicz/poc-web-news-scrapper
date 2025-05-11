'use server';

import { ScrapperRun } from '@prisma/client';
import type { User } from '@supabase/supabase-js';

import prisma from '@/lib/prisma';

import withUserAuth from './withUserAuth';

async function getRunById(_: User, id: bigint): Promise<ScrapperRun | null> {
  const run = await prisma.scrapperRun.findFirst({
    where: { id },
  });
  return run;
}

export default withUserAuth(getRunById);
