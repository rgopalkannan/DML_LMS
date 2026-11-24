import type { ReactElement } from 'react';
import { useParams } from 'react-router';
import { PageHeader } from '@/components/ui/PageHeader';
import { QueryState } from '@/components/ui/QueryState';
import { LEVEL_LABEL } from '@/constants/labels';
import { useCourse } from '@/features/courses/course-queries';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { CourseActions } from './CourseActions';
import { LessonList } from './LessonList';
import { useProgress } from './learning-queries';

export function CourseOverviewPage(): ReactElement {
  const { courseId = '' } = useParams();
  const courseQuery = useCourse(courseId);
  const progressQuery = useProgress(courseId);
  useDocumentTitle(courseQuery.data?.title);

  return (
    <QueryState query={courseQuery}>
      {course => (
        <>
          <PageHeader title={`${course.code}: ${course.title}`} description={course.summary} />
          <p className="-mt-4 mb-8 text-sm text-ink-muted">
            {[
              course.instructorName,
              LEVEL_LABEL[course.level],
              `${course.lessonCount} lessons`,
              `${course.totalMinutes} min`
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
          <QueryState query={progressQuery}>
            {progress => (
              <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
                <LessonList course={course} progress={progress} />
                <CourseActions course={course} progress={progress} />
              </div>
            )}
          </QueryState>
        </>
      )}
    </QueryState>
  );
}
