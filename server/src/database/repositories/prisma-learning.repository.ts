import { type Enrollment as EnrollmentRow, type QuizAttempt as AttemptRow, type Prisma } from '@prisma/client';
import { type EnrollmentStatus } from '../../common/constants/domain';
import { type Enrollment, type QuizAttempt } from '../../domain/entities';
import {
  type IAttemptRepository,
  type IEnrollmentRepository,
  type NewAttempt
} from '../interfaces/learning.repository';
import { type Db } from './prisma-types';

const toEnrollment = (row: EnrollmentRow): Enrollment => ({
  id: row.id,
  userId: row.userId,
  courseId: row.courseId,
  status: row.status,
  enrolledAt: row.enrolledAt,
  completedAt: row.completedAt
});

const toAttempt = (row: AttemptRow): QuizAttempt => ({
  id: row.id,
  enrollmentId: row.enrollmentId,
  quizId: row.quizId,
  idempotencyKey: row.idempotencyKey,
  score: row.score,
  total: row.total,
  percent: row.percent,
  passed: row.passed,
  submittedAt: row.submittedAt
});

export class PrismaEnrollmentRepository implements IEnrollmentRepository {
  constructor(private readonly db: Db) {}

  async find(userId: string, courseId: string): Promise<Enrollment | null> {
    const row = await this.db.enrollment.findUnique({ where: { userId_courseId: { userId, courseId } } });
    return row ? toEnrollment(row) : null;
  }

  async findById(id: string): Promise<Enrollment | null> {
    const row = await this.db.enrollment.findUnique({ where: { id } });
    return row ? toEnrollment(row) : null;
  }

  /** Upsert on the (userId, courseId) unique key, so two enrol clicks at once create one record. */
  async create(userId: string, courseId: string): Promise<Enrollment> {
    const row = await this.db.enrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: {},
      create: { userId, courseId }
    });
    return toEnrollment(row);
  }

  async listForUser(userId: string): Promise<Enrollment[]> {
    const rows = await this.db.enrollment.findMany({ where: { userId }, orderBy: { enrolledAt: 'desc' } });
    return rows.map(toEnrollment);
  }

  async setStatus(id: string, status: EnrollmentStatus, completedAt: Date | null): Promise<Enrollment> {
    return toEnrollment(await this.db.enrollment.update({ where: { id }, data: { status, completedAt } }));
  }

  async markLessonComplete(enrollmentId: string, lessonId: string): Promise<void> {
    await this.db.lessonProgress.upsert({
      where: { enrollmentId_lessonId: { enrollmentId, lessonId } },
      update: {},
      create: { enrollmentId, lessonId }
    });
  }

  async completedLessonIds(enrollmentId: string): Promise<string[]> {
    const rows = await this.db.lessonProgress.findMany({ where: { enrollmentId }, select: { lessonId: true } });
    return rows.map(row => row.lessonId);
  }
}

export class PrismaAttemptRepository implements IAttemptRepository {
  constructor(private readonly db: Db) {}

  async findByIdempotencyKey(key: string): Promise<QuizAttempt | null> {
    const row = await this.db.quizAttempt.findUnique({ where: { idempotencyKey: key } });
    return row ? toAttempt(row) : null;
  }

  /** ON CONFLICT DO NOTHING on the idempotency key: a double-submitted attempt is stored once. */
  async create(attempt: NewAttempt): Promise<QuizAttempt> {
    const data = { ...attempt, answers: attempt.answers as unknown as Prisma.InputJsonValue };
    await this.db.quizAttempt.createMany({ data: [data], skipDuplicates: true });
    return toAttempt(
      await this.db.quizAttempt.findUniqueOrThrow({ where: { idempotencyKey: attempt.idempotencyKey } })
    );
  }

  async listForEnrollment(enrollmentId: string): Promise<QuizAttempt[]> {
    const rows = await this.db.quizAttempt.findMany({ where: { enrollmentId }, orderBy: { submittedAt: 'desc' } });
    return rows.map(toAttempt);
  }
}
