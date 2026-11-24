import type { DrawnQuestion } from '@/types/api';
import { chooseOption, emptyDraft, toAnswers, unansweredCount } from './answers';

const single: DrawnQuestion = {
  id: 's',
  type: 'SINGLE',
  prompt: '',
  options: [
    { id: 'a', label: 'A' },
    { id: 'b', label: 'B' }
  ]
};
const multiple: DrawnQuestion = { ...single, id: 'm', type: 'MULTIPLE' };
const short: DrawnQuestion = { id: 't', type: 'SHORT_ANSWER', prompt: '', options: [] };

describe('quiz answers', () => {
  it('replaces the choice for single choice', () => {
    expect(chooseOption(single, chooseOption(single, emptyDraft, 'a'), 'b').optionIds).toEqual(['b']);
  });

  it('toggles choices for multiple choice', () => {
    const both = chooseOption(multiple, chooseOption(multiple, emptyDraft, 'a'), 'b');
    expect(both.optionIds).toEqual(['a', 'b']);
    expect(chooseOption(multiple, both, 'a').optionIds).toEqual(['b']);
  });

  it('counts blank short answers as unanswered', () => {
    expect(
      unansweredCount([single, short], { s: { optionIds: ['a'], text: '' }, t: { optionIds: [], text: '   ' } })
    ).toBe(1);
  });

  it('sends trimmed text only for short answers', () => {
    expect(toAnswers([single, short], { t: { optionIds: [], text: ' goAML ' } })).toEqual([
      { questionId: 's', optionIds: [] },
      { questionId: 't', optionIds: [], text: 'goAML' }
    ]);
  });
});
