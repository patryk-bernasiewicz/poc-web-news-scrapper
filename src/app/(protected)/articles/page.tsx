import { Suspense } from 'react';

import { ArticlesListWrapper } from '@/components/articles-list-wrapper';

import { fetchArticles, fetchArticlesCount } from './actions/fetch-articles';

export default async function ArticlesPage() {
  const initialArticles = await fetchArticles();
  const totalArticles = await fetchArticlesCount();

  // Map id: bigint -> number for client component
  const mappedArticles = (initialArticles ?? []).map((article) => ({
    ...article,
    id: typeof article.id === 'bigint' ? Number(article.id) : article.id,
    lead: article.lead ?? '',
    articleKeywords: article.articleKeywords.map(({ keyword }) => ({
      keyword: {
        ...keyword,
        id: typeof keyword.id === 'bigint' ? Number(keyword.id) : keyword.id,
      },
    })),
  }));

  // Passing fetchArticles as a prop
  return (
    <div className="flex flex-col items-start w-full">
      <h1 className="text-2xl font-bold mb-4">Artykuły</h1>
      <Suspense fallback={<div>Loading articles...</div>}>
        <ArticlesListWrapper
          initialArticles={mappedArticles}
          totalArticles={totalArticles}
          fetchArticlesFn={fetchArticles}
        />
      </Suspense>
    </div>
  );
}
