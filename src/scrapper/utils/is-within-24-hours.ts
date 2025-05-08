import { subHours } from 'date-fns';

import { ScrappedPageConfig } from '@/app/(protected)/scrapper/types';
import { createLogger } from '@/utils/create-logger';

export const isWithinLast24Hours = async (
  dateText: string,
  entry: ScrappedPageConfig,
): Promise<boolean> => {
  if (entry.dateString) {
    const stringMatch = dateText
      .toLowerCase()
      .includes(entry.dateString.toLowerCase());
    if (stringMatch) {
      return true;
    }
  }

  let articleDate: Date | null = null;
  try {
    const genericParsed = new Date(dateText);
    if (!isNaN(genericParsed.getTime())) {
      articleDate = genericParsed;
    }
  } catch (error) {
    const logger = createLogger('is-within-24-hours');

    logger.info('Błąd podczas parsowania daty:', error);
  }

  // 3. Check if parsed date is within the last 24 hours
  if (articleDate) {
    const now = new Date();
    const twentyFourHoursAgo = subHours(now, 24);
    // Check if the parsed date falls within the interval [24 hours ago, now]
    const isRecent = articleDate >= twentyFourHoursAgo && articleDate <= now;
    if (isRecent) {
      return true; // Date is valid and within the last 24 hours
    }
  }

  return false; // Default to false if no condition is met
};
