import type { ReactElement, ReactNode } from 'react';

export function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}): ReactElement {
  return (
    <div className="rounded-card border border-dashed border-line px-6 py-12 text-center">
      <p className="text-lg font-semibold">{title}</p>
      {description && <p className="mt-2 text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
