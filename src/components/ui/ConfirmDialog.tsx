import * as Dialog from '@radix-ui/react-dialog';

import { Button } from './Button';

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading?: boolean;
  description?: string;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'default' | 'destructive';
};

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  loading,
  description,
  title = 'Potwierdź akcję',
  confirmLabel = 'Potwierdź',
  cancelLabel = 'Anuluj',
  confirmVariant = 'default',
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-background p-6 shadow-lg">
          <Dialog.Title className="text-lg font-bold mb-4">
            {title}
          </Dialog.Title>
          <div className="mb-4 text-sm text-foreground">
            {description || 'Czy na pewno chcesz wykonać tę operację?'}
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {cancelLabel}
            </Button>
            <Button
              variant={confirmVariant}
              onClick={onConfirm}
              disabled={loading}
            >
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
