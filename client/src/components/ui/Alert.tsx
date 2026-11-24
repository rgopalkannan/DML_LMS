import clsx from 'clsx';
import type { ReactElement, ReactNode } from 'react';

const TONES = {
  info: 'border-line bg-surface-muted text-ink',
  success: 'border-success/30 bg-success-soft text-success',
  danger: 'border-danger/30 bg-danger-soft text-danger',
  warning: 'border-warning/30 bg-warning-soft text-warning'
} as const;

export function Alert({
  tone = 'info',
  title,
  children
}: {
  tone?: keyof typeof TONES;
  title?: string;
  children?: ReactNode;
}): ReactElement {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={clsx('rounded-lg border px-4 py-3 text-sm', TONES[tone])}
    >
      {title && <p className="font-semibold">{title}</p>}
      {children && <div className={clsx(title && 'mt-1')}>{children}</div>}
    </div>
  );
}
