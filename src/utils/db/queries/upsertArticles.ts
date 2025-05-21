import { Article } from '@prisma/client';

import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

export type UpsertArticleDTO = Omit<Article, 'id' | 'created_at'>;

function omitKeywordIds<T extends { keywordIds?: unknown }>(obj: T) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { keywordIds, ...rest } = obj;
  return rest;
}

export default async function upsertArticles(
  articles: (UpsertArticleDTO & { keywordIds: number[] })[],
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

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

  // Remove keywordIds before insert
  const articlesToInsert = filteredArticles.map(omitKeywordIds);

  await prisma.article.createMany({
    data: articlesToInsert,
  });

  // Fetch upserted articles
  const upsertedArticles = await prisma.article.findMany({
    where: {
      slug: { in: filteredArticles.map((article) => article.slug) },
    },
  });

  // Create ArticleKeyword relations
  for (const article of filteredArticles) {
    const dbArticle = upsertedArticles.find((a) => a.slug === article.slug);
    if (!dbArticle) continue;
    for (const keywordId of article.keywordIds) {
      await prisma.articleKeyword.create({
        data: {
          articleId: dbArticle.id,
          articleTitle: dbArticle.title,
          articleSlug: dbArticle.slug,
          keywordId,
        },
      });
    }
  }

  return upsertedArticles;
}
