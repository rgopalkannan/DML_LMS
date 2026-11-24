import type { CourseLevel, CourseStatus, EnrollmentStatus, Role } from '@/types/api';

/* Display text for domain values, kept in one place so every screen says the same thing. */
export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: 'Administrator',
  INSTRUCTOR: 'Instructor',
  LEARNER: 'Learner'
};
export const LEVEL_LABEL: Record<CourseLevel, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced'
};
export const COURSE_STATUS_LABEL: Record<CourseStatus, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived'
};
export const ENROLLMENT_STATUS_LABEL: Record<EnrollmentStatus, string> = {
  ENROLLED: 'Not started',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed'
};

export const LIMITS = {
  PASSWORD_MIN_LENGTH: 10,
  USERS_PAGE_SIZE: 20,
  REQUEST_TIMEOUT_MS: 15_000,
  SHORT_ANSWER_MAX_LENGTH: 200
} as const;
