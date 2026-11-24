import type { ReactElement } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { toApiError } from '@/api/api-error';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { QueryState } from '@/components/ui/QueryState';
import { ROUTES } from '@/constants/routes';
import { useCourse } from '@/features/courses/course-queries';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { LessonContent } from './LessonContent';
import { nextLesson, orderedLessons, previousLesson } from './lesson-order';
import { useCompleteLesson, useProgress } from './learning-queries';

export function LessonPage(): ReactElement {
  const { courseId = '', lessonId = '' } = useParams();
  const navigate = useNavigate();
  const courseQuery = useCourse(courseId);
  const progressQuery = useProgress(courseId);
  const complete = useCompleteLesson(courseId);
  const lessons = courseQuery.data ? orderedLessons(courseQuery.data) : [];
  const lesson = lessons.find(item => item.id === lessonId);
  useDocumentTitle(lesson?.title);

  return (
    <QueryState query={courseQuery}>
      {course => {
        if (!lesson)
          return (
            <EmptyState
              title="Lesson not found"
              action={<Link to={ROUTES.course(courseId)}>Back to the course</Link>}
            />
          );
        const position = lessons.indexOf(lesson) + 1;
        const next = nextLesson(course, lesson.id);
        const previous = previousLesson(course, lesson.id);
        const completed = progressQuery.data?.completedLessonIds.includes(lesson.id) ?? false;
        const finish = (): void =>
          complete.mutate(lesson.id, {
            onSuccess: () => void navigate(next ? ROUTES.lesson(course.id, next.id) : ROUTES.course(course.id))
          });

        return (
          <div className="mx-auto max-w-3xl">
            <nav aria-label="Breadcrumb" className="mb-4 text-sm text-ink-muted">
              <Link to={ROUTES.course(course.id)} className="font-semibold text-brand hover:underline">
                {course.code}
              </Link>{' '}
              · Lesson {position} of {lessons.length}
            </nav>
            <h1 className="mb-6 text-3xl font-bold">{lesson.title}</h1>
            <Card className="p-6 sm:p-8">
              <LessonContent lesson={lesson} />
            </Card>
            {complete.isError && (
              <div className="mt-4">
                <Alert tone="danger">{toApiError(complete.error).message}</Alert>
              </div>
            )}
            <div className="mt-6 flex flex-wrap justify-between gap-3">
              {previous ? (
                <Button asChild variant="secondary">
                  <Link to={ROUTES.lesson(course.id, previous.id)}>Previous lesson</Link>
                </Button>
              ) : (
                <span />
              )}
              <Button onClick={finish} loading={complete.isPending}>
                {completed
                  ? next
                    ? 'Next lesson'
                    : 'Back to course'
                  : next
                    ? 'Mark complete and continue'
                    : 'Mark complete and finish'}
              </Button>
            </div>
          </div>
        );
      }}
    </QueryState>
  );
}
