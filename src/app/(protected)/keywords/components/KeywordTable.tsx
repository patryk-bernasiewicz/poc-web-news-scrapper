'use client';

import type { Keyword } from '@prisma/client';
import React from 'react';

import { Badge } from '@/components/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';

type KeywordTableProps = {
  keywords: Keyword[];
};

export function KeywordTable({ keywords }: KeywordTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nazwa</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Opis</TableHead>
          <TableHead>Aktywne?</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {keywords.map((keyword) => (
          <TableRow key={keyword.id.toString()}>
            <TableCell>
              <Badge>{keyword.name}</Badge>
            </TableCell>
            <TableCell className="font-mono text-xs">{keyword.slug}</TableCell>
            <TableCell>{keyword.description || '-'}</TableCell>
            <TableCell>{keyword.is_active ? 'Tak' : 'Nie'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
