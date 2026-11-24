import * as Label from '@radix-ui/react-label';
import clsx from 'clsx';
import {
  useId,
  type InputHTMLAttributes,
  type ReactElement,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes
} from 'react';

const CONTROL =
  'w-full rounded-lg border bg-surface-raised px-3 py-2 text-sm text-ink placeholder:text-ink-muted disabled:opacity-60 aria-[invalid=true]:border-danger';

interface FieldFrameProps {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
  required?: boolean | undefined;
}

function useFieldIds(): { id: string; errorId: string; hintId: string } {
  const id = useId();
  return { id, errorId: `${id}-error`, hintId: `${id}-hint` };
}

function Frame({
  id,
  label,
  error,
  hint,
  required,
  errorId,
  hintId,
  children
}: FieldFrameProps & { id: string; errorId: string; hintId: string; children: ReactElement }): ReactElement {
  return (
    <div className="space-y-1.5">
      <Label.Root htmlFor={id} className="block text-sm font-semibold">
        {label}
        {required && (
          <span className="text-danger" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </Label.Root>
      {children}
      {hint && !error && (
        <p id={hintId} className="text-xs text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

const describedBy = (
  error: string | undefined,
  hint: string | undefined,
  errorId: string,
  hintId: string
): string | undefined => (error ? errorId : hint ? hintId : undefined);

export function TextField({
  label,
  error,
  hint,
  className,
  ...rest
}: FieldFrameProps & InputHTMLAttributes<HTMLInputElement>): ReactElement {
  const ids = useFieldIds();
  return (
    <Frame {...ids} label={label} error={error} hint={hint} required={rest.required}>
      <input
        id={ids.id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(error, hint, ids.errorId, ids.hintId)}
        className={clsx(CONTROL, 'border-line', className)}
        {...rest}
      />
    </Frame>
  );
}

export function TextAreaField({
  label,
  error,
  hint,
  className,
  ...rest
}: FieldFrameProps & TextareaHTMLAttributes<HTMLTextAreaElement>): ReactElement {
  const ids = useFieldIds();
  return (
    <Frame {...ids} label={label} error={error} hint={hint} required={rest.required}>
      <textarea
        id={ids.id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(error, hint, ids.errorId, ids.hintId)}
        className={clsx(CONTROL, 'border-line', className)}
        {...rest}
      />
    </Frame>
  );
}

export function SelectField({
  label,
  error,
  hint,
  className,
  children,
  ...rest
}: FieldFrameProps & SelectHTMLAttributes<HTMLSelectElement>): ReactElement {
  const ids = useFieldIds();
  return (
    <Frame {...ids} label={label} error={error} hint={hint} required={rest.required}>
      <select
        id={ids.id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(error, hint, ids.errorId, ids.hintId)}
        className={clsx(CONTROL, 'border-line', className)}
        {...rest}
      >
        {children}
      </select>
    </Frame>
  );
}
