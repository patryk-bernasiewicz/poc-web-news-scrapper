import { Keyword, Source } from '@prisma/client';
import { BrowserContext, ElementHandle } from 'playwright';
import slugify from 'slugify';

import { UpsertArticleDTO } from '@/utils/db/queries/upsertArticles';

import { isWithinLast24Hours } from '../utils/is-within-24-hours';

export interface ScrapSourceResult {
  articles: (UpsertArticleDTO & { keywordIds: number[] })[];
}

interface Logger {
  info: (msg: string) => void;
}

export async function scrapSource(
  entry: Source & { sourceKeywords: { keyword: Keyword }[] },
  allKeywords: Keyword[],
  context: BrowserContext,
  logger: Logger,
): Promise<ScrapSourceResult> {
  const sourceKeywords = (entry.sourceKeywords as { keyword: Keyword }[]).map(
    (sk) => sk.keyword.name.toLowerCase(),
  );
  const siteSpecificArticles: (UpsertArticleDTO & { keywordIds: number[] })[] =
    [];
  const page = await context.newPage();
  let articlesProcessed = 0;

  try {
    logger.info(`\n--- Starting scrape for ${entry.url} ---`);
    await page.goto(entry.url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    logger.info(`Visited ${entry.url}`);

    let containers: ElementHandle[] = [];
    for (const selector of entry.containerSelectors) {
      containers = await page.$$(selector);
      if (containers.length > 0) break;
    }
    if (containers.length === 0) {
      logger.info(`No containers found for ${entry.url}`);
      return { articles: [] };
    }
    logger.info(
      `Found ${containers.length} potential article containers on ${entry.url}.`,
    );

    for (const container of containers) {
      if (articlesProcessed >= 10) {
        logger.info(`Processed limit (10) reached for ${entry.url}.`);
        break;
      }
      // --- Extract Data ---
      let dateElement = null;
      for (const selector of entry.dateSelectors) {
        dateElement = await container.$(selector);
        if (dateElement) break;
      }
      let titleElement = null;
      for (const selector of entry.titleSelectors) {
        titleElement = await container.$(selector);
        if (titleElement) break;
      }
      let leadElement = null;
      for (const selector of entry.leadSelectors) {
        leadElement = await container.$(selector);
        if (leadElement) break;
      }
      let link: string | undefined | null =
        await container.getAttribute('href');
      if (!link) {
        const linkElement = await container.$('a');
        link = await linkElement?.getAttribute('href');
      }
      if (link && !link.startsWith('http')) {
        try {
          const urlObject = new URL(link, entry.url);
          link = urlObject.href;
        } catch {
          logger.info(
            `Could not construct absolute URL for link: ${link} on ${entry.url}`,
          );
          link = undefined;
        }
      } else if (link === null) {
        link = undefined;
      }
      if (!dateElement || !titleElement) {
        continue;
      }
      const dateText = (await dateElement.innerText()).trim();
      const titleText =
        (await titleElement.innerText()).trim() || 'Unknown title!';
      const leadText =
        (await leadElement?.innerText())?.trim() || 'No description!';
      const slug = slugify(titleText, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
      });
      // --- Date Check ---
      const isRecent = await isWithinLast24Hours(dateText, entry);
      if (!isRecent) continue;
      // --- Keyword Check ---
      const combinedText = `${titleText} ${leadText}`.toLowerCase();
      const matchedKeywords = sourceKeywords.filter((keyword: string) =>
        combinedText.includes(keyword),
      );
      if (matchedKeywords.length === 0) continue;
      const keywordIds = allKeywords
        .filter((k) => matchedKeywords.includes(k.name.toLowerCase()))
        .map((k) => (typeof k.id === 'bigint' ? Number(k.id) : k.id));
      logger.info(
        `MATCH FOUND on ${entry.url}: "${titleText}" (Date: ${dateText}, Link: ${link || 'N/A'}) `,
      );
      logger.info(`Keywords for article: ${keywordIds}`);
      const publishDate = !isNaN(new Date(dateText).getTime())
        ? new Date(dateText).toISOString()
        : new Date().toISOString();
      const article: UpsertArticleDTO & { keywordIds: number[] } = {
        title: titleText,
        lead: leadText,
        link: link || '',
        slug,
        publish_date: publishDate,
        keywordIds,
      };
      siteSpecificArticles.push(article);
      articlesProcessed++;
    }
    logger.info(
      `Finished processing ${entry.url}. Found ${siteSpecificArticles.length} matching articles for this site.`,
    );
    return { articles: siteSpecificArticles };
  } catch (error) {
    logger.info(
      `Error processing ${entry.url}: ${error instanceof Error ? error.stack || error.message : String(error)}`,
    );
    return { articles: [] };
  } finally {
    if (page) await page.close();
    logger.info(`--- Context closed for ${entry.url} ---`);
  }
}
