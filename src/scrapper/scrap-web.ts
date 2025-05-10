import * as playwright from 'playwright';

import getRunById from '@/utils/db/queries/getRunById';
import updateRunCompleted from '@/utils/db/queries/updateRunCompleted';
import upsertArticles from '@/utils/db/queries/upsertArticles';

import { createLogger } from '../utils/create-logger';
import { scrapAllSources } from './services/scrap-all-sources';
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
  if (!run) throw new Error('Run not found in db');
  const browser = await playwright.chromium.launch();
  // --- SCRAP ALL SOURCES ---
  const allFoundArticles = await scrapAllSources(logger, browser);
  await browser.close();
  logger.info('--- Scraping Complete ---');
  logger.info(
    `Total matching articles found across all sites: ${allFoundArticles.length}`,
  );
  // --- UPSERT ARTICLES ---
  let upsertedCount = 0;
  try {
    const upsertedArticles = await upsertArticles(allFoundArticles);
    upsertedCount = upsertedArticles.length;
    if (upsertedArticles.length > 0) {
      logger.info(
        `--- Upserted ${upsertedArticles.length} Articles (JSON) ---`,
      );
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
  // --- UPDATE RUN ---
  try {
    if (!run) throw new Error('Run not found');
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
  // --- NOTIFY ---
  try {
    await notifyRunCompleted(run.id.toString(), upsertedCount);
  } catch (error) {
    logger.info(
      `Error sending run-completed notification: ${error instanceof Error ? error.stack || error.message : String(error)}`,
    );
  }
})();
