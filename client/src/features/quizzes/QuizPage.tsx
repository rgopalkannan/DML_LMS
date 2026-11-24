import { useState, type FormEvent, type ReactElement } from 'react';
import { Link, useParams } from 'react-router';
import { toApiError } from '@/api/api-error';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { ROUTES } from '@/constants/routes';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { type AnswerDrafts, emptyDraft, toAnswers, unansweredCount } from './answers';
import { QuestionField } from './QuestionField';
import { QuizResult } from './QuizResult';
import { useDrawQuiz, useSubmitQuiz } from './quiz-queries';

export function QuizPage(): ReactElement {
  useDocumentTitle('Final quiz');
  const { courseId = '' } = useParams();
  const draw = useDrawQuiz(courseId);
  const submit = useSubmitQuiz(courseId);
  const [drafts, setDrafts] = useState<AnswerDrafts>({});
  const [attemptKey, setAttemptKey] = useState('');

  const start = (): void => {
    setDrafts({});
    submit.reset();
    setAttemptKey(crypto.randomUUID());
    draw.mutate();
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!draw.data) return;
    submit.mutate({
      drawToken: draw.data.drawToken,
      idempotencyKey: attemptKey,
      answers: toAnswers(draw.data.questions, drafts)
    });
  };

  if (submit.data && draw.data)
    return <QuizResult courseId={courseId} draw={draw.data} result={submit.data} onRetry={start} />;

  if (!draw.data) {
    return (
      <Card className="mx-auto max-w-xl space-y-4 p-8">
        <h1 className="text-2xl font-bold">Final quiz</h1>
        <p className="text-ink-muted">
          Questions are drawn at random from the course's question bank. Answer every question, then submit.
        </p>
        {draw.isError && <Alert tone="danger">{toApiError(draw.error).message}</Alert>}
        <div className="flex gap-3">
          <Button size="lg" loading={draw.isPending} onClick={start}>
            Start the quiz
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link to={ROUTES.course(courseId)}>Back</Link>
          </Button>
        </div>
      </Card>
    );
  }

  const remaining = unansweredCount(draw.data.questions, drafts);
  return (
    <form className="mx-auto max-w-3xl" onSubmit={onSubmit} noValidate>
      <PageHeader
        title="Final quiz"
        description={`${draw.data.questions.length} questions. Pass mark ${draw.data.passPercent}%.`}
      />
      <div className="space-y-6">
        {draw.data.questions.map((question, index) => (
          <Card key={question.id} className="p-5">
            <QuestionField
              number={index + 1}
              question={question}
              draft={drafts[question.id] ?? emptyDraft}
              onChange={draft => setDrafts(current => ({ ...current, [question.id]: draft }))}
            />
          </Card>
        ))}
      </div>
      {submit.isError && (
        <div className="mt-6">
          <Alert tone="danger">{toApiError(submit.error).message}</Alert>
        </div>
      )}
      <div className="mt-6 flex items-center justify-end gap-4">
        <p className="text-sm text-ink-muted" aria-live="polite">
          {remaining ? `${remaining} question${remaining === 1 ? '' : 's'} left to answer` : 'All questions answered'}
        </p>
        <Button type="submit" size="lg" disabled={remaining > 0} loading={submit.isPending}>
          Submit answers
        </Button>
      </div>
    </form>
  );
}
