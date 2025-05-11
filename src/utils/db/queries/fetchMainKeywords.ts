import { PrismaClient } from '@prisma/client';
import type { User } from '@supabase/supabase-js';

import withUserAuth from './withUserAuth';

const prisma = new PrismaClient();

async function fetchMainKeywords(_: User) {
  return await prisma.keyword.findMany({
    where: { parentKeywordId: null },
    orderBy: { created_at: 'desc' },
  });
}

export default withUserAuth(fetchMainKeywords);
