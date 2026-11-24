/* Stable domain states and thresholds. Values match the Prisma enums in prisma/schema.prisma. */
export const ROLES = ['ADMIN', 'INSTRUCTOR', 'LEARNER'] as const;
export type Role = (typeof ROLES)[number];

export const COURSE_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
export type CourseStatus = (typeof COURSE_STATUSES)[number];

export const COURSE_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;
export type CourseLevel = (typeof COURSE_LEVELS)[number];

export const LESSON_TYPES = ['READING', 'VIDEO'] as const;
export type LessonType = (typeof LESSON_TYPES)[number];

export const QUESTION_TYPES = ['SINGLE', 'MULTIPLE', 'TRUE_FALSE', 'SHORT_ANSWER'] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export const ENROLLMENT_STATUSES = ['ENROLLED', 'IN_PROGRESS', 'COMPLETED'] as const;
export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number];

export const LIMITS = {
  PASSWORD_MIN_LENGTH: 10,
  PASSWORD_MAX_LENGTH: 128,
  BCRYPT_ROUNDS: 12,
  NAME_MAX_LENGTH: 120,
  SHORT_ANSWER_MAX_LENGTH: 200,
  PAGE_SIZE_DEFAULT: 20,
  PAGE_SIZE_MAX: 100,
  QUIZ_DRAW_TTL_SECONDS: 60 * 60,
  CERTIFICATE_SERIAL_PREFIX: 'DML'
} as const;
