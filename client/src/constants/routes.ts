/* Route paths. Build links with these helpers, never with string literals in screens. */
export const ROUTES = {
  login: '/login',
  home: '/',
  catalog: '/catalog',
  course: (courseId: string): string => `/courses/${courseId}`,
  lesson: (courseId: string, lessonId: string): string => `/courses/${courseId}/lessons/${lessonId}`,
  quiz: (courseId: string): string => `/courses/${courseId}/quiz`,
  myLearning: '/my-learning',
  certificates: '/certificates',
  verify: (serial: string): string => `/verify/${serial}`,
  adminUsers: '/admin/users',
  adminCourses: '/admin/courses'
} as const;

export const ROUTE_PATTERNS = {
  course: '/courses/:courseId',
  lesson: '/courses/:courseId/lessons/:lessonId',
  quiz: '/courses/:courseId/quiz',
  verify: '/verify/:serial'
} as const;
