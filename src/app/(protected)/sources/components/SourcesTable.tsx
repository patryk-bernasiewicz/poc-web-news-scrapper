'use client';

import { Keyword, Source } from '@prisma/client';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';

import { deleteSource } from '../actions/delete-source';
import { upsertSource } from '../actions/upsert-source';
import type { SourceFormValuesInput } from '../types/source-form.types';
import { toStringFields } from '../types/source-form.types';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { SourceFormModal } from './SourceFormModal';

interface SourcesTableProps {
  sources: (Source & {
    sourceKeywords: { keyword: Keyword }[];
  })[];
}

export function SourcesTable({ sources }: SourcesTableProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editSource, setEditSource] = useState<SourceFormValuesInput | null>(
    null,
  );
  const [isEdit, setIsEdit] = useState(false);
  const router = useRouter();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | number | bigint | null>(
    null,
  );
  const [deleteLoading, setDeleteLoading] = useState(false);

  function handleEdit(
    source: Source & { sourceKeywords: { keyword: Keyword }[] },
  ) {
    setEditSource({
      id: source.id.toString(),
      name: source.name,
      url: source.url,
      is_active: source.is_active,
      keywords: source.sourceKeywords.map((sk) => sk.keyword.name),
      dateStrings: source.dateStrings,
      containerSelectors: source.containerSelectors,
      titleSelectors: source.titleSelectors,
      dateSelectors: source.dateSelectors,
      leadSelectors: source.leadSelectors,
    });
    setIsEdit(true);
    setModalOpen(true);
  }

  function handleAdd() {
    setEditSource({
      name: '',
      url: '',
      is_active: true,
      keywords: [],
      dateStrings: [],
      containerSelectors: [],
      titleSelectors: [],
      dateSelectors: [],
      leadSelectors: [],
    });
    setIsEdit(false);
    setModalOpen(true);
  }

  async function handleSubmit(values: SourceFormValuesInput) {
    try {
      const valuesForBackend = {
        ...values,
        dateStrings: toStringFields(values.dateStrings),
        containerSelectors: toStringFields(values.containerSelectors),
        titleSelectors: toStringFields(values.titleSelectors),
        dateSelectors: toStringFields(values.dateSelectors),
        leadSelectors: toStringFields(values.leadSelectors),
      };
      const res = await upsertSource(
        valuesForBackend,
        isEdit && editSource ? editSource.id : undefined,
      );
      if (res && res.success) {
        toast.success(isEdit ? 'Źródło zaktualizowane' : 'Źródło dodane');
        setModalOpen(false);
        router.refresh();
      } else {
        toast.error(res?.error || 'Błąd podczas zapisu');
      }
    } catch {
      toast.error('Błąd podczas zapisu');
    }
  }

  function handleDeleteClick(source: Source) {
    setDeleteId(source.id);
    setDeleteModalOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const res = await deleteSource(deleteId);
      if (res && res.success) {
        toast.success('Źródło usunięte');
        setDeleteModalOpen(false);
        setDeleteId(null);
        router.refresh();
      } else {
        toast.error(res?.error || 'Błąd podczas usuwania');
      }
    } catch {
      toast.error('Błąd podczas usuwania');
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-end mb-4">
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" /> Dodaj źródło
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-4 py-2 text-left text-sm text-ring">
              Nazwa
            </TableHead>
            <TableHead className="px-4 py-2 text-left text-sm text-ring">
              URL
            </TableHead>
            <TableHead className="px-4 py-2 text-left text-sm text-ring">
              Słowa kluczowe
            </TableHead>
            <TableHead className="px-4 py-2 text-left text-sm text-ring">
              Akcje
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sources.map((source) => (
            <TableRow key={source.id} className="border-b">
              <TableCell className="px-4 py-2">{source.name}</TableCell>
              <TableCell className="px-4 py-2">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600/50 underline hover:text-blue-600 focus:text-blue-600"
                >
                  {source.url}
                </a>
              </TableCell>
              <TableCell className="px-4 py-2">
                <div className="flex flex-wrap gap-1">
                  {source.sourceKeywords.map((sk) => (
                    <Badge key={sk.keyword.id}>{sk.keyword.name}</Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="px-4 py-2">
                <div className="flex gap-2"></div>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Edytuj"
                  onClick={() => handleEdit(source)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Usuń"
                  onClick={() => handleDeleteClick(source)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <SourceFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialValues={editSource ?? undefined}
        onSubmit={handleSubmit}
        isEdit={isEdit}
      />
      <ConfirmDeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        description="Czy na pewno chcesz usunąć to źródło? Tej operacji nie można cofnąć."
      />
    </div>
  );
}
