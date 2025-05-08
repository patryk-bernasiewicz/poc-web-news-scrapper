import * as playwright from 'playwright';
import slugify from 'slugify';

import { ScrappedPageConfig } from '@/app/(protected)/scrapper/types';
import getRunById from '@/utils/db/queries/getRunById';
import updateRunCompleted from '@/utils/db/queries/updateRunCompleted';
import upsertArticles, {
  UpsertArticleDTO,
} from '@/utils/db/queries/upsertArticles';

import { createLogger } from '../utils/create-logger';
import { isWithinLast24Hours } from './utils/is-within-24-hours';
import { notifyRunCompleted, notifyRunCreated } from './utils/notify';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

const pages: ScrappedPageConfig[] = [
  {
    url: 'https://podatki.gazetaprawna.pl/',
    containerSelector: 'div.listItem', // Adjust if needed
    dateSelector: 'time.datePublished', // Adjust if needed
    titleSelector: 'div.itemTitle', // Adjust if needed
    leadSelector: 'p.lead', // Adjust if needed
    // Provide dateString for specific text check, or nothing for generic time check
    dateString: 'dzisiaj', // Example string check
  },
  {
    url: 'https://www.prawo.pl/podatki/aktualnosci/',
    containerSelector: 'article.article', // Adjust if needed
    dateSelector: 'span.date', // Adjust if needed
    titleSelector: 'h2.title', // Adjust if needed
    leadSelector: 'p.desc', // Adjust if needed
  },
  {
    url: 'https://www.pit.pl/aktualnosci/',
    containerSelector: 'article.article', // Adjust if needed
    dateSelector: 'time[datetime]',
    titleSelector: '.col-article > h2',
    leadSelector: '.col-article > p', // Adjust if needed
    dateString: ' temu', // Example string check
  },
];
const keywords = ['podatki', 'podatkowe', 'zmiany', 'vat', 'pit', 'ustawa'];

(async () => {
  const logger = createLogger('scrap-web');

  const runId = BigInt(process.argv[3]);

  await notifyRunCreated(runId.toString());

  const run = await getRunById(runId);
  if (!run) {
    throw new Error('Run not found in db');
  }

  // logger.info(`Przeszukuję strony: ${JSON.stringify(pages)}`);
  // logger.info(`Poszukuję słów kluczowych: ${JSON.stringify(keywords)}`);

  const browser = await playwright.chromium.launch();
  // Global set to keep track of processed slugs across all parallel tasks
  const globalProcessedSlugs = new Set<string>();

  const scrapingPromises = pages.map(async (entry) => {
    const siteSpecificArticles: UpsertArticleDTO[] = [];
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

      await page.waitForSelector(entry.containerSelector, {
        timeout: 15000, // Adjusted timeout
      });

      const containers = await page.$$(entry.containerSelector);
      logger.info(
        `Found ${containers.length} potential article containers on ${entry.url}.`,
      );

      for (const container of containers) {
        if (articlesProcessed >= 10) {
          logger.info(`Processed limit (10) reached for ${entry.url}.`);
          break;
        }

        // --- Extract Data ---
        const dateElement = await container.$(entry.dateSelector);
        const titleElement = await container.$(entry.titleSelector);
        const leadElement = await container.$(entry.leadSelector);
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
          (await titleElement.innerText()).trim() || 'Nieznany tytuł!';
        const leadText =
          (await leadElement?.innerText())?.trim() || 'Brak opisu!';

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
        const keywordFound = keywords.some((keyword) =>
          combinedText.includes(keyword.toLowerCase()),
        );

        if (!keywordFound) {
          continue;
        }

        // --- Add Article ---
        logger.info(
          `MATCH FOUND on ${entry.url}: "${titleText}" (Date: ${dateText}, Link: ${link || 'N/A'}) `,
        );

        const article: UpsertArticleDTO = {
          title: titleText,
          lead: leadText,
          link: link || '',
          slug,
          publish_date: !isNaN(new Date(dateText).getTime())
            ? new Date(dateText)
            : new Date(),
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
    const upsertedArticles = await upsertArticles(allFoundArticles);
    upsertedCount = upsertedArticles.length;

    // Outputting as JSON for potential further processing
    if (upsertedArticles.length > 0) {
      logger.info('--- Found Articles (JSON) ---');
      console.log(JSON.stringify({ upsertedCount, upsertedArticles }));
    } else {
      logger.info(
        'No new articles matching the criteria were found across any sites.',
      );
    }
  } catch (err) {
    logger.info(
      `Błąd przy aktualizacji bazy danych: ${err instanceof Error ? err.stack || err.message : String(err)}`,
    );
  }

  // Update run in the db
  try {
    if (!run) {
      throw new Error('Run not found');
    }

    logger.info(`Aktualizuję ScrapperRun po ID: ${run.id}`);
    const updatedRun = await updateRunCompleted(run.id, upsertedCount);
    logger.info(
      `Powinno się zaktualizować 🤷‍♂️ Start: ${updatedRun?.created_at} End: ${updatedRun?.finished_at}`,
    );
  } catch (err) {
    logger.info(
      `Błąd przy aktualizacji ScrapperRun: ${err instanceof Error ? err.stack || err.message : String(err)}`,
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
