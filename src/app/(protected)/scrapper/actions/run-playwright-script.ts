'use server';

import getRunById from '@/utils/db/queries/getRunById';
import setRunError from '@/utils/db/queries/setRunError';

import execScrapper from '../lib/execScrapper';

export async function runPlaywrightScript(runId: bigint): Promise<void> {
  const run = await getRunById(runId);

  if (!run) {
    throw new Error('Run not created');
  }

  try {
    const result = await execScrapper(run.id);

    if (result.stderr) {
      throw new Error(result.stderr);
    }
  } catch (error) {
    console.error('run-playwright-script error', error);
    if (run) {
      await setRunError(run.id);
    }
  }
}
