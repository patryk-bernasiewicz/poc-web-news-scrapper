import React from 'react';

import fetchMainKeywords from '@/utils/db/queries/fetchMainKeywords';

import { KeywordTable } from './components/KeywordTable';

export default async function KeywordsPage() {
  const keywords = await fetchMainKeywords();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Słowa kluczowe</h1>
      <KeywordTable keywords={keywords} />
    </div>
  );
}
