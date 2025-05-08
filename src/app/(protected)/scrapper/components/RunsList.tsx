import { ScrapperRun } from '@prisma/client';

import getPreviousRuns from '@/utils/db/queries/getPreviousRuns';

type RunsListProps = {
  runs: ScrapperRun[] | null;
  onFetchMore: typeof getPreviousRuns;
};

const RunsList = ({ runs }: RunsListProps) => {
  return (
    <div>
      <h3 className="text-lg font-bold mt-1 mb-2">
        Poprzednie uruchomienia scrappera
      </h3>

      <table className="table">
        <thead>
          <tr>
            <th>Data wywołania</th>
            <th>Data zakończenia</th>
            <th>Status</th>
            <th>Ilość wczytanych artykułów</th>
          </tr>
        </thead>
        <tbody>
          {runs?.map((run) => (
            <tr key={run.id}>
              <td>{run.created_at.toLocaleString()}</td>
              <td>{run.finished_at?.toLocaleString()}</td>
              <td>{run.errored_at ? 'Błąd' : 'Sukces'}</td>
              <td>{run.upserted_articles}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RunsList;
