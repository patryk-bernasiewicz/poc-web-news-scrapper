import { ScrapperRun } from '@prisma/client';

export type ScrappedPageConfig = {
  url: string;
  containerSelectors: string[];
  dateSelectors: string[];
  titleSelectors: string[];
  leadSelectors: string[];
  dateStrings?: string[]; // Optional: e.g., ['today', 'dzisiaj']
};

export type SerializableScrapperRun = Omit<
  ScrapperRun,
  'finished_at' | 'created_at' | 'errored_at'
> & {
  finished_at: string | null | undefined;
  created_at: string | null | undefined;
  errored_at: string | null | undefined;
};
