'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

import { createClient } from '@/utils/supabase/client';

const client = createClient();

type NotificationPayload = {
  event: 'run-completed' | 'run-created';
  payload: {
    runId: string;
    upsertedCount: number;
  };
};

export const useNotifications = () => {
  const myChannel = client.channel('runs-notifications');

  function handleNotification(payload: NotificationPayload) {
    if (payload.event === 'run-completed') {
      toast.success(
        `Scrapper zakończył działanie. Dodanych artykułów: ${payload.payload.upsertedCount}`,
      );
    } else if (payload.event === 'run-created') {
      toast.info('Scrapper rozpoczął pracę');
    }
  }

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (myChannel as any)
      .on('broadcast', { event: 'run-completed' }, handleNotification)
      .on('broadcast', { event: 'run-created' }, handleNotification)
      .subscribe();

    return () => {
      myChannel.unsubscribe();
    };
  }, [myChannel]);
};
