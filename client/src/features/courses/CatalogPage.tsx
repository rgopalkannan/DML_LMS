import clsx from 'clsx';
import { useMemo, useState, type ReactElement } from 'react';
import { EmptyState } from '@/components/ui/EmptyState';
import { TextField } from '@/components/ui/Field';
import { PageHeader } from '@/components/ui/PageHeader';
import { QueryState } from '@/components/ui/QueryState';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import type { CourseSummary } from '@/types/api';
import { CourseCard } from './CourseCard';
import { useCourses } from './course-queries';

const ALL = 'All';

function filterCourses(courses: CourseSummary[], search: string, category: string): CourseSummary[] {
  const term = search.trim().toLowerCase();
  return courses.filter(
    course =>
      (category === ALL || course.category === category) &&
      (!term || `${course.code} ${course.title} ${course.summary}`.toLowerCase().includes(term))
  );
}

export function CatalogPage(): ReactElement {
  useDocumentTitle('Course catalog');
  const query = useCourses();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(ALL);
  const categories = useMemo(() => [ALL, ...new Set((query.data ?? []).map(course => course.category))], [query.data]);

  return (
    <>
      <PageHeader
        title="Course catalog"
        description="AML/CFT training for Licensed Exchange House staff, based on the CBUAE Rulebook."
      />
      <div className="mb-6 max-w-md">
        <TextField
          label="Search"
          type="search"
          placeholder="Title, topic or course code"
          value={search}
          onChange={event => setSearch(event.target.value)}
        />
      </div>
      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {categories.map(name => (
          <button
            key={name}
            type="button"
            aria-pressed={category === name}
            onClick={() => setCategory(name)}
            className={clsx(
              'rounded-lg border px-3 py-1.5 text-sm font-semibold',
              category === name
                ? 'border-brand bg-brand text-ink-inverse'
                : 'border-line bg-surface-raised hover:bg-surface-muted'
            )}
          >
            {name}
          </button>
        ))}
      </div>
      <QueryState query={query}>
        {courses => {
          const shown = filterCourses(courses, search, category);
          if (!shown.length)
            return <EmptyState title="No courses match" description="Try another search or category." />;
          return (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {shown.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          );
        }}
      </QueryState>
    </>
  );
}
