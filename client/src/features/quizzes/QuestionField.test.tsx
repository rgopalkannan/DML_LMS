import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { DrawnQuestion } from '@/types/api';
import { emptyDraft } from './answers';
import { QuestionField } from './QuestionField';

const options = [
  { id: 'a', label: 'Placement' },
  { id: 'b', label: 'Layering' }
];

describe('QuestionField', () => {
  it('selects one option for single choice with the keyboard-accessible radio group', async () => {
    const onChange = vi.fn();
    const question: DrawnQuestion = { id: 'q', type: 'SINGLE', prompt: 'Which stage?', options };
    render(<QuestionField number={1} question={question} draft={emptyDraft} onChange={onChange} />);
    await userEvent.click(screen.getByRole('radio', { name: 'Layering' }));
    expect(onChange).toHaveBeenCalledWith({ optionIds: ['b'], text: '' });
  });

  it('uses checkboxes for multiple choice', async () => {
    const onChange = vi.fn();
    const question: DrawnQuestion = { id: 'q', type: 'MULTIPLE', prompt: 'Which apply?', options };
    render(<QuestionField number={2} question={question} draft={{ optionIds: ['a'], text: '' }} onChange={onChange} />);
    expect(screen.getByRole('checkbox', { name: 'Placement' })).toBeChecked();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Layering' }));
    expect(onChange).toHaveBeenCalledWith({ optionIds: ['a', 'b'], text: '' });
  });

  it('labels the short-answer box with the question', () => {
    const question: DrawnQuestion = { id: 'q', type: 'SHORT_ANSWER', prompt: 'Portal name?', options: [] };
    render(<QuestionField number={3} question={question} draft={emptyDraft} onChange={vi.fn()} />);
    expect(screen.getByLabelText('3. Portal name?')).toBeInTheDocument();
  });
});
