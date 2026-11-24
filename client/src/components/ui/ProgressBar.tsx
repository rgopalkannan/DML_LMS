import type { ReactElement } from 'react';

export function ProgressBar({ value, label }: { value: number; label: string }): ReactElement {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      className="h-2 w-full overflow-hidden rounded-full bg-surface-muted"
    >
      <div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${clamped}%` }} />
    </div>
  );
}
