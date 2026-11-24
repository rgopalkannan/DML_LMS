import { useState, type ReactElement } from 'react';
import { Link } from 'react-router';
import { toApiError } from '@/api/api-error';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageHeader } from '@/components/ui/PageHeader';
import { QueryState } from '@/components/ui/QueryState';
import { COURSE_STATUS_LABEL } from '@/constants/labels';
import { ROUTES } from '@/constants/routes';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import type { CourseSummary } from '@/types/api';
import { useCourses, useSetCourseStatus } from '../course-queries';
import { CreateCourseDialog } from './CreateCourseDialog';

export function ManageCoursesPage(): ReactElement {
  useDocumentTitle('Manage courses');
  const query = useCourses();
  const setStatus = useSetCourseStatus();
  const [creating, setCreating] = useState(false);
  const [unpublishing, setUnpublishing] = useState<CourseSummary | null>(null);

  return (
    <>
      <PageHeader
        title="Manage courses"
        description="Publish courses to learners or take them back to draft."
        actions={<Button onClick={() => setCreating(true)}>New course</Button>}
      />
      {setStatus.isError && (
        <div className="mb-4">
          <Alert tone="danger" title="The status was not changed">
            {toApiError(setStatus.error).message}
          </Alert>
        </div>
      )}
      <QueryState query={query}>
        {courses => (
          <Card className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Courses</caption>
              <thead className="border-b border-line text-xs uppercase tracking-wide text-ink-muted">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Code
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Title
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Lessons
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {courses.map(course => {
                  const published = course.status === 'PUBLISHED';
                  const busy = setStatus.isPending && setStatus.variables.courseId === course.id;
                  return (
                    <tr key={course.id}>
                      <td className="px-4 py-3 font-semibold">{course.code}</td>
                      <td className="px-4 py-3">
                        <Link to={ROUTES.course(course.id)} className="hover:text-brand">
                          {course.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{course.lessonCount}</td>
                      <td className="px-4 py-3">
                        <Badge tone={published ? 'success' : 'neutral'}>{COURSE_STATUS_LABEL[course.status]}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant={published ? 'secondary' : 'primary'}
                          loading={busy}
                          onClick={() =>
                            published
                              ? setUnpublishing(course)
                              : setStatus.mutate({ courseId: course.id, status: 'PUBLISHED' })
                          }
                        >
                          {published ? 'Unpublish' : 'Publish'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}
      </QueryState>
      <CreateCourseDialog open={creating} onOpenChange={setCreating} />
      <ConfirmDialog
        open={unpublishing !== null}
        title={`Unpublish ${unpublishing?.code ?? ''}?`}
        description="Learners will no longer see it in the catalog. Their progress and certificates are kept."
        confirmLabel="Unpublish"
        onCancel={() => setUnpublishing(null)}
        onConfirm={() => {
          if (unpublishing) setStatus.mutate({ courseId: unpublishing.id, status: 'DRAFT' });
          setUnpublishing(null);
        }}
      />
    </>
  );
}
