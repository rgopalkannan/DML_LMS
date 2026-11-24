import { type EnrollmentStatus } from '../../common/constants/domain';
import { type Enrollment, type QuizAttempt, type SubmittedAnswer } from '../../domain/entities';

export interface NewAttempt {
  enrollmentId: string;
  quizId: string;
  idempotencyKey: string;
  questionIds: string[];
  answers: SubmittedAnswer[];
  score: number;
  total: number;
  percent: number;
  passed: boolean;
}

export interface IEnrollmentRepository {
  find(userId: string, courseId: string): Promise<Enrollment | null>;
  findById(id: string): Promise<Enrollment | null>;
  create(userId: string, courseId: string): Promise<Enrollment>;
  listForUser(userId: string): Promise<Enrollment[]>;
  setStatus(id: string, status: EnrollmentStatus, completedAt: Date | null): Promise<Enrollment>;
  /** Records a completed lesson; recording it twice is harmless. */
  markLessonComplete(enrollmentId: string, lessonId: string): Promise<void>;
  completedLessonIds(enrollmentId: string): Promise<string[]>;
}

export interface IAttemptRepository {
  findByIdempotencyKey(key: string): Promise<QuizAttempt | null>;
  create(attempt: NewAttempt): Promise<QuizAttempt>;
  listForEnrollment(enrollmentId: string): Promise<QuizAttempt[]>;
}
