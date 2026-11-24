import clsx from 'clsx';
import type { ReactElement } from 'react';

const SIZES = { sm: 'h-4 w-4 border-2', md: 'h-8 w-8 border-[3px]' } as const;

export function Spinner({
  size = 'md',
  label = 'Loading'
}: {
  size?: keyof typeof SIZES;
  label?: string;
}): ReactElement {
  return (
    <span role="status" className="inline-flex items-center">
      <span
        className={clsx('animate-spin rounded-full border-current border-t-transparent', SIZES[size])}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
