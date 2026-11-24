import clsx from 'clsx';
import type { ReactElement, ReactNode } from 'react';

export const TONES = {
  neutral: 'bg-surface-muted text-ink-muted',
  brand: 'bg-brand-soft text-brand-strong',
  accent: 'bg-accent-soft text-warning',
  success: 'bg-success-soft text-success',
  danger: 'bg-danger-soft text-danger',
  warning: 'bg-warning-soft text-warning'
} as const;
export type Tone = keyof typeof TONES;

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }): ReactElement {
  return (
    <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', TONES[tone])}>
      {children}
    </span>
  );
}
