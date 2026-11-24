import { type CourseStatus, type Role } from '../../../common/constants/domain';
import { type CourseDetail } from '../../../domain/entities';

const STAFF_ROLES: ReadonlySet<Role> = new Set<Role>(['ADMIN', 'INSTRUCTOR']);

export const isStaff = (role: Role): boolean => STAFF_ROLES.has(role);

/** Statuses a role may see in the catalog. Learners see only published courses. */
export function visibleStatuses(role: Role): CourseStatus[] {
  return isStaff(role) ? ['DRAFT', 'PUBLISHED'] : ['PUBLISHED'];
}

export function canViewCourse(role: Role, status: CourseStatus): boolean {
  return visibleStatuses(role).includes(status);
}

/** Reasons a course cannot be published yet; empty when it is ready. */
export function publishBlockers(course: CourseDetail): string[] {
  const blockers: string[] = [];
  if (course.lessonCount === 0) blockers.push('Add at least one lesson.');
  if (!course.quiz) blockers.push('Add a final quiz.');
  else if (course.quiz.bankSize < course.quiz.questionCount) {
    blockers.push(`The quiz draws ${course.quiz.questionCount} questions but only has ${course.quiz.bankSize}.`);
  }
  return blockers;
}
