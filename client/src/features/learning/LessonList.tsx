import clsx from 'clsx';
import type { ReactElement } from 'react';
import { Link } from 'react-router';
import { Card } from '@/components/ui/Card';
import { ROUTES } from '@/constants/routes';
import type { CourseDetail, CourseProgress } from '@/types/api';

export function LessonList({ course, progress }: { course: CourseDetail; progress: CourseProgress }): ReactElement {
  const done = new Set(progress.completedLessonIds);
  return (
    <div className="space-y-6">
      {course.modules.map(module => (
        <Card key={module.id} className="p-5">
          <h2 className="text-lg font-bold">{module.title}</h2>
          <ol className="mt-3 divide-y divide-line">
            {module.lessons.map(lesson => {
              const completed = done.has(lesson.id);
              const label = (
                <>
                  <span
                    aria-hidden="true"
                    className={clsx(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                      completed ? 'bg-success text-ink-inverse' : 'border border-line text-ink-muted'
                    )}
                  >
                    {completed ? '✓' : ''}
                  </span>
                  <span className="flex-1">{lesson.title}</span>
                  <span className="text-xs text-ink-muted">
                    {lesson.type === 'VIDEO' ? 'Video · ' : ''}
                    {lesson.durationMinutes} min
                  </span>
                  <span className="sr-only">{completed ? '(completed)' : '(not completed)'}</span>
                </>
              );
              return (
                <li key={lesson.id}>
                  {progress.enrolled ? (
                    <Link
                      to={ROUTES.lesson(course.id, lesson.id)}
                      className="flex items-center gap-3 rounded-md px-1 py-3 text-sm hover:bg-surface-muted"
                    >
                      {label}
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3 px-1 py-3 text-sm">{label}</div>
                  )}
                </li>
              );
            })}
          </ol>
        </Card>
      ))}
    </div>
  );
}
