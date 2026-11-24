/* Shared query keys, so a mutation can invalidate exactly the cached data it changed. */
export const queryKeys = {
  me: ['me'] as const,
  courses: ['courses'] as const,
  course: (courseId: string) => ['courses', courseId] as const,
  progress: (courseId: string) => ['progress', courseId] as const,
  myCourses: ['my-courses'] as const,
  certificates: ['certificates'] as const,
  verification: (serial: string) => ['verification', serial] as const,
  users: (page: number, search: string) => ['users', page, search] as const,
  usersRoot: ['users'] as const
};
