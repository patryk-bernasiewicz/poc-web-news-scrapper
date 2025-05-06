'use client';

import { scrapper_runs } from '@prisma/client';
import { useEffect, useRef, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import prisma from '@/lib/prisma';
import getCurrentRun from '@/utils/db/queries/getCurrentRun';

/* eslint-disable @typescript-eslint/no-explicit-any */

type RunScrapperProps = {
  onRunScrapper: (script: string) => Promise<any>;
  onGetExistingRun: () => Promise<any>;
  runningJob: scrapper_runs | null;
};

export default function RunScrapper({
  onRunScrapper,
  onGetExistingRun,
  runningJob: runningJobServer,
}: RunScrapperProps) {
  const [runningJob, setRunningJob] = useState<any>(runningJobServer);
  const [isPending, startTransition] = useTransition();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    timerRef.current = setInterval(() => {
      (async () => {
        const existingRun = await onGetExistingRun();
        console.log('existingRun in timer', existingRun);
        if (existingRun) {
          setRunningJob(existingRun);
        } else {
          setRunningJob(null);
        }
      })();
    }, 5000);

    return () => clearInterval(timerRef.current!);
  }, []);

  return (
    <>
      <Button
        type="button"
        disabled={!!runningJob || isPending}
        onClick={async () => {
          setError(null);

          const existingRun = await onGetExistingRun();
          if (existingRun) {
            setRunningJob(existingRun);
          } else {
            startTransition(async () => {
              let currentRun: scrapper_runs | undefined | null;
              try {
                await onRunScrapper('./src/scripts/scrap-web.ts');
                currentRun = await getCurrentRun();

                if (currentRun?.errored_at) {
                  setError(
                    'Wystąpił błąd podczas wykonywania zadania. Sprawdź konsolę.',
                  );
                  return;
                }

                setRunningJob(currentRun);
              } catch (err) {
                console.error(err);
                if (currentRun) {
                  await prisma.scrapper_runs.update({
                    where: { id: currentRun.id },
                    data: {
                      errored_at: new Date(),
                    },
                  });
                }
              }
            });
          }
        }}
      >
        Run Scrapper
      </Button>
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
