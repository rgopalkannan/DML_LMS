import { useState, type FormEvent, type ReactElement } from 'react';
import { toApiError } from '@/api/api-error';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { SelectField, TextAreaField, TextField } from '@/components/ui/Field';
import { LEVEL_LABEL } from '@/constants/labels';
import type { CourseLevel, NewCourseInput } from '@/types/api';
import { useCreateCourse } from '../course-queries';

const CODE_PATTERN = /^[A-Z]{2,5}-\d{3}$/;
const EMPTY: NewCourseInput = {
  code: '',
  title: '',
  summary: '',
  category: '',
  level: 'BEGINNER',
  requiredForNewStaff: false,
  certValidityMonths: 12
};

type Errors = Partial<Record<keyof NewCourseInput, string>>;

export function validateCourse(input: NewCourseInput): Errors {
  const errors: Errors = {};
  if (!CODE_PATTERN.test(input.code.trim().toUpperCase())) errors.code = 'Use a code like AML-101.';
  if (input.title.trim().length < 3) errors.title = 'Enter a title of at least 3 characters.';
  if (input.summary.trim().length < 10) errors.summary = 'Enter a summary of at least 10 characters.';
  if (input.category.trim().length < 2) errors.category = 'Enter a category.';
  if (!Number.isInteger(input.certValidityMonths) || input.certValidityMonths < 0 || input.certValidityMonths > 60) {
    errors.certValidityMonths = 'Enter 0 to 60 months (0 means it never expires).';
  }
  return errors;
}

export function CreateCourseDialog({
  open,
  onOpenChange
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}): ReactElement {
  const create = useCreateCourse();
  const [form, setForm] = useState<NewCourseInput>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const set = <K extends keyof NewCourseInput>(key: K, value: NewCourseInput[K]): void =>
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
    const found = validateCourse(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    create.mutate({ ...form, code: form.code.trim().toUpperCase() }, { onSuccess: () => close(false) });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={close}
      title="New course"
      description="Creates a draft. Lessons and the quiz are added in the course editor (stage 2)."
    >
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        {create.isError && <Alert tone="danger">{toApiError(create.error).message}</Alert>}
        <TextField
          label="Course code"
          required
          value={form.code}
          error={errors.code}
          hint="For example AML-201"
          onChange={event => set('code', event.target.value)}
        />
        <TextField
          label="Title"
          required
          value={form.title}
          error={errors.title}
          onChange={event => set('title', event.target.value)}
        />
        <TextAreaField
          label="Summary"
          required
          rows={3}
          value={form.summary}
          error={errors.summary}
          onChange={event => set('summary', event.target.value)}
        />
        <TextField
          label="Category"
          required
          value={form.category}
          error={errors.category}
          onChange={event => set('category', event.target.value)}
        />
        <SelectField
          label="Level"
          value={form.level}
          onChange={event => set('level', event.target.value as CourseLevel)}
        >
          {Object.entries(LEVEL_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectField>
        <TextField
          label="Certificate valid for (months)"
          type="number"
          min={0}
          max={60}
          value={form.certValidityMonths}
          error={errors.certValidityMonths}
          onChange={event => set('certValidityMonths', Number(event.target.value))}
        />
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            className="h-4 w-4 accent-brand"
            checked={form.requiredForNewStaff}
            onChange={event => set('requiredForNewStaff', event.target.checked)}
          />
          Required for new staff
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={() => close(false)}>
            Cancel
          </Button>
          <Button type="submit" loading={create.isPending}>
            Create draft
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
