import { subHours } from 'date-fns';
import * as playwright from 'playwright';
import slugify from 'slugify';

import getCurrentRun from '@/utils/db/queries/getCurrentRun';
import updateRunCompleted from '@/utils/db/queries/updateRunCompleted';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

interface PageConfig {
  url: string;
  containerSelector: string;
  dateSelector: string;
  titleSelector: string;
  leadSelector: string;
  // Removed dateFormat
  dateString?: string; // Optional: e.g., 'dzisiaj', 'today'
}

const pages: PageConfig[] = [
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

// Helper function to check if a date string indicates publication within the last 24 hours
const isWithinLast24Hours = async (
  dateText: string,
  entry: PageConfig,
): Promise<boolean> => {
  // 1. Check for dateString match first if provided
  if (entry.dateString) {
    const stringMatch = dateText
      .toLowerCase()
      .includes(entry.dateString.toLowerCase());
    // console.log(`Checking string "${entry.dateString}" in "${dateText}": ${stringMatch}`);
    if (stringMatch) {
      return true; // Found the specified string, assume recent enough
    }
    // If dateString is provided but doesn't match, we might want to stop here
    // depending on desired logic. Current logic falls through to generic check.
  }

  // 2. If no dateString match (or no dateString provided), try generic parsing
  let articleDate: Date | null = null;
  try {
    const genericParsed = new Date(dateText);
    // Check if generic parsing resulted in a valid date
    if (!isNaN(genericParsed.getTime())) {
      articleDate = genericParsed;
      // console.log(`Parsed generically: ${articleDate}`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_e) {
    // Ignore errors from generic parsing
  }

  // 3. Check if parsed date is within the last 24 hours
  if (articleDate) {
    const now = new Date();
    const twentyFourHoursAgo = subHours(now, 24);
    // Check if the parsed date falls within the interval [24 hours ago, now]
    const isRecent = articleDate >= twentyFourHoursAgo && articleDate <= now;
    // console.log(`Date ${articleDate} is recent: ${isRecent}`);
    if (isRecent) {
      return true; // Date is valid and within the last 24 hours
    }
  }

  // console.log(`Date "${dateText}" did not meet criteria.`);
  return false; // Default to false if no condition is met
};

type FoundArticle = {
  title: string;
  lead: string;
  publishedDate: string; // Added publishedDate
  confidence: number;
  link?: string;
  slug: string;
};

// Add the new IIFE for parallel scraping:
(async () => {
  // --- LOG FILE SETUP ---
  const fs = await import('fs');
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  const logFilename = `output-${dateStr}.txt`;
  const logStream = fs.createWriteStream(logFilename, { flags: 'a' });

  const run = await getCurrentRun();

  function logToFile(...args: unknown[]) {
    logStream.write(
      args
        .map((a) => (typeof a === 'string' ? a : JSON.stringify(a)))
        .join(' ') + '\n',
    );
  }

  const browser = await playwright.chromium.launch();
  // Global set to keep track of processed slugs across all parallel tasks
  const globalProcessedSlugs = new Set<string>();

  const scrapingPromises = pages.map(async (entry) => {
    const siteSpecificArticles: FoundArticle[] = [];
    const context = await browser.newContext(); // Create a new context for each site
    const page = await context.newPage(); // Create a new page for each site
    let articlesProcessed = 0; // Counter for limiting articles per site

    try {
      logToFile(`\\n--- Starting scrape for ${entry.url} ---`); // Changed from console.log
      // Increased timeout for page navigation and selector, and ensure DOM is loaded
      await page.goto(entry.url, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });
      logToFile(`Visited ${entry.url}`); // Changed from console.log

      await page.waitForSelector(entry.containerSelector, {
        timeout: 15000, // Adjusted timeout
      });

      const containers = await page.$$(entry.containerSelector);
      logToFile(
        // Changed from console.log
        `Found ${containers.length} potential article containers on ${entry.url}.`,
      );

      for (const container of containers) {
        if (articlesProcessed >= 10) {
          logToFile(`Processed limit (10) reached for ${entry.url}.`); // Changed from console.log
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
            logToFile(
              // Kept as logToFile
              `Could not construct absolute URL for link: ${link} on ${entry.url}`,
            );
            link = undefined;
          }
        } else if (link === null) {
          link = undefined;
        }

        if (!dateElement || !titleElement) {
          // console.log(\`Skipping container on ${entry.url}: Missing date or title element.\`);
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

        // Avoid processing duplicates based on the global slug set
        if (globalProcessedSlugs.has(slug)) {
          // console.log(\`Skipping duplicate article (slug already processed globally): ${titleText} on ${entry.url}\`);
          continue;
        }

        // --- Date Check ---
        const isRecent = isWithinLast24Hours(dateText, entry);
        if (!isRecent) {
          // console.log(\`Skipping article (not recent) on ${entry.url}: ${titleText} | Date: ${dateText}\`);
          continue;
        }

        // --- Keyword Check ---
        const combinedText = `${titleText} ${leadText}`.toLowerCase();
        const keywordFound = keywords.some((keyword) =>
          combinedText.includes(keyword.toLowerCase()),
        );

        if (!keywordFound) {
          // console.log(\`Skipping article (no keywords) on ${entry.url}: ${titleText}\`);
          continue;
        }

        // --- Add Article ---
        logToFile(
          // Changed from console.log
          `MATCH FOUND on ${entry.url}: "${titleText}" (Date: ${dateText}, Link: ${link || 'N/A'}) `,
        );
        siteSpecificArticles.push({
          title: titleText,
          lead: leadText,
          publishedDate: dateText,
          confidence: 0,
          link: link || undefined,
          slug,
        });
        globalProcessedSlugs.add(slug); // Add to global set to prevent duplicates across sites
        articlesProcessed++;
      }
      logToFile(
        // Changed from console.log
        `Finished processing ${entry.url}. Found ${siteSpecificArticles.length} matching articles for this site.`,
      );
      return siteSpecificArticles; // Return articles found for this specific site
    } catch (error) {
      logToFile(`Error processing ${entry.url}:`, error); // Changed from console.error
      return []; // Return an empty array if an error occurs for this site
    } finally {
      // Ensure page and context are closed for this specific task
      if (page) await page.close();
      if (context) await context.close();
      logToFile(`--- Context closed for ${entry.url} ---`); // Changed from console.log
    }
  });

  // Wait for all scraping tasks to complete
  const resultsFromAllSites = await Promise.all(scrapingPromises);

  // Flatten the array of arrays into a single array of articles
  const allFoundArticles = resultsFromAllSites.flat();

  await browser.close(); // Close the browser instance once all tasks are done

  logToFile('\\n--- Scraping Complete ---'); // Changed from console.log
  logToFile(
    // Changed from console.log
    `Total matching articles found across all sites: ${allFoundArticles.length}`,
  );
  // Outputting as JSON for potential further processing
  if (allFoundArticles.length > 0) {
    logToFile('\\n--- Found Articles (JSON) ---'); // Changed from console.log, header for JSON to stderr
    console.log(JSON.stringify(allFoundArticles, null, 2)); // Actual JSON data to stdout
  } else {
    logToFile(
      // Informational message to stderr
      'No articles matching the criteria were found across any sites.',
    );
    console.log(JSON.stringify([], null, 2)); // Empty JSON array to stdout
  }

  try {
    if (!run) {
      throw new Error('Run not found');
    }

    logToFile('Aktualizuję scrapper_runs po ID: ', run.id);
    const updatedRun = await updateRunCompleted(run.id);
    logToFile(
      `Powinno się zaktualizować 🤷‍♂️ Start: ${updatedRun?.created_at} End: ${updatedRun?.finished_at}`,
    );
  } catch (err) {
    logToFile(
      'Błąd przy aktualizacji scrapper_runs:',
      err instanceof Error ? err.stack || err.message : err,
    );
  }

  // Zamknięcie strumienia logów
  logStream.end();
})();
