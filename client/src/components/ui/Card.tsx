import clsx from 'clsx';
import type { HTMLAttributes, ReactElement } from 'react';

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>): ReactElement {
  return <div className={clsx('rounded-card border border-line bg-surface-raised shadow-card', className)} {...rest} />;
}
