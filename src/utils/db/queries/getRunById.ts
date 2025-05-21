'use server';

import { ScrapperRun } from '@prisma/client';

import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

async function getRunById(id: bigint): Promise<ScrapperRun | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const run = await prisma.scrapperRun.findFirst({
    where: { id },
  });
  return run;
}

export default getRunById;
