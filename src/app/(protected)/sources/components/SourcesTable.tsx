'use client';

import { Keyword, Source } from '@prisma/client';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

import { deleteSource } from '../actions/delete-source';
import { upsertSource } from '../actions/upsert-source';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { SourceFormValues, SourceModal } from './SourceModal';
import type { StringField } from './SourceModal';

interface SourcesTableProps {
  sources: (Source & {
    sourceKeywords: { keyword: Keyword }[];
  })[];
}

interface SourceFormValuesWithId extends SourceFormValues {
  id?: string | number | bigint;
}

export function SourcesTable({ sources }: SourcesTableProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editSource, setEditSource] = useState<SourceFormValuesWithId | null>(
    null,
  );
  const [isEdit, setIsEdit] = useState(false);
  const router = useRouter();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | number | bigint | null>(
    null,
  );
  const [deleteLoading, setDeleteLoading] = useState(false);

  function toStringFields(arr: string[] = []): StringField[] {
    return arr.map((v) => ({ value: v }));
  }

  function handleEdit(
    source: Source & { sourceKeywords: { keyword: Keyword }[] },
  ) {
    setEditSource({
      id: source.id,
      name: source.name,
      url: source.url,
      is_active: source.is_active,
      keywords: source.sourceKeywords.map((sk) => sk.keyword.name),
      dateStrings: toStringFields(source.dateStrings),
      containerSelectors: toStringFields(source.containerSelectors),
      titleSelectors: toStringFields(source.titleSelectors),
      dateSelectors: toStringFields(source.dateSelectors),
      leadSelectors: toStringFields(source.leadSelectors),
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

  async function handleSubmit(values: SourceFormValues) {
    try {
      const res = await upsertSource(
        values,
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
      <table className="min-w-full divide-y divide-border">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left text-sm text-ring">Nazwa</th>
            <th className="px-4 py-2 text-left text-sm text-ring">URL</th>
            <th className="px-4 py-2 text-left text-sm text-ring">
              Słowa kluczowe
            </th>
            <th className="px-4 py-2 text-left text-sm text-ring">Akcje</th>
          </tr>
        </thead>
        <tbody>
          {sources.map((source) => (
            <tr key={source.id} className="border-b">
              <td className="px-4 py-2">{source.name}</td>
              <td className="px-4 py-2">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600/50 underline hover:text-blue-600 focus:text-blue-600"
                >
                  {source.url}
                </a>
              </td>
              <td className="px-4 py-2">
                <div className="flex flex-wrap gap-1">
                  {source.sourceKeywords.map((sk) => (
                    <Badge key={sk.keyword.id}>{sk.keyword.name}</Badge>
                  ))}
                </div>
              </td>
              <td className="px-4 py-2">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <SourceModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialValues={editSource || undefined}
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
