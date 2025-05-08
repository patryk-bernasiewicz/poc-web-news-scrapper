import {
  ScrappedPageConfig,
  SerializableScrapperRun,
} from '@/app/(protected)/scrapper/types';

export type ParsedArgs = {
  pages: ScrappedPageConfig[];
  keywords: string[];
  run: SerializableScrapperRun | null;
};
