import { Article } from '@prisma/client';

import prisma from '@/lib/prisma';

export type UpsertArticleDTO = Omit<Article, 'id' | 'created_at'>;

export default async function upsertArticles(articles: UpsertArticleDTO[]) {
  const existingArticles = await prisma.article.findMany({
    where: {
      slug: { in: articles.map((article) => article.slug) },
    },
  });

  const filteredArticles = articles.filter(
    (article) =>
      !existingArticles.some(
        (existingArticle) => existingArticle.slug === article.slug,
      ),
  );

  await prisma.article.createMany({
    data: filteredArticles,
  });

  const upsertedArticles = await prisma.article.findMany({
    where: {
      slug: { in: filteredArticles.map((article) => article.slug) },
    },
  });

  return upsertedArticles;
}
