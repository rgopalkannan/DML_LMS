import type { ReactElement } from 'react';
import { Link } from 'react-router';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { QueryState } from '@/components/ui/QueryState';
import { ENROLLMENT_STATUS_LABEL } from '@/constants/labels';
import { ROUTES } from '@/constants/routes';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import type { MyCourse } from '@/types/api';
import { useMyCourses } from './learning-queries';

export function MyCourseRow({ item }: { item: MyCourse }): ReactElement {
  return (
    <Card className="flex flex-wrap items-center gap-4 p-5">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-brand">{item.course.code}</p>
        <Link to={ROUTES.course(item.course.id)} className="font-bold hover:text-brand">
          {item.course.title}
        </Link>
        <div className="mt-3 max-w-sm">
          <ProgressBar value={item.percent} label={`${item.course.code} progress`} />
        </div>
      </div>
      <Badge tone={item.status === 'COMPLETED' ? 'success' : 'brand'}>{ENROLLMENT_STATUS_LABEL[item.status]}</Badge>
      <span className="w-12 text-right text-sm font-semibold">{item.percent}%</span>
    </Card>
  );
}

export function MyLearningPage(): ReactElement {
  useDocumentTitle('My learning');
  const query = useMyCourses();
  return (
    <>
      <PageHeader title="My learning" description="Courses you are enrolled in and how far you have got." />
      <QueryState query={query}>
        {items =>
          items.length ? (
            <div className="space-y-3">
              {items.map(item => (
                <MyCourseRow key={item.course.id} item={item} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="You are not enrolled in any course yet"
              action={
                <Button asChild>
                  <Link to={ROUTES.catalog}>Browse the catalog</Link>
                </Button>
              }
            />
          )
        }
      </QueryState>
    </>
  );
}
