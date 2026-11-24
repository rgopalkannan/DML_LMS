import { type PrismaClient } from '@prisma/client';
import { type IUnitOfWork } from '../interfaces/unit-of-work.interface';
import { PrismaAuditRepository } from '../repositories/prisma-audit.repository';
import { PrismaCertificateRepository } from '../repositories/prisma-certificate.repository';
import { PrismaCourseRepository } from '../repositories/prisma-course.repository';
import { PrismaAttemptRepository, PrismaEnrollmentRepository } from '../repositories/prisma-learning.repository';
import { PrismaQuizRepository } from '../repositories/prisma-quiz.repository';
import { type Db } from '../repositories/prisma-types';
import { PrismaUserRepository } from '../repositories/prisma-user.repository';

export class PrismaUnitOfWork implements IUnitOfWork {
  readonly users: PrismaUserRepository;
  readonly courses: PrismaCourseRepository;
  readonly quizzes: PrismaQuizRepository;
  readonly enrollments: PrismaEnrollmentRepository;
  readonly attempts: PrismaAttemptRepository;
  readonly certificates: PrismaCertificateRepository;
  readonly audit: PrismaAuditRepository;

  /** root is set only on the outer unit; a transaction-scoped unit reuses its transaction for nested calls. */
  constructor(
    db: Db,
    private readonly root: PrismaClient | null
  ) {
    this.users = new PrismaUserRepository(db);
    this.courses = new PrismaCourseRepository(db);
    this.quizzes = new PrismaQuizRepository(db);
    this.enrollments = new PrismaEnrollmentRepository(db);
    this.attempts = new PrismaAttemptRepository(db);
    this.certificates = new PrismaCertificateRepository(db);
    this.audit = new PrismaAuditRepository(db);
  }

  transaction<T>(work: (uow: IUnitOfWork) => Promise<T>): Promise<T> {
    if (!this.root) return work(this);
    return this.root.$transaction(tx => work(new PrismaUnitOfWork(tx, null)));
  }
}
