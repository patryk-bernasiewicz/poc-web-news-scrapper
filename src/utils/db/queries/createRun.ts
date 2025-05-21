'use server';

import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

async function createRun() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const run = await prisma.scrapperRun.create({});
  return run;
}

export default createRun;
