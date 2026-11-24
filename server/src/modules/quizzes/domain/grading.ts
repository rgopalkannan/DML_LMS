import { type Question, type SubmittedAnswer } from '../../../domain/entities';

export interface QuestionResult {
  questionId: string;
  correct: boolean;
  correctOptionIds: string[];
  explanation: string | null;
}

export interface GradeResult {
  score: number;
  total: number;
  percent: number;
  passed: boolean;
  results: QuestionResult[];
}

/** Case, spacing and punctuation do not matter for short answers. */
export function normalizeShortAnswer(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function sameSet(left: readonly string[], right: readonly string[]): boolean {
  const unique = new Set(left);
  return unique.size === right.length && unique.size === left.length && right.every(id => unique.has(id));
}

export function isAnswerCorrect(question: Question, answer: SubmittedAnswer | undefined): boolean {
  if (!answer) return false;
  if (question.type === 'SHORT_ANSWER') {
    const given = normalizeShortAnswer(answer.text ?? '');
    return given !== '' && question.acceptedAnswers.some(accepted => normalizeShortAnswer(accepted) === given);
  }
  const correct = question.options.filter(option => option.isCorrect).map(option => option.id);
  return sameSet(answer.optionIds, correct);
}

/** Grades the drawn questions. Unanswered questions count as wrong. */
export function gradeAttempt(
  questions: readonly Question[],
  answers: readonly SubmittedAnswer[],
  passPercent: number
): GradeResult {
  const byQuestion = new Map(answers.map(answer => [answer.questionId, answer]));
  const results = questions.map(question => ({
    questionId: question.id,
    correct: isAnswerCorrect(question, byQuestion.get(question.id)),
    correctOptionIds: question.options.filter(option => option.isCorrect).map(option => option.id),
    explanation: question.explanation
  }));
  const score = results.filter(result => result.correct).length;
  const total = questions.length;
  const percent = total === 0 ? 0 : Math.round((score / total) * 100);
  return { score, total, percent, passed: total > 0 && percent >= passPercent, results };
}
