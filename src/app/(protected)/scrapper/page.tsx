import { revalidatePath } from 'next/cache';

import getCurrentRun from '@/utils/db/queries/getCurrentRun';
import getLastRun from '@/utils/db/queries/getLastRun';
import getPreviousRuns from '@/utils/db/queries/getPreviousRuns';
import getRunById from '@/utils/db/queries/getRunById';

import { runPlaywrightScript } from './actions/run-playwright-script';
import RunScrapper from './components/RunScrapper';
import RunsList from './components/RunsList';

export default async function ScrapperPage() {
  const existingRun = await getCurrentRun();
  const lastRun = await getLastRun();
  const previousRuns = await getPreviousRuns({ limit: 10, offset: 0 });

  const revalidate = async () => {
    'use server';
    revalidatePath('/scrapper');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Scrapper</h1>
      <RunScrapper
        onRunScrapper={runPlaywrightScript}
        onGetExistingRun={getCurrentRun}
        onGetLastRun={getLastRun}
        onGetRunById={getRunById}
        runningJob={!existingRun?.errored_at ? existingRun : null}
        lastRun={lastRun}
      />
      <RunsList
        runs={previousRuns}
        onFetchMore={getPreviousRuns}
        onRevalidate={revalidate}
      />
    </div>
  );
}
