import { useState, type FormEvent, type ReactElement } from 'react';
import { toApiError } from '@/api/api-error';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { SelectField, TextField } from '@/components/ui/Field';
import { LIMITS, ROLE_LABEL } from '@/constants/labels';
import type { NewUserInput, Role } from '@/types/api';
import { useCreateUser } from './user-queries';

const EMPTY: NewUserInput = { email: '', name: '', role: 'LEARNER', password: '' };
type Errors = Partial<Record<keyof NewUserInput, string>>;

export function validateUser(input: NewUserInput): Errors {
  const errors: Errors = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) errors.email = 'Enter a valid email address.';
  if (input.name.trim().length < 2) errors.name = 'Enter the full name.';
  if (
    input.password.length < LIMITS.PASSWORD_MIN_LENGTH ||
    !/\p{L}/u.test(input.password) ||
    !/\d/.test(input.password)
  ) {
    errors.password = `Use at least ${LIMITS.PASSWORD_MIN_LENGTH} characters with a letter and a number.`;
  }
  return errors;
}

export function CreateUserDialog({
  open,
  onOpenChange
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}): ReactElement {
  const create = useCreateUser();
  const [form, setForm] = useState<NewUserInput>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const set = <K extends keyof NewUserInput>(key: K, value: NewUserInput[K]): void =>
    setForm(current => ({ ...current, [key]: value }));

  const close = (next: boolean): void => {
    if (!next) {
      setForm(EMPTY);
      setErrors({});
      create.reset();
    }
    onOpenChange(next);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const found = validateUser(form);
    setErrors(found);
    if (!Object.keys(found).length)
      create.mutate({ ...form, email: form.email.trim(), name: form.name.trim() }, { onSuccess: () => close(false) });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={close}
      title="Add a user"
      description="Give the person their temporary password through a secure channel."
    >
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        {create.isError && <Alert tone="danger">{toApiError(create.error).message}</Alert>}
        <TextField
          label="Full name"
          required
          value={form.name}
          error={errors.name}
          onChange={event => set('name', event.target.value)}
        />
        <TextField
          label="Email"
          type="email"
          required
          value={form.email}
          error={errors.email}
          onChange={event => set('email', event.target.value)}
        />
        <SelectField label="Role" value={form.role} onChange={event => set('role', event.target.value as Role)}>
          {Object.entries(ROLE_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectField>
        <TextField
          label="Temporary password"
          type="password"
          autoComplete="new-password"
          required
          value={form.password}
          error={errors.password}
          onChange={event => set('password', event.target.value)}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={() => close(false)}>
            Cancel
          </Button>
          <Button type="submit" loading={create.isPending}>
            Add user
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
