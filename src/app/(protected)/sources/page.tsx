import { getSources } from './actions/get-sources';
import { SourcesTable } from './components/SourcesTable';

export default async function SourcesPage() {
  const sources = await getSources();
  return <SourcesTable sources={sources} />;
}
