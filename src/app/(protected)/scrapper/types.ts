import { ScrapperRun } from '@prisma/client';

export type ScrappedPageConfig = {
  url: string;
  containerSelector: string;
  dateSelector: string;
  titleSelector: string;
  leadSelector: string;
  // Removed dateFormat
  dateString?: string; // Optional: e.g., 'dzisiaj', 'today'
};

export type SerializableScrapperRun = Omit<
  ScrapperRun,
  'finished_at' | 'created_at' | 'errored_at'
> & {
  finished_at: string | null | undefined;
  created_at: string | null | undefined;
  errored_at: string | null | undefined;
};
