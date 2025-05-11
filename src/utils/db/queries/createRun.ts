'use server';

import type { User } from '@supabase/supabase-js';

import prisma from '@/lib/prisma';

import withUserAuth from './withUserAuth';

async function createRun(_: User) {
  const run = await prisma.scrapperRun.create({});
  return run;
}

export default withUserAuth(createRun);
