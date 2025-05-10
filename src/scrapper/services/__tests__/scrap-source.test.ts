import { Keyword, Source } from '@prisma/client';
import type { BrowserContext, ElementHandle } from 'playwright';

import { isWithinLast24Hours } from '../../utils/is-within-24-hours';
import { scrapSource } from '../scrap-source';

jest.mock('../../utils/is-within-24-hours', () => ({
  isWithinLast24Hours: jest.fn().mockResolvedValue(true),
}));

describe('scrapSource', () => {
  it('returns an article if it matches keywords', async () => {
    const logger = { info: jest.fn() };
    const dateElement = {
      innerText: jest.fn().mockResolvedValue('2024-01-01'),
    } as unknown as ElementHandle;
    const titleElement = {
      innerText: jest.fn().mockResolvedValue('Test title keyword'),
    } as unknown as ElementHandle;
    const leadElement = {
      innerText: jest.fn().mockResolvedValue('Lead'),
    } as unknown as ElementHandle;
    const container = {
      $(selector: string) {
        if (selector === 'date') return Promise.resolve(dateElement);
        if (selector === 'title') return Promise.resolve(titleElement);
        if (selector === 'lead') return Promise.resolve(leadElement);
        return Promise.resolve(null);
      },
      getAttribute: jest.fn().mockResolvedValue('https://example.com'),
    } as unknown as ElementHandle;
    const page = {
      goto: jest.fn().mockResolvedValue(undefined),
      $: jest.fn(),
      $$: jest
        .fn()
        .mockImplementation((selector: string) =>
          selector === 'container'
            ? Promise.resolve([container])
            : Promise.resolve([]),
        ),
      close: jest.fn(),
    } as unknown as Record<string, unknown>;
    const context = {
      newPage: jest.fn().mockResolvedValue(page),
    } as unknown as BrowserContext;
    const entry = {
      url: 'https://example.com',
      containerSelectors: ['container'],
      dateSelectors: ['date'],
      titleSelectors: ['title'],
      leadSelectors: ['lead'],
      sourceKeywords: [{ keyword: { name: 'keyword' } }],
    } as unknown as Source & { sourceKeywords: { keyword: Keyword }[] };
    const allKeywords = [
      {
        id: 1 as unknown as bigint,
        name: 'keyword',
        created_at: new Date(),
        is_active: true,
        slug: 'keyword',
        description: null,
      } as Keyword,
    ];
    const result = await scrapSource(entry, allKeywords, context, logger);
    expect(result.articles.length).toBe(1);
    expect(result.articles[0].title).toContain('Test title');
    expect(result.articles[0].keywordIds).toContain(1);
  });

  it('returns an empty list if there are no containers', async () => {
    const logger = { info: jest.fn() };
    const page = {
      goto: jest.fn().mockResolvedValue(undefined),
      $: jest.fn(),
      $$: jest.fn().mockResolvedValue([]),
      close: jest.fn(),
    } as unknown as Record<string, unknown>;
    const context = {
      newPage: jest.fn().mockResolvedValue(page),
    } as unknown as BrowserContext;
    const entry = {
      url: 'https://example.com',
      containerSelectors: ['container'],
      dateSelectors: ['date'],
      titleSelectors: ['title'],
      leadSelectors: ['lead'],
      sourceKeywords: [{ keyword: { name: 'keyword' } }],
    } as unknown as Source & { sourceKeywords: { keyword: Keyword }[] };
    const allKeywords = [] as Keyword[];
    const result = await scrapSource(entry, allKeywords, context, logger);
    expect(result.articles.length).toBe(0);
  });

  it('returns an empty list if there are no matching keywords', async () => {
    const logger = { info: jest.fn() };
    const dateElement = {
      innerText: jest.fn().mockResolvedValue('2024-01-01'),
    } as unknown as ElementHandle;
    const titleElement = {
      innerText: jest.fn().mockResolvedValue('Test title'),
    } as unknown as ElementHandle;
    const leadElement = {
      innerText: jest.fn().mockResolvedValue('Lead'),
    } as unknown as ElementHandle;
    const container = {
      $(selector: string) {
        if (selector === 'date') return Promise.resolve(dateElement);
        if (selector === 'title') return Promise.resolve(titleElement);
        if (selector === 'lead') return Promise.resolve(leadElement);
        return Promise.resolve(null);
      },
      getAttribute: jest.fn().mockResolvedValue('https://example.com'),
    } as unknown as ElementHandle;
    const page = {
      goto: jest.fn().mockResolvedValue(undefined),
      $: jest.fn(),
      $$: jest
        .fn()
        .mockImplementation((selector: string) =>
          selector === 'container'
            ? Promise.resolve([container])
            : Promise.resolve([]),
        ),
      close: jest.fn(),
    } as unknown as Record<string, unknown>;
    const context = {
      newPage: jest.fn().mockResolvedValue(page),
    } as unknown as BrowserContext;
    const entry = {
      url: 'https://example.com',
      containerSelectors: ['container'],
      dateSelectors: ['date'],
      titleSelectors: ['title'],
      leadSelectors: ['lead'],
      sourceKeywords: [{ keyword: { name: 'keyword' } }],
    } as unknown as Source & { sourceKeywords: { keyword: Keyword }[] };
    const allKeywords = [
      {
        id: 1 as unknown as bigint,
        name: 'keyword',
        created_at: new Date(),
        is_active: true,
        slug: 'keyword',
        description: null,
      } as Keyword,
    ];
    const result = await scrapSource(entry, allKeywords, context, logger);
    expect(result.articles.length).toBe(0);
  });

  it('returns an empty list if the date is not recent', async () => {
    (isWithinLast24Hours as jest.Mock).mockResolvedValueOnce(false);
    const logger = { info: jest.fn() };
    const dateElement = {
      innerText: jest.fn().mockResolvedValue('2024-01-01'),
    } as unknown as ElementHandle;
    const titleElement = {
      innerText: jest.fn().mockResolvedValue('Test title keyword'),
    } as unknown as ElementHandle;
    const leadElement = {
      innerText: jest.fn().mockResolvedValue('Lead'),
    } as unknown as ElementHandle;
    const container = {
      $(selector: string) {
        if (selector === 'date') return Promise.resolve(dateElement);
        if (selector === 'title') return Promise.resolve(titleElement);
        if (selector === 'lead') return Promise.resolve(leadElement);
        return Promise.resolve(null);
      },
      getAttribute: jest.fn().mockResolvedValue('https://example.com'),
    } as unknown as ElementHandle;
    const page = {
      goto: jest.fn().mockResolvedValue(undefined),
      $: jest.fn(),
      $$: jest
        .fn()
        .mockImplementation((selector: string) =>
          selector === 'container'
            ? Promise.resolve([container])
            : Promise.resolve([]),
        ),
      close: jest.fn(),
    } as unknown as Record<string, unknown>;
    const context = {
      newPage: jest.fn().mockResolvedValue(page),
    } as unknown as BrowserContext;
    const entry = {
      url: 'https://example.com',
      containerSelectors: ['container'],
      dateSelectors: ['date'],
      titleSelectors: ['title'],
      leadSelectors: ['lead'],
      sourceKeywords: [{ keyword: { name: 'keyword' } }],
    } as unknown as Source & { sourceKeywords: { keyword: Keyword }[] };
    const allKeywords = [
      {
        id: 1 as unknown as bigint,
        name: 'keyword',
        created_at: new Date(),
        is_active: true,
        slug: 'keyword',
        description: null,
      } as Keyword,
    ];
    const result = await scrapSource(entry, allKeywords, context, logger);
    expect(result.articles.length).toBe(0);
  });

  it('returns an empty list if an error occurs', async () => {
    const logger = { info: jest.fn() };
    const page = {
      goto: jest.fn().mockRejectedValue(new Error('fail')),
      $: jest.fn(),
      $$: jest.fn().mockResolvedValue([]),
      close: jest.fn(),
    } as unknown as Record<string, unknown>;
    const context = {
      newPage: jest.fn().mockResolvedValue(page),
    } as unknown as BrowserContext;
    const entry = {
      url: 'https://example.com',
      containerSelectors: ['container'],
      dateSelectors: ['date'],
      titleSelectors: ['title'],
      leadSelectors: ['lead'],
      sourceKeywords: [{ keyword: { name: 'keyword' } }],
    } as unknown as Source & { sourceKeywords: { keyword: Keyword }[] };
    const allKeywords = [] as Keyword[];
    const result = await scrapSource(entry, allKeywords, context, logger);
    expect(result.articles.length).toBe(0);
  });

  it('skips an article without a title or date', async () => {
    const logger = { info: jest.fn() };
    const dateElement = null;
    const titleElement = null;
    const leadElement = {
      innerText: jest.fn().mockResolvedValue('Lead'),
    } as unknown as ElementHandle;
    const container = {
      $(selector: string) {
        if (selector === 'date') return Promise.resolve(dateElement);
        if (selector === 'title') return Promise.resolve(titleElement);
        if (selector === 'lead') return Promise.resolve(leadElement);
        return Promise.resolve(null);
      },
      getAttribute: jest.fn().mockResolvedValue('https://example.com'),
    } as unknown as ElementHandle;
    const page = {
      goto: jest.fn().mockResolvedValue(undefined),
      $: jest.fn(),
      $$: jest
        .fn()
        .mockImplementation((selector: string) =>
          selector === 'container'
            ? Promise.resolve([container])
            : Promise.resolve([]),
        ),
      close: jest.fn(),
    } as unknown as Record<string, unknown>;
    const context = {
      newPage: jest.fn().mockResolvedValue(page),
    } as unknown as BrowserContext;
    const entry = {
      url: 'https://example.com',
      containerSelectors: ['container'],
      dateSelectors: ['date'],
      titleSelectors: ['title'],
      leadSelectors: ['lead'],
      sourceKeywords: [{ keyword: { name: 'keyword' } }],
    } as unknown as Source & { sourceKeywords: { keyword: Keyword }[] };
    const allKeywords = [
      {
        id: 1 as unknown as bigint,
        name: 'keyword',
        created_at: new Date(),
        is_active: true,
        slug: 'keyword',
        description: null,
      } as Keyword,
    ];
    const result = await scrapSource(entry, allKeywords, context, logger);
    expect(result.articles.length).toBe(0);
  });

  it('sets a default lead if the element is missing', async () => {
    const logger = { info: jest.fn() };
    const dateElement = {
      innerText: jest.fn().mockResolvedValue('2024-01-01'),
    } as unknown as ElementHandle;
    const titleElement = {
      innerText: jest.fn().mockResolvedValue('Test title keyword'),
    } as unknown as ElementHandle;
    const leadElement = null;
    const container = {
      $(selector: string) {
        if (selector === 'date') return Promise.resolve(dateElement);
        if (selector === 'title') return Promise.resolve(titleElement);
        if (selector === 'lead') return Promise.resolve(leadElement);
        return Promise.resolve(null);
      },
      getAttribute: jest.fn().mockResolvedValue('https://example.com'),
    } as unknown as ElementHandle;
    const page = {
      goto: jest.fn().mockResolvedValue(undefined),
      $: jest.fn(),
      $$: jest
        .fn()
        .mockImplementation((selector: string) =>
          selector === 'container'
            ? Promise.resolve([container])
            : Promise.resolve([]),
        ),
      close: jest.fn(),
    } as unknown as Record<string, unknown>;
    const context = {
      newPage: jest.fn().mockResolvedValue(page),
    } as unknown as BrowserContext;
    const entry = {
      url: 'https://example.com',
      containerSelectors: ['container'],
      dateSelectors: ['date'],
      titleSelectors: ['title'],
      leadSelectors: ['lead'],
      sourceKeywords: [{ keyword: { name: 'keyword' } }],
    } as unknown as Source & { sourceKeywords: { keyword: Keyword }[] };
    const allKeywords = [
      {
        id: 1 as unknown as bigint,
        name: 'keyword',
        created_at: new Date(),
        is_active: true,
        slug: 'keyword',
        description: null,
      } as Keyword,
    ];
    const result = await scrapSource(entry, allKeywords, context, logger);
    expect(result.articles.length).toBe(1);
    expect(result.articles[0].lead).toBe('No description!');
  });

  it('correctly builds an absolute link from a relative link', async () => {
    const logger = { info: jest.fn() };
    const dateElement = {
      innerText: jest.fn().mockResolvedValue('2024-01-01'),
    } as unknown as ElementHandle;
    const titleElement = {
      innerText: jest.fn().mockResolvedValue('Test title keyword'),
    } as unknown as ElementHandle;
    const leadElement = {
      innerText: jest.fn().mockResolvedValue('Lead'),
    } as unknown as ElementHandle;
    const container = {
      $(selector: string) {
        if (selector === 'date') return Promise.resolve(dateElement);
        if (selector === 'title') return Promise.resolve(titleElement);
        if (selector === 'lead') return Promise.resolve(leadElement);
        return Promise.resolve(null);
      },
      getAttribute: jest.fn().mockResolvedValue('/artykul/123'),
    } as unknown as ElementHandle;
    const page = {
      goto: jest.fn().mockResolvedValue(undefined),
      $: jest.fn(),
      $$: jest
        .fn()
        .mockImplementation((selector: string) =>
          selector === 'container'
            ? Promise.resolve([container])
            : Promise.resolve([]),
        ),
      close: jest.fn(),
    } as unknown as Record<string, unknown>;
    const context = {
      newPage: jest.fn().mockResolvedValue(page),
    } as unknown as BrowserContext;
    const entry = {
      url: 'https://example.com',
      containerSelectors: ['container'],
      dateSelectors: ['date'],
      titleSelectors: ['title'],
      leadSelectors: ['lead'],
      sourceKeywords: [{ keyword: { name: 'keyword' } }],
    } as unknown as Source & { sourceKeywords: { keyword: Keyword }[] };
    const allKeywords = [
      {
        id: 1 as unknown as bigint,
        name: 'keyword',
        created_at: new Date(),
        is_active: true,
        slug: 'keyword',
        description: null,
      } as Keyword,
    ];
    const result = await scrapSource(entry, allKeywords, context, logger);
    expect(result.articles.length).toBe(1);
    expect(result.articles[0].link).toBe('https://example.com/artykul/123');
  });

  it('adds all matching keywords', async () => {
    const logger = { info: jest.fn() };
    const dateElement = {
      innerText: jest.fn().mockResolvedValue('2024-01-01'),
    } as unknown as ElementHandle;
    const titleElement = {
      innerText: jest.fn().mockResolvedValue('foo bar'),
    } as unknown as ElementHandle;
    const leadElement = {
      innerText: jest.fn().mockResolvedValue('Lead'),
    } as unknown as ElementHandle;
    const container = {
      $(selector: string) {
        if (selector === 'date') return Promise.resolve(dateElement);
        if (selector === 'title') return Promise.resolve(titleElement);
        if (selector === 'lead') return Promise.resolve(leadElement);
        return Promise.resolve(null);
      },
      getAttribute: jest.fn().mockResolvedValue('https://example.com'),
    } as unknown as ElementHandle;
    const page = {
      goto: jest.fn().mockResolvedValue(undefined),
      $: jest.fn(),
      $$: jest
        .fn()
        .mockImplementation((selector: string) =>
          selector === 'container'
            ? Promise.resolve([container])
            : Promise.resolve([]),
        ),
      close: jest.fn(),
    } as unknown as Record<string, unknown>;
    const context = {
      newPage: jest.fn().mockResolvedValue(page),
    } as unknown as BrowserContext;
    const entry = {
      url: 'https://example.com',
      containerSelectors: ['container'],
      dateSelectors: ['date'],
      titleSelectors: ['title'],
      leadSelectors: ['lead'],
      sourceKeywords: [
        { keyword: { name: 'foo' } },
        { keyword: { name: 'bar' } },
      ],
    } as unknown as Source & { sourceKeywords: { keyword: Keyword }[] };
    const allKeywords = [
      {
        id: 1 as unknown as bigint,
        name: 'foo',
        created_at: new Date(),
        is_active: true,
        slug: 'foo',
        description: null,
      } as Keyword,
      {
        id: 2 as unknown as bigint,
        name: 'bar',
        created_at: new Date(),
        is_active: true,
        slug: 'bar',
        description: null,
      } as Keyword,
    ];
    const result = await scrapSource(entry, allKeywords, context, logger);
    expect(result.articles.length).toBe(1);
    expect(result.articles[0].keywordIds).toEqual(
      expect.arrayContaining([1, 2]),
    );
  });
});
