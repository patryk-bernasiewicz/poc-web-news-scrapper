import { PrismaClient } from '@prisma/client';

import { createClient } from '@/utils/supabase/server';

const prisma = new PrismaClient();

async function fetchMainKeywords() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  return await prisma.keyword.findMany({
    where: { parentKeywordId: null },
    orderBy: { created_at: 'desc' },
  });
}

export default fetchMainKeywords;
