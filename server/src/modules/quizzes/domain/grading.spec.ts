import { type Question } from '../../../domain/entities';
import { drawQuestionIds } from './draw';
import { gradeAttempt, isAnswerCorrect, normalizeShortAnswer } from './grading';

const option = (id: string, isCorrect: boolean, position = 0) => ({ id, label: id, isCorrect, position });
const question = (overrides: Partial<Question>): Question => ({
  id: 'q',
  type: 'SINGLE',
  prompt: 'p',
  explanation: null,
  acceptedAnswers: [],
  position: 0,
  options: [],
  ...overrides
});

const single = question({ id: 'q1', options: [option('a', false), option('b', true)] });
const multiple = question({
  id: 'q2',
  type: 'MULTIPLE',
  options: [option('a', true), option('b', true), option('c', false)]
});
const short = question({ id: 'q3', type: 'SHORT_ANSWER', acceptedAnswers: ['goAML', 'go AML'] });

describe('grading', () => {
  it('grades a single-choice answer', () => {
    expect(isAnswerCorrect(single, { questionId: 'q1', optionIds: ['b'], text: null })).toBe(true);
    expect(isAnswerCorrect(single, { questionId: 'q1', optionIds: ['a'], text: null })).toBe(false);
  });

  it('needs exactly the right set for multiple choice', () => {
    expect(isAnswerCorrect(multiple, { questionId: 'q2', optionIds: ['b', 'a'], text: null })).toBe(true);
    expect(isAnswerCorrect(multiple, { questionId: 'q2', optionIds: ['a'], text: null })).toBe(false);
    expect(isAnswerCorrect(multiple, { questionId: 'q2', optionIds: ['a', 'b', 'c'], text: null })).toBe(false);
    expect(isAnswerCorrect(multiple, { questionId: 'q2', optionIds: ['a', 'a'], text: null })).toBe(false);
  });

  it('accepts short answers regardless of case and punctuation', () => {
    expect(normalizeShortAnswer('  Go-AML! ')).toBe('goaml');
    expect(isAnswerCorrect(short, { questionId: 'q3', optionIds: [], text: 'GOAML.' })).toBe(true);
    expect(isAnswerCorrect(short, { questionId: 'q3', optionIds: [], text: 'go  aml' })).toBe(true);
    expect(isAnswerCorrect(short, { questionId: 'q3', optionIds: [], text: '' })).toBe(false);
  });

  it('counts unanswered questions as wrong and applies the pass mark', () => {
    const result = gradeAttempt([single, multiple, short], [{ questionId: 'q1', optionIds: ['b'], text: null }], 70);
    expect(result).toMatchObject({ score: 1, total: 3, percent: 33, passed: false });
    expect(result.results[1]?.correctOptionIds).toEqual(['a', 'b']);
  });

  it('passes at exactly the pass mark', () => {
    const result = gradeAttempt([single], [{ questionId: 'q1', optionIds: ['b'], text: null }], 100);
    expect(result.passed).toBe(true);
  });

  it('never passes an empty quiz', () => {
    expect(gradeAttempt([], [], 0).passed).toBe(false);
  });
});

describe('drawQuestionIds', () => {
  it('returns distinct ids up to the count', () => {
    const drawn = drawQuestionIds(['a', 'b', 'c', 'd'], 3);
    expect(new Set(drawn).size).toBe(3);
  });

  it('returns the whole bank when it is smaller than the count', () => {
    expect(drawQuestionIds(['a', 'b'], 5).sort()).toEqual(['a', 'b']);
  });

  it('is deterministic with an injected random source', () => {
    expect(drawQuestionIds(['a', 'b', 'c'], 3, () => 0)).toEqual(['b', 'c', 'a']);
  });
});
