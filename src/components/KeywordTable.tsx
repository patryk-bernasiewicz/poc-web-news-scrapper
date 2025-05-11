'use client';

import React from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';

export type Keyword = {
  id: number | string;
  name: string;
  slug: string;
  description?: string | null;
  is_active: boolean;
};

type KeywordTableProps = {
  keywords: Keyword[];
};

export function KeywordTable({ keywords }: KeywordTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Nazwa</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Opis</TableHead>
          <TableHead>Aktywne?</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {keywords.map((keyword) => (
          <TableRow key={keyword.id}>
            <TableCell>{keyword.id}</TableCell>
            <TableCell>{keyword.name}</TableCell>
            <TableCell>{keyword.slug}</TableCell>
            <TableCell>{keyword.description || '-'}</TableCell>
            <TableCell>{keyword.is_active ? 'Tak' : 'Nie'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
