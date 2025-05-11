'use server';

import type { ScrapperRun } from '@prisma/client';
import type { User } from '@supabase/supabase-js';

import prisma from '@/lib/prisma';

import withUserAuth from './withUserAuth';

async function getLastRun(_: User): Promise<ScrapperRun | null> {
  return prisma.scrapperRun.findFirst({
    orderBy: {
      created_at: 'desc',
    },
  });
}

export default withUserAuth(getLastRun);
