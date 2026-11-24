/* API contract types. They mirror the response DTOs in the server modules (server/src/modules, dto folders). */
export type Role = 'ADMIN' | 'INSTRUCTOR' | 'LEARNER';
export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type LessonType = 'READING' | 'VIDEO';
export type QuestionType = 'SINGLE' | 'MULTIPLE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
export type EnrollmentStatus = 'ENROLLED' | 'IN_PROGRESS' | 'COMPLETED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CourseSummary {
  id: string;
  code: string;
  title: string;
  summary: string;
  category: string;
  level: CourseLevel;
  status: CourseStatus;
  requiredForNewStaff: boolean;
  certValidityMonths: number;
  instructorName: string | null;
  lessonCount: number;
  totalMinutes: number;
  hasQuiz: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  body: string;
  videoUrl: string | null;
  durationMinutes: number;
}

export interface CourseDetail extends CourseSummary {
  modules: { id: string; title: string; lessons: Lesson[] }[];
  quiz: { passPercent: number; questionCount: number } | null;
}

export interface AttemptSummary {
  id: string;
  score: number;
  total: number;
  percent: number;
  passed: boolean;
  submittedAt: string;
}

export interface CourseProgress {
  enrolled: boolean;
  status: EnrollmentStatus | null;
  completedLessonIds: string[];
  percent: number;
  quizUnlocked: boolean;
  attempts: AttemptSummary[];
  certificateId: string | null;
}

export interface MyCourse {
  course: CourseSummary;
  status: EnrollmentStatus;
  percent: number;
  enrolledAt: string;
  completedAt: string | null;
}

export interface DrawnQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  options: { id: string; label: string }[];
}

export interface QuizDraw {
  drawToken: string;
  passPercent: number;
  questions: DrawnQuestion[];
}

export interface Answer {
  questionId: string;
  optionIds: string[];
  text?: string;
}

export interface AttemptResult {
  attemptId: string;
  score: number;
  total: number;
  percent: number;
  passed: boolean;
  passPercent: number;
  certificateId: string | null;
  results: { questionId: string; correct: boolean; correctOptionIds: string[]; explanation: string | null }[];
}

export interface Certificate {
  id: string;
  serial: string;
  learnerName: string;
  courseCode: string;
  courseTitle: string;
  instructorName: string | null;
  scorePercent: number;
  issuedAt: string;
  expiresAt: string | null;
}

export interface Verification {
  valid: boolean;
  certificate: Omit<Certificate, 'id'> | null;
}

export interface NewUserInput {
  email: string;
  name: string;
  role: Role;
  password: string;
}

export interface NewCourseInput {
  code: string;
  title: string;
  summary: string;
  category: string;
  level: CourseLevel;
  requiredForNewStaff: boolean;
  certValidityMonths: number;
}
