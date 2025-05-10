import { Keyword, Source } from '@prisma/client';
import { Browser } from 'playwright';

import prisma from '@/lib/prisma';

import { scrapAllSources } from '../scrap-all-sources';
import * as scrapSourceModule from '../scrap-source';

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    keyword: { findMany: jest.fn() },
    source: { findMany: jest.fn() },
  },
}));

describe('scrapAllSources', () => {
  it('aggregates articles from all sources', async () => {
    // Mock logger
    const logger = { info: jest.fn() };
    // Mock browser
    const browser = {
      newContext: jest.fn().mockResolvedValue({ close: jest.fn() }),
    } as unknown as Browser;
    // Mock data from database
    const keywords: Keyword[] = [
      {
        id: 1 as unknown as bigint,
        name: 'keyword',
        created_at: new Date(),
        is_active: true,
        slug: 'keyword',
        description: null,
      },
    ];
    const sources: (Source & { sourceKeywords: { keyword: Keyword }[] })[] = [
      {
        id: 1 as unknown as bigint,
        created_at: new Date(),
        name: 'src',
        url: 'https://example.com',
        is_active: true,
        dateStrings: [],
        containerSelectors: ['container'],
        titleSelectors: ['title'],
        dateSelectors: ['date'],
        leadSelectors: ['lead'],
        sourceKeywords: [{ keyword: keywords[0] }],
      },
    ];
    (prisma.keyword.findMany as jest.Mock).mockResolvedValue(keywords);
    (prisma.source.findMany as jest.Mock).mockResolvedValue(sources);
    // Mock scrapSource
    jest.spyOn(scrapSourceModule, 'scrapSource').mockResolvedValue({
      articles: [
        {
          title: 'Test',
          lead: 'Lead',
          link: 'https://example.com',
          slug: 'test',
          publish_date: new Date().toISOString(),
          keywordIds: [1],
        },
      ],
    });
    // Call
    const result = await scrapAllSources(logger, browser);
    expect(result.length).toBe(1);
    expect(result[0].title).toBe('Test');
  });
});
