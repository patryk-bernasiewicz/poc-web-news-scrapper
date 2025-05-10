import { Keyword, Source } from '@prisma/client';
import * as playwright from 'playwright';
import slugify from 'slugify';

import prisma from '@/lib/prisma';
import getRunById from '@/utils/db/queries/getRunById';
import updateRunCompleted from '@/utils/db/queries/updateRunCompleted';
import type { UpsertArticleDTO } from '@/utils/db/queries/upsertArticles';
import upsertArticles from '@/utils/db/queries/upsertArticles';

import { createLogger } from '../utils/create-logger';
import { isWithinLast24Hours } from './utils/is-within-24-hours';
import { notifyRunCompleted, notifyRunCreated } from './utils/notify';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

(async () => {
  const logger = createLogger('scrap-web');

  const runId = BigInt(process.argv[3]);
  await notifyRunCreated(runId.toString());

  const run = await getRunById(runId);
  if (!run) {
    throw new Error('Run not found in db');
  }

  const browser = await playwright.chromium.launch();
  // Global set to keep track of processed slugs across all parallel tasks
  const globalProcessedSlugs = new Set<string>();

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

  const scrapingPromises = pages.map(async (entry) => {
    // Extract keywords for this source (as string[])
    const sourceKeywords = (entry.sourceKeywords as { keyword: Keyword }[]).map(
      (sk) => sk.keyword.name.toLowerCase(),
    );
    const siteSpecificArticles: (UpsertArticleDTO & {
      keywordIds: number[];
    })[] = [];
    const context = await browser.newContext(); // Create a new context for each site
    const page = await context.newPage(); // Create a new page for each site
    let articlesProcessed = 0; // Counter for limiting articles per site

    try {
      logger.info(`\n--- Starting scrape for ${entry.url} ---`);
      // Increased timeout for page navigation and selector, and ensure DOM is loaded
      await page.goto(entry.url, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });
      logger.info(`Visited ${entry.url}`);

      // Fallback: find the first selector that returns containers
      let containers: playwright.ElementHandle[] = [];
      for (const selector of entry.containerSelectors) {
        containers = await page.$$(selector);
        if (containers.length > 0) break;
      }
      if (containers.length === 0) {
        logger.info(`No containers found for ${entry.url}`);
        return [];
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
        // Fallback: find the first selector that returns an element
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
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (_e) {
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

        // --- Generate Slug ---
        const slug = slugify(titleText, {
          lower: true,
          strict: true,
          remove: /[*+~.()'"!:@]/g,
        });

        if (globalProcessedSlugs.has(slug)) {
          continue;
        }

        // --- Date Check ---
        const isRecent = isWithinLast24Hours(dateText, entry);
        if (!isRecent) {
          continue;
        }

        // --- Keyword Check ---
        const combinedText = `${titleText} ${leadText}`.toLowerCase();
        // Check which keywords from this source are present in the article
        const matchedKeywords = sourceKeywords.filter((keyword: string) =>
          combinedText.includes(keyword),
        );
        if (matchedKeywords.length === 0) {
          continue;
        }
        // Find the ids of these keywords in allKeywords
        const keywordIds = allKeywords
          .filter((k) => matchedKeywords.includes(k.name.toLowerCase()))
          .map((k) => (typeof k.id === 'bigint' ? Number(k.id) : k.id));

        // --- Add Article ---
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
        globalProcessedSlugs.add(slug); // Add to global set to prevent duplicates across sites
        articlesProcessed++;
      }
      logger.info(
        `Finished processing ${entry.url}. Found ${siteSpecificArticles.length} matching articles for this site.`,
      );
      return siteSpecificArticles; // Return articles found for this specific site
    } catch (error) {
      logger.info(
        `Error processing ${entry.url}: ${error instanceof Error ? error.stack || error.message : String(error)}`,
      );
      return []; // Return an empty array if an error occurs for this site
    } finally {
      // Ensure page and context are closed for this specific task
      if (page) await page.close();
      if (context) await context.close();
      logger.info(`--- Context closed for ${entry.url} ---`);
    }
  });

  // Wait for all scraping tasks to complete
  const resultsFromAllSites = await Promise.all(scrapingPromises);

  // Flatten the array of arrays into a single array of articles
  const allFoundArticles = resultsFromAllSites.flat();

  await browser.close(); // Close the browser instance once all tasks are done

  logger.info('--- Scraping Complete ---');
  logger.info(
    `Total matching articles found across all sites: ${allFoundArticles.length}`,
  );

  // Upsert articles to the db and return output for the run
  let upsertedCount = 0;
  try {
    // Pass keywordIds to upsertArticles and handle many-to-many relation in this function
    const upsertedArticles = await upsertArticles(allFoundArticles);

    upsertedCount = upsertedArticles.length;

    // Outputting as JSON for potential further processing
    if (upsertedArticles.length > 0) {
      logger.info(`--- Upserted ${upsertArticles.length} Articles (JSON) ---`);
    } else {
      logger.info(
        'No new articles matching the criteria were found across any sites.',
      );
    }
  } catch (err) {
    logger.info(
      `Error while updating the database: ${err instanceof Error ? err.stack || err.message : String(err)}`,
    );
  }

  // Update run in the db
  try {
    if (!run) {
      throw new Error('Run not found');
    }

    logger.info(`Updating ScrapperRun by ID: ${run.id}`);
    const updatedRun = await updateRunCompleted(run.id, upsertedCount);
    logger.info(
      `Should be updated 🤷‍♂️ Start: ${updatedRun?.created_at} End: ${updatedRun?.finished_at}`,
    );
  } catch (err) {
    logger.info(
      `Error while updating ScrapperRun: ${err instanceof Error ? err.stack || err.message : String(err)}`,
    );
  }

  try {
    await notifyRunCompleted(run.id.toString(), upsertedCount);
  } catch (error) {
    logger.info(
      `Error sending run-completed notification: ${error instanceof Error ? error.stack || error.message : String(error)}`,
    );
  }
})();
