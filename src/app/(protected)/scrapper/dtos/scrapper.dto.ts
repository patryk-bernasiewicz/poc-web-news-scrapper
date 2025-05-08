import type { ScrapperRun } from '@prisma/client';

import { SerializableScrapperRun } from '../types';

export class ScrapperDto {
  static fromServer(scrapperRun: ScrapperRun): SerializableScrapperRun {
    return {
      ...scrapperRun,
      finished_at: scrapperRun.finished_at?.toString(),
      created_at: scrapperRun.created_at?.toString(),
      errored_at: scrapperRun.errored_at?.toString(),
    };
  }

  static toServer(scrapperRun: SerializableScrapperRun): ScrapperRun {
    return {
      ...scrapperRun,
      created_at: new Date(scrapperRun.created_at || new Date().toString()),
      finished_at: scrapperRun.finished_at
        ? new Date(scrapperRun.finished_at)
        : null,
      errored_at: scrapperRun.errored_at
        ? new Date(scrapperRun.errored_at)
        : null,
    };
  }
}
