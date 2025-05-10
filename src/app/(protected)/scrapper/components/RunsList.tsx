'use client';

import { ScrapperRun } from '@prisma/client';
import { format } from 'date-fns';
import { useEffect } from 'react';

import getPreviousRuns from '@/utils/db/queries/getPreviousRuns';
import { createClient } from '@/utils/supabase/client';

type RunsListProps = {
  runs: ScrapperRun[] | null;
  onFetchMore: typeof getPreviousRuns;
  onRevalidate: () => Promise<void>;
};

const client = createClient();

const RunsList = ({ runs, onRevalidate }: RunsListProps) => {
  const runsNotificationsChannel = client.channel('runs-notifications');

  useEffect(() => {
    // revalidate runs list on the backend when run-completed event is received
    runsNotificationsChannel.on('broadcast', { event: 'run-completed' }, () => {
      onRevalidate();
    });
  }, [onRevalidate, runsNotificationsChannel]);

  const formatDate = (date: string | Date) => {
    return format(new Date(date), 'dd.MM.yyyy HH:mm:ss');
  };

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
              <td>{formatDate(run.created_at)}</td>
              <td>{run.finished_at ? formatDate(run.finished_at) : '-'}</td>
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
