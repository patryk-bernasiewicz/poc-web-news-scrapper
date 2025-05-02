import prisma from '@/lib/prisma';
import { articles } from '@prisma/client';

export async function fetchArticles(): Promise<articles[] | null> {
  try {
    const articles = await prisma.articles.findMany({
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
