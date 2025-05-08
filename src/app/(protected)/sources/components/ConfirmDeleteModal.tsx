import * as Dialog from '@radix-ui/react-dialog';

import { Button } from '@/components/ui/Button';

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
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-secondary/40 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-secondary p-6 shadow-lg">
          <Dialog.Title className="text-lg font-bold mb-4">
            Potwierdź usunięcie
          </Dialog.Title>
          <div className="mb-4 text-sm text-secondary-foreground">
            {description ||
              'Czy na pewno chcesz usunąć ten element? Tej operacji nie można cofnąć.'}
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Anuluj
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={loading}
            >
              Usuń
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
