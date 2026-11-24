import { type EnrollmentStatus } from '../../../common/constants/domain';

const PERCENT = 100;

/** Share of the course's lessons completed, rounded down so 100 means truly all of them. */
export function progressPercent(completedLessonIds: readonly string[], courseLessonIds: readonly string[]): number {
  if (courseLessonIds.length === 0) return 0;
  const done = new Set(completedLessonIds);
  const count = courseLessonIds.filter(id => done.has(id)).length;
  return Math.floor((count / courseLessonIds.length) * PERCENT);
}

export function allLessonsComplete(completedLessonIds: readonly string[], courseLessonIds: readonly string[]): boolean {
  return courseLessonIds.length > 0 && progressPercent(completedLessonIds, courseLessonIds) === PERCENT;
}

/** Status after a lesson is completed. A completed enrollment stays completed. */
export function statusAfterLesson(current: EnrollmentStatus): EnrollmentStatus {
  return current === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS';
}
