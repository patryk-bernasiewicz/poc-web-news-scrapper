import { createStandaloneClient } from '@/utils/supabase/standalone';

const channelName = 'runs-notifications';

export const notifyRunCreated = async (runId: string) => {
  const supabase = createStandaloneClient();

  await supabase.channel(channelName).send({
    event: 'run-created',
    payload: { runId },
    type: 'broadcast',
  });
};

export const notifyRunCompleted = async (
  runId: string,
  upsertedCount: number,
) => {
  const supabase = createStandaloneClient();

  await supabase.channel(channelName).send({
    event: 'run-completed',
    payload: { runId, upsertedCount },
    type: 'broadcast',
  });
};
