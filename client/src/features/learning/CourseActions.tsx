import type { ReactElement } from 'react';
import { Link, useNavigate } from 'react-router';
import { toApiError } from '@/api/api-error';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ENROLLMENT_STATUS_LABEL } from '@/constants/labels';
import { ROUTES } from '@/constants/routes';
import type { CourseDetail, CourseProgress } from '@/types/api';
import { firstIncompleteLesson, orderedLessons } from './lesson-order';
import { useEnroll } from './learning-queries';

export function CourseActions({ course, progress }: { course: CourseDetail; progress: CourseProgress }): ReactElement {
  const navigate = useNavigate();
  const enroll = useEnroll(course.id);
  const next = firstIncompleteLesson(course, progress.completedLessonIds) ?? orderedLessons(course)[0] ?? null;
  const bestAttempt = progress.attempts.reduce<number | null>(
    (best, attempt) => Math.max(best ?? 0, attempt.percent),
    null
  );

  if (!progress.enrolled) {
    return (
      <Card className="h-fit space-y-4 p-5">
        <p className="text-sm text-ink-muted">
          Enrol to track your progress, take the final quiz and earn a certificate.
        </p>
        {course.status !== 'PUBLISHED' && <Alert tone="warning">This course is not published yet.</Alert>}
        {enroll.isError && <Alert tone="danger">{toApiError(enroll.error).message}</Alert>}
        <Button
          size="lg"
          className="w-full"
          loading={enroll.isPending}
          disabled={course.status !== 'PUBLISHED'}
          onClick={() =>
            enroll.mutate(undefined, { onSuccess: () => next && void navigate(ROUTES.lesson(course.id, next.id)) })
          }
        >
          Enrol and start
        </Button>
      </Card>
    );
  }

  return (
    <Card className="h-fit space-y-4 p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">Your progress</span>
        <Badge tone={progress.status === 'COMPLETED' ? 'success' : 'brand'}>
          {ENROLLMENT_STATUS_LABEL[progress.status ?? 'ENROLLED']}
        </Badge>
      </div>
      <ProgressBar value={progress.percent} label="Lessons completed" />
      <p className="text-sm text-ink-muted">{progress.percent}% of lessons completed</p>
      {next && progress.percent < 100 && (
        <Button asChild size="lg" className="w-full">
          <Link to={ROUTES.lesson(course.id, next.id)}>Continue learning</Link>
        </Button>
      )}
      {course.quiz && (
        <div className="space-y-2 border-t border-line pt-4">
          <p className="text-sm">
            Final quiz: {course.quiz.questionCount} questions, pass mark {course.quiz.passPercent}%.
            {bestAttempt !== null && ` Best score so far: ${bestAttempt}%.`}
          </p>
          {progress.quizUnlocked ? (
            <Button asChild variant={progress.certificateId ? 'secondary' : 'primary'} className="w-full">
              <Link to={ROUTES.quiz(course.id)}>
                {progress.certificateId ? 'Retake the quiz' : 'Take the final quiz'}
              </Link>
            </Button>
          ) : (
            <p className="text-xs text-ink-muted">Finish every lesson to unlock the quiz.</p>
          )}
        </div>
      )}
      {progress.certificateId && (
        <Button asChild variant="secondary" className="w-full">
          <Link to={ROUTES.certificates}>View your certificate</Link>
        </Button>
      )}
    </Card>
  );
}
