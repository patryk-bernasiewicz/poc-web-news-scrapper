'use client';

import type { Article, Keyword } from '@prisma/client';
import * as React from 'react';

import type { fetchArticles } from '@/app/(protected)/articles/actions/fetch-articles';
import { ArticlesList } from '@/components/articles-list';
import { Pagination } from '@/components/ui/pagination';

// Local type for client state (id: number, lead: string, id: number w keyword)
type ArticleListItem = Omit<Article, 'id' | 'lead'> & {
  id: number;
  lead: string;
  articleKeywords: { keyword: Omit<Keyword, 'id'> & { id: number } }[];
};

type ArticlesListWrapperProps = {
  initialArticles: (Article & { articleKeywords: { keyword: Keyword }[] })[];
  totalArticles: number;
  fetchArticlesFn: typeof fetchArticles;
};

function mapToArticleListItem(
  article: Article & { articleKeywords: { keyword: Keyword }[] },
): ArticleListItem {
  return {
    ...article,
    id: typeof article.id === 'bigint' ? Number(article.id) : article.id,
    lead: article.lead ?? '',
    articleKeywords: article.articleKeywords.map(({ keyword }) => ({
      keyword: {
        ...keyword,
        id: typeof keyword.id === 'bigint' ? Number(keyword.id) : keyword.id,
      },
    })),
  };
}

export function ArticlesListWrapper({
  initialArticles,
  totalArticles,
  fetchArticlesFn,
}: ArticlesListWrapperProps) {
  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(totalArticles / PAGE_SIZE);
  const [articles, setArticles] = React.useState<ArticleListItem[]>(
    initialArticles.map(mapToArticleListItem),
  );
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isLoading, startTransition] = React.useTransition();

  const handlePageChange = React.useCallback(
    (page: number) => {
      setCurrentPage(page);
      startTransition(async () => {
        const skip = (page - 1) * PAGE_SIZE;
        const more = await fetchArticlesFn({ skip, take: PAGE_SIZE });
        if (more && more.length > 0) {
          setArticles(more.map(mapToArticleListItem));
        } else {
          setArticles([]);
        }
      });
    },
    [fetchArticlesFn],
  );

  return (
    <div className="w-full">
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
      <ArticlesList articles={articles} isLoading={isLoading} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
