'use client';

import type { ScrapperRun } from '@prisma/client';
import { format } from 'date-fns';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';

import AnimatedDots from '@/components/ui/AnimatedDots';
import { Button } from '@/components/ui/Button';
import createRun from '@/utils/db/queries/createRun';

import { ScrapperDto } from '../dtos/scrapper.dto';
import { SerializableScrapperRun } from '../types';

/* eslint-disable @typescript-eslint/no-explicit-any */

type RunScrapperProps = {
  onRunScrapper: (runId: bigint) => Promise<any>;
  onGetExistingRun: () => Promise<ScrapperRun | null>;
  onGetLastRun: () => Promise<ScrapperRun | null>;
  onGetRunById: (runId: bigint) => Promise<ScrapperRun | null>;
  runningJob: ScrapperRun | null;
  lastRun: ScrapperRun | null;
};

export default function RunScrapper({
  onRunScrapper,
  onGetExistingRun,
  onGetLastRun,
  onGetRunById,
  runningJob: runningJobServer,
  lastRun: lastRunServer,
}: RunScrapperProps) {
  const [runningJob, setRunningJob] = useState<SerializableScrapperRun | null>(
    runningJobServer ? ScrapperDto.fromServer(runningJobServer) : null,
  );
  const [lastRun, setLastRun] = useState<SerializableScrapperRun | null>(
    lastRunServer ? ScrapperDto.fromServer(lastRunServer) : null,
  );
  const [isPending, startTransition] = useTransition();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lastRunFormattedDate = useMemo(() => {
    return lastRun?.finished_at
      ? format(lastRun.finished_at, 'dd.MM.yyyy HH:mm:ss')
      : null;
  }, [lastRun?.finished_at]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      (async () => {
        const existingRun = await onGetExistingRun();
        if (existingRun && !existingRun.errored_at) {
          setRunningJob(ScrapperDto.fromServer(existingRun));
        } else {
          setRunningJob(null);
          const lastRun = await onGetLastRun();
          if (lastRun) {
            setLastRun(ScrapperDto.fromServer(lastRun));
          }
        }
      })();
    }, 5000);

    return () => clearInterval(timerRef.current!);
  }, [onGetExistingRun, onGetLastRun]);

  const handleRunScrapper = async () => {
    setError(null);

    const existingRun = await onGetExistingRun();
    if (existingRun && !existingRun.errored_at) {
      setRunningJob(ScrapperDto.fromServer(existingRun));
    } else {
      startTransition(async () => {
        let currentRun: ScrapperRun | undefined | null;
        try {
          const run = await createRun();

          if (!run) {
            throw new Error('Run not created');
          }

          setRunningJob(ScrapperDto.fromServer(run));

          await onRunScrapper(run.id);

          currentRun = await onGetRunById(run.id);

          if (currentRun?.errored_at) {
            setError(
              'Wystąpił błąd podczas wykonywania zadania. Sprawdź konsolę.',
            );
            return;
          }
        } catch (err) {
          console.error(err);
        }
      });
    }
  };

  return (
    <>
      <Button
        type="button"
        disabled={!!runningJob || isPending}
        onClick={handleRunScrapper}
      >
        {runningJob ? (
          <span>
            Scrapper pracuje
            <AnimatedDots />
          </span>
        ) : (
          'Wywołaj scrapper'
        )}
      </Button>
      {lastRunFormattedDate && (
        <div className="text-xl font-medium text-green-500">
          Ostatni pomyślny scrap: {lastRunFormattedDate}
        </div>
      )}
      <div>
        {runningJob && (
          <pre>
            {JSON.stringify(
              {
                created_at: runningJob.created_at,
                isRunningJob: !!runningJob,
                isPending,
              },
              null,
              2,
            )}
          </pre>
        )}
      </div>
      {error && <div className="text-red-500">{error}</div>}
    </>
  );
}
