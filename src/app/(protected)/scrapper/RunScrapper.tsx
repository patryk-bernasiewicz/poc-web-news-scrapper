'use client';

import { Button } from '@/components/ui/button';

type RunScrapperProps = {
  onRunScrapper: (script: string) => Promise<any>;
};

export default function RunScrapper({ onRunScrapper }: RunScrapperProps) {
  return (
    <Button
      type="button"
      onClick={() => onRunScrapper('./src/scripts/scrap-web.ts')}
    >
      Run Scrapper
    </Button>
  );
}
