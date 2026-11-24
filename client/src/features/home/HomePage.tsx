import type { ReactElement } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { QueryState } from '@/components/ui/QueryState';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/features/auth/auth-context';
import { useCourses } from '@/features/courses/course-queries';
import { MyCourseRow } from '@/features/learning/MyLearningPage';
import { useMyCourses } from '@/features/learning/learning-queries';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function HomePage(): ReactElement {
  useDocumentTitle('Home');
  const { user } = useAuth();
  const myCourses = useMyCourses();
  const courses = useCourses();

  return (
    <>
      <PageHeader title={`Welcome, ${user?.name ?? ''}`} description="Know the rules. Spot the risk. Report it." />
      <section aria-labelledby="continue-heading" className="mb-10">
        <h2 id="continue-heading" className="mb-4 text-xl font-bold">
          Continue learning
        </h2>
        <QueryState query={myCourses}>
          {items => {
            const active = items.filter(item => item.status !== 'COMPLETED');
            return active.length ? (
              <div className="space-y-3">
                {active.map(item => (
                  <MyCourseRow key={item.course.id} item={item} />
                ))}
              </div>
            ) : (
              <EmptyState title="Nothing in progress" description="Pick a course from the catalog to start." />
            );
          }}
        </QueryState>
      </section>
      <section aria-labelledby="required-heading">
        <h2 id="required-heading" className="mb-4 text-xl font-bold">
          Required for new staff
        </h2>
        <QueryState query={courses}>
          {list => (
            <div className="grid gap-4 md:grid-cols-2">
              {list
                .filter(course => course.requiredForNewStaff && course.status === 'PUBLISHED')
                .map(course => (
                  <Card key={course.id} className="flex items-center justify-between gap-4 p-4">
                    <div>
                      <p className="text-xs font-semibold text-brand">{course.code}</p>
                      <p className="font-semibold">{course.title}</p>
                    </div>
                    <Button asChild size="sm" variant="secondary">
                      <Link to={ROUTES.course(course.id)}>Open</Link>
                    </Button>
                  </Card>
                ))}
            </div>
          )}
        </QueryState>
      </section>
    </>
  );
}
