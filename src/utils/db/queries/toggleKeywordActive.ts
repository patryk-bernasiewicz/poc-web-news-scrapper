'use server';

import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

async function toggleKeywordActive(keywordId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const keyword = await prisma.keyword.findUnique({
    where: {
      id: keywordId,
    },
  });

  if (!keyword) {
    throw new Error('Keyword not found');
  }

  await prisma.keyword.update({
    where: {
      id: keywordId,
    },
    data: {
      is_active: !keyword.is_active,
    },
  });
}

export default toggleKeywordActive;
