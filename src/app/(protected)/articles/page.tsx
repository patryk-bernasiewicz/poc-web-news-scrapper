import { Suspense } from 'react';

import { ArticlesListWrapper } from '@/components/articles-list-wrapper';

import { fetchArticles, fetchArticlesCount } from './actions/fetch-articles';

export default async function ArticlesPage() {
  const initialArticles = await fetchArticles();
  const totalArticles = await fetchArticlesCount();

  return (
    <div className="flex flex-col max-w-[1400px] mx-auto items-start w-full">
      <h1 className="text-2xl font-bold mb-4">Artykuły</h1>
      <Suspense fallback={<div>Loading articles...</div>}>
        <ArticlesListWrapper
          initialArticles={initialArticles ?? []}
          totalArticles={totalArticles}
          fetchArticlesFn={fetchArticles}
        />
      </Suspense>
    </div>
  );
}
