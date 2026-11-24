import * as Checkbox from '@radix-ui/react-checkbox';
import * as RadioGroup from '@radix-ui/react-radio-group';
import type { ReactElement } from 'react';
import { TextField } from '@/components/ui/Field';
import { LIMITS } from '@/constants/labels';
import type { DrawnQuestion } from '@/types/api';
import { type AnswerDraft, chooseOption } from './answers';

const OPTION =
  'flex cursor-pointer items-center gap-3 rounded-lg border border-line bg-surface-raised px-4 py-3 text-sm hover:bg-surface-muted has-[[data-state=checked]]:border-brand has-[[data-state=checked]]:bg-brand-soft';
const MARK =
  'flex h-5 w-5 shrink-0 items-center justify-center border-2 border-ink-muted data-[state=checked]:border-brand';

interface Props {
  number: number;
  question: DrawnQuestion;
  draft: AnswerDraft;
  onChange: (draft: AnswerDraft) => void;
}

export function QuestionField({ number, question, draft, onChange }: Props): ReactElement {
  const legend = `${number}. ${question.prompt}`;
  if (question.type === 'SHORT_ANSWER') {
    return (
      <TextField
        label={legend}
        value={draft.text}
        maxLength={LIMITS.SHORT_ANSWER_MAX_LENGTH}
        onChange={event => onChange({ ...draft, text: event.target.value })}
      />
    );
  }
  if (question.type === 'MULTIPLE') {
    return (
      <fieldset className="space-y-2">
        <legend className="mb-2 font-semibold">
          {legend} <span className="text-sm font-normal text-ink-muted">(choose all that apply)</span>
        </legend>
        {question.options.map(option => (
          <label key={option.id} className={OPTION}>
            <Checkbox.Root
              checked={draft.optionIds.includes(option.id)}
              onCheckedChange={() => onChange(chooseOption(question, draft, option.id))}
              className={`${MARK} rounded`}
            >
              <Checkbox.Indicator className="h-2.5 w-2.5 rounded-sm bg-brand" />
            </Checkbox.Root>
            {option.label}
          </label>
        ))}
      </fieldset>
    );
  }
  return (
    <fieldset>
      <legend className="mb-2 font-semibold">{legend}</legend>
      <RadioGroup.Root
        value={draft.optionIds[0] ?? ''}
        onValueChange={value => onChange(chooseOption(question, draft, value))}
        className="space-y-2"
        aria-label={question.prompt}
      >
        {question.options.map(option => (
          <label key={option.id} className={OPTION}>
            <RadioGroup.Item value={option.id} className={`${MARK} rounded-full`}>
              <RadioGroup.Indicator className="h-2.5 w-2.5 rounded-full bg-brand" />
            </RadioGroup.Item>
            {option.label}
          </label>
        ))}
      </RadioGroup.Root>
    </fieldset>
  );
}
