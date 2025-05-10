'use client';

import type { Article, Keyword } from '@prisma/client';
import { format } from 'date-fns';
import * as React from 'react';

import { ExternalLinkIcon } from './ui/external-link-icon';

type ArticleListItem = Omit<Article, 'id' | 'lead'> & {
  id: number;
  lead: string;
  articleKeywords: { keyword: Omit<Keyword, 'id'> & { id: number } }[];
};

type ArticlesListProps = {
  articles: ArticleListItem[];
  isLoading?: boolean;
};

export function ArticlesList({ articles }: ArticlesListProps) {
  return (
    <div className="flex grow flex-col mt-4">
      <ul className="flex grow flex-col gap-12 lg:grid lg:grid-cols-2 xl:grid-cols-3">
        {articles.length ? (
          articles.map((article) => (
            <li key={article.id} className="my-2 w-full">
              <h2
                rel="noopener noreferrer"
                className="font-bold text-lg align-middle"
              >
                {article.title}
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex ml-2 align-middle"
                >
                  <ExternalLinkIcon className="stroke-blue-500 w-4 h-4 -mt-1" />
                </a>
              </h2>
              <div className="text-sm text-secondary-foreground/50 flex flex-wrap items-center gap-2">
                Keywords:{' '}
                {article.articleKeywords?.map(({ keyword }) => (
                  <span className="inline-flex px-1 py-0.5" key={keyword.id}>
                    {keyword.name}
                  </span>
                ))}
              </div>
              <div className="text-sm text-secondary-foreground/50">
                <time>
                  Published:{' '}
                  {article.publish_date
                    ? format(new Date(article.publish_date), 'dd-MM-yyyy')
                    : 'unknown'}
                </time>
              </div>
              <div>{article.lead}</div>
            </li>
          ))
        ) : (
          <div>No articles to show.</div>
        )}
      </ul>
    </div>
  );
}
