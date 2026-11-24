import type { Answer, DrawnQuestion } from '@/types/api';

export interface AnswerDraft {
  optionIds: string[];
  text: string;
}

export type AnswerDrafts = Record<string, AnswerDraft>;

export const emptyDraft: AnswerDraft = { optionIds: [], text: '' };

export function isAnswered(question: DrawnQuestion, draft: AnswerDraft | undefined): boolean {
  if (!draft) return false;
  return question.type === 'SHORT_ANSWER' ? draft.text.trim() !== '' : draft.optionIds.length > 0;
}

export const unansweredCount = (questions: DrawnQuestion[], drafts: AnswerDrafts): number =>
  questions.filter(question => !isAnswered(question, drafts[question.id])).length;

export function toAnswers(questions: DrawnQuestion[], drafts: AnswerDrafts): Answer[] {
  return questions.map(question => {
    const draft = drafts[question.id] ?? emptyDraft;
    return question.type === 'SHORT_ANSWER'
      ? { questionId: question.id, optionIds: [], text: draft.text.trim() }
      : { questionId: question.id, optionIds: draft.optionIds };
  });
}

/** Toggles an option for multiple choice; replaces the choice for single choice and true/false. */
export function chooseOption(question: DrawnQuestion, draft: AnswerDraft, optionId: string): AnswerDraft {
  if (question.type !== 'MULTIPLE') return { ...draft, optionIds: [optionId] };
  const selected = draft.optionIds.includes(optionId)
    ? draft.optionIds.filter(id => id !== optionId)
    : [...draft.optionIds, optionId];
  return { ...draft, optionIds: selected };
}
