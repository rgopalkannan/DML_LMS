import { Slot } from '@radix-ui/react-slot';
import clsx from 'clsx';
import type { ButtonHTMLAttributes, ReactElement } from 'react';
import { Spinner } from './Spinner';

const VARIANTS = {
  primary: 'bg-brand text-ink-inverse hover:bg-brand-strong',
  secondary: 'border border-line bg-surface-raised text-ink hover:bg-surface-muted',
  ghost: 'text-ink hover:bg-surface-muted',
  danger: 'bg-danger text-ink-inverse hover:opacity-90'
} as const;

const SIZES = { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4 text-sm', lg: 'h-12 px-6 text-base' } as const;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  loading?: boolean;
  /** Render the child element (for example a router Link) with button styling. */
  asChild?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  asChild = false,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps): ReactElement {
  const classes = clsx(
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    className
  );
  if (asChild) return <Slot className={classes}>{children}</Slot>;
  return (
    <button type="button" className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading && <Spinner size="sm" label="Working" />}
      {children}
    </button>
  );
}
