/* Domain entities: what services work with. Independent of Prisma models and of API response DTOs. */
import {
  type CourseLevel,
  type CourseStatus,
  type EnrollmentStatus,
  type LessonType,
  type QuestionType,
  type Role
} from '../common/constants/domain';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
}

export interface UserWithCredentials extends User {
  passwordHash: string;
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
  moduleId: string;
  title: string;
  type: LessonType;
  body: string;
  videoUrl: string | null;
  durationMinutes: number;
  position: number;
}

export interface CourseModule {
  id: string;
  title: string;
  position: number;
  lessons: Lesson[];
}

export interface CourseDetail extends CourseSummary {
  modules: CourseModule[];
  quiz: { id: string; passPercent: number; questionCount: number; bankSize: number } | null;
}

export interface QuestionOption {
  id: string;
  label: string;
  isCorrect: boolean;
  position: number;
}

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  explanation: string | null;
  acceptedAnswers: string[];
  position: number;
  options: QuestionOption[];
}

export interface Quiz {
  id: string;
  courseId: string;
  passPercent: number;
  questionCount: number;
  questions: Question[];
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: EnrollmentStatus;
  enrolledAt: Date;
  completedAt: Date | null;
}

/** A learner's answer to one question: chosen option ids, or typed text for short answers. */
export interface SubmittedAnswer {
  questionId: string;
  optionIds: string[];
  text: string | null;
}

export interface QuizAttempt {
  id: string;
  enrollmentId: string;
  quizId: string;
  idempotencyKey: string;
  score: number;
  total: number;
  percent: number;
  passed: boolean;
  submittedAt: Date;
}

export interface Certificate {
  id: string;
  enrollmentId: string;
  serial: string;
  scorePercent: number;
  issuedAt: Date;
  expiresAt: Date | null;
}

/** A certificate with the names it prints, for the learner's list and for public verification. */
export interface CertificateView extends Certificate {
  learnerName: string;
  courseCode: string;
  courseTitle: string;
  instructorName: string | null;
}
