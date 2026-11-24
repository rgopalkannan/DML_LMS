import type { ReactElement } from 'react';
import { Link } from 'react-router';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { COURSE_STATUS_LABEL, LEVEL_LABEL } from '@/constants/labels';
import { ROUTES } from '@/constants/routes';
import type { CourseSummary } from '@/types/api';

export function CourseCard({ course }: { course: CourseSummary }): ReactElement {
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex items-center justify-between bg-gradient-to-r from-brand-strong to-brand px-5 py-4 text-ink-inverse">
        <span className="text-xl font-bold">{course.code}</span>
        <span className="rounded-full bg-ink/30 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide">
          {course.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h2 className="text-lg font-bold">
          <Link to={ROUTES.course(course.id)} className="hover:text-brand">
            {course.title}
          </Link>
        </h2>
        <p className="mt-2 line-clamp-3 text-sm text-ink-muted">{course.summary}</p>
        <p className="mt-4 text-xs text-ink-muted">
          {[
            course.instructorName,
            `${course.lessonCount} lessons`,
            `${course.totalMinutes} min`,
            LEVEL_LABEL[course.level]
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {course.requiredForNewStaff && <Badge tone="accent">Required for new staff</Badge>}
          {course.status !== 'PUBLISHED' && <Badge>{COURSE_STATUS_LABEL[course.status]}</Badge>}
        </div>
      </div>
    </Card>
  );
}
