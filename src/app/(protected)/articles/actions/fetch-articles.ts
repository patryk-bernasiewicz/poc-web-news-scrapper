import { Article } from '@prisma/client';

import prisma from '@/lib/prisma';

export async function fetchArticles(): Promise<Article[] | null> {
  try {
    const articles = await prisma.article.findMany({
      orderBy: {
        created_at: 'desc',
      },
    });

    return articles;
  } catch (error) {
    console.error('Error fetching articles:', error);
  }

  return null;
}
