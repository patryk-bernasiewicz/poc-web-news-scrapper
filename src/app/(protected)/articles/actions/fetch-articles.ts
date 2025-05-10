'use server';

import { Article, Keyword } from '@prisma/client';

import prisma from '@/lib/prisma';

export async function fetchArticles({
  skip = 0,
  take = 10,
}: { skip?: number; take?: number } = {}): Promise<
  (Article & { articleKeywords: { keyword: Keyword }[] })[] | null
> {
  try {
    const articles = await prisma.article.findMany({
      orderBy: {
        publish_date: 'desc',
      },
      skip,
      take,
      include: {
        articleKeywords: {
          include: {
            keyword: true,
          },
        },
      },
    });

    return articles;
  } catch (error) {
    console.error('Error fetching articles:', error);
  }

  return null;
}

export async function fetchArticlesCount(): Promise<number> {
  try {
    return await prisma.article.count();
  } catch (error) {
    console.error('Error counting articles:', error);
    return 0;
  }
}
