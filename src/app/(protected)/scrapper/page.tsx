import { runPlaywrightScript } from './actions';
import RunScrapper from './RunScrapper';

export default async function ScrapperPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Scrapper</h1>
      <RunScrapper onRunScrapper={runPlaywrightScript} />
    </div>
  );
}
