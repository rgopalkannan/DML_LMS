import type { ReactElement } from 'react';
import { Button } from './Button';
import { Dialog } from './Dialog';

interface Props {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Asks before an action that takes something away from people, such as unpublishing or deactivating. */
export function ConfirmDialog({ open, title, description, confirmLabel, onConfirm, onCancel }: Props): ReactElement {
  return (
    <Dialog open={open} onOpenChange={next => !next && onCancel()} title={title} description={description}>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
