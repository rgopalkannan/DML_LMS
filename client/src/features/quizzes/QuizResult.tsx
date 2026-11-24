import type { ReactElement } from 'react';
import { Link } from 'react-router';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ROUTES } from '@/constants/routes';
import type { AttemptResult, QuizDraw } from '@/types/api';

interface Props {
  courseId: string;
  draw: QuizDraw;
  result: AttemptResult;
  onRetry: () => void;
}

export function QuizResult({ courseId, draw, result, onRetry }: Props): ReactElement {
  const byId = new Map(draw.questions.map(question => [question.id, question]));
  return (
    <div className="space-y-6">
      <Alert tone={result.passed ? 'success' : 'warning'} title={result.passed ? 'You passed' : 'Not passed this time'}>
        You scored {result.score} of {result.total} ({result.percent}%). The pass mark is {result.passPercent}%.
        {result.passed && result.certificateId && ' Your certificate is ready.'}
      </Alert>
      <div className="flex flex-wrap gap-3">
        {result.certificateId && (
          <Button asChild>
            <Link to={ROUTES.certificates}>View certificate</Link>
          </Button>
        )}
        {!result.passed && <Button onClick={onRetry}>Try again with new questions</Button>}
        <Button asChild variant="secondary">
          <Link to={ROUTES.course(courseId)}>Back to the course</Link>
        </Button>
      </div>
      <ol className="space-y-3">
        {result.results.map((item, index) => {
          const question = byId.get(item.questionId);
          const correctLabels = question?.options
            .filter(option => item.correctOptionIds.includes(option.id))
            .map(option => option.label);
          return (
            <li key={item.questionId}>
              <Card className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold">
                    {index + 1}. {question?.prompt}
                  </p>
                  <Badge tone={item.correct ? 'success' : 'danger'}>{item.correct ? 'Correct' : 'Incorrect'}</Badge>
                </div>
                {!item.correct && correctLabels && correctLabels.length > 0 && (
                  <p className="mt-2 text-sm">Correct answer: {correctLabels.join(', ')}</p>
                )}
                {item.explanation && <p className="mt-2 text-sm text-ink-muted">{item.explanation}</p>}
              </Card>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
