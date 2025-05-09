import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface ConfirmDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading?: boolean;
  description?: string;
}

export function ConfirmDeleteModal({
  open,
  onOpenChange,
  onConfirm,
  loading,
  description,
}: ConfirmDeleteModalProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      loading={loading}
      description={
        description ||
        'Czy na pewno chcesz usunąć ten element? Tej operacji nie można cofnąć.'
      }
      title="Potwierdź usunięcie"
      confirmLabel="Usuń"
      cancelLabel="Anuluj"
      confirmVariant="destructive"
    />
  );
}
