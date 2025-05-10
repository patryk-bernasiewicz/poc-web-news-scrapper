import { Keyword, Source } from '@prisma/client';
import { Browser } from 'playwright';

import prisma from '@/lib/prisma';

import { ScrapSourceResult, scrapSource } from './scrap-source';

interface Logger {
  info: (msg: string) => void;
}

export async function scrapAllSources(logger: Logger, browser: Browser) {
  // Fetch all keywords from the database (for mapping by name)
  const allKeywords: Keyword[] = await prisma.keyword.findMany();
  // Fetch all sources with their keywords
  const pages: (Source & { sourceKeywords: { keyword: Keyword }[] })[] =
    await prisma.source.findMany({
      where: { is_active: true },
      include: {
        sourceKeywords: { include: { keyword: true } },
      },
    });

  const results: ScrapSourceResult[] = [];
  for (const entry of pages) {
    const context = await browser.newContext();
    const result = await scrapSource(entry, allKeywords, context, logger);
    results.push(result);
    await context.close();
  }
  // Flatten articles
  const allArticles = results.flatMap((r) => r.articles);
  return allArticles;
}
