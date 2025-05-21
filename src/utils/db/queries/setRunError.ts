'use server';

import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

async function setRunError(runId: bigint) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  await prisma.scrapperRun.update({
    where: { id: runId },
    data: { errored_at: new Date() },
  });
}

export default setRunError;
