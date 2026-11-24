import type {
  Answer,
  AttemptResult,
  Certificate,
  CourseDetail,
  CourseProgress,
  CourseStatus,
  CourseSummary,
  LoginResponse,
  MyCourse,
  NewCourseInput,
  NewUserInput,
  Page,
  QuizDraw,
  Role,
  SessionUser,
  User,
  Verification
} from '@/types/api';
import { http } from './http-client';

/* Typed API functions, one per endpoint. Screens call these through React Query hooks, never axios directly. */
export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> =>
    (await http.post<LoginResponse>('/auth/login', { email, password })).data,
  me: async (): Promise<SessionUser> => (await http.get<SessionUser>('/auth/me')).data
};

export const coursesApi = {
  list: async (): Promise<CourseSummary[]> => (await http.get<CourseSummary[]>('/courses')).data,
  get: async (courseId: string): Promise<CourseDetail> => (await http.get<CourseDetail>(`/courses/${courseId}`)).data,
  create: async (input: NewCourseInput): Promise<CourseSummary> =>
    (await http.post<CourseSummary>('/courses', input)).data,
  setStatus: async (courseId: string, status: CourseStatus): Promise<CourseDetail> =>
    (await http.patch<CourseDetail>(`/courses/${courseId}/status`, { status })).data
};

export const learningApi = {
  myCourses: async (): Promise<MyCourse[]> => (await http.get<MyCourse[]>('/me/courses')).data,
  progress: async (courseId: string): Promise<CourseProgress> =>
    (await http.get<CourseProgress>(`/courses/${courseId}/progress`)).data,
  enroll: async (courseId: string): Promise<CourseProgress> =>
    (await http.post<CourseProgress>(`/courses/${courseId}/enrollment`)).data,
  completeLesson: async (courseId: string, lessonId: string): Promise<CourseProgress> =>
    (await http.post<CourseProgress>(`/courses/${courseId}/lessons/${lessonId}/complete`)).data
};

export const quizzesApi = {
  draw: async (courseId: string): Promise<QuizDraw> =>
    (await http.post<QuizDraw>(`/courses/${courseId}/quiz/draw`)).data,
  submit: async (
    courseId: string,
    body: { drawToken: string; idempotencyKey: string; answers: Answer[] }
  ): Promise<AttemptResult> => (await http.post<AttemptResult>(`/courses/${courseId}/quiz/attempts`, body)).data
};

export const certificatesApi = {
  mine: async (): Promise<Certificate[]> => (await http.get<Certificate[]>('/me/certificates')).data,
  pdf: async (certificateId: string): Promise<Blob> =>
    (await http.get<Blob>(`/certificates/${certificateId}/pdf`, { responseType: 'blob' })).data,
  verify: async (serial: string): Promise<Verification> =>
    (await http.get<Verification>(`/certificates/verify/${encodeURIComponent(serial)}`)).data
};

export const usersApi = {
  list: async (page: number, pageSize: number, search: string): Promise<Page<User>> =>
    (await http.get<Page<User>>('/users', { params: { page, pageSize, ...(search ? { search } : {}) } })).data,
  create: async (input: NewUserInput): Promise<User> => (await http.post<User>('/users', input)).data,
  update: async (userId: string, changes: { name?: string; role?: Role; isActive?: boolean }): Promise<User> =>
    (await http.patch<User>(`/users/${userId}`, changes)).data
};
