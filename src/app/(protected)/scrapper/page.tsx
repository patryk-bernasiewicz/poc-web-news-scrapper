import getCurrentRun from '@/utils/db/queries/getCurrentRun';

import RunScrapper from './RunScrapper';
import { runPlaywrightScript } from './actions';

export default async function ScrapperPage() {
  const existingRun = await getCurrentRun();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Scrapper</h1>
      <RunScrapper
        onRunScrapper={runPlaywrightScript}
        onGetExistingRun={getCurrentRun}
        runningJob={existingRun}
      />
    </div>
  );
}
