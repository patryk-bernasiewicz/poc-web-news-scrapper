'use server';

import type { User } from '@supabase/supabase-js';

import prisma from '@/lib/prisma';

import withUserAuth from './withUserAuth';

async function toggleKeywordActive(_: User, keywordId: number) {
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

export default withUserAuth(toggleKeywordActive);
