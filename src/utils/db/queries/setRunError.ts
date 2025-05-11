'use server';

import type { User } from '@supabase/supabase-js';

import prisma from '@/lib/prisma';

import withUserAuth from './withUserAuth';

async function setRunError(_: User, runId: bigint) {
  await prisma.scrapperRun.update({
    where: { id: runId },
    data: { errored_at: new Date() },
  });
}

export default withUserAuth(setRunError);
