import { type IAuditRepository } from './audit.repository';
import { type ICertificateRepository } from './certificate.repository';
import { type ICourseRepository } from './course.repository';
import { type IAttemptRepository, type IEnrollmentRepository } from './learning.repository';
import { type IQuizRepository } from './quiz.repository';
import { type IUserRepository } from './user.repository';

export const UNIT_OF_WORK = Symbol('UNIT_OF_WORK');

/**
 * The only way services reach persistence. Repositories on this object share one connection;
 * inside transaction() they share one database transaction, and every write in it commits or none does.
 */
export interface IUnitOfWork {
  readonly users: IUserRepository;
  readonly courses: ICourseRepository;
  readonly quizzes: IQuizRepository;
  readonly enrollments: IEnrollmentRepository;
  readonly attempts: IAttemptRepository;
  readonly certificates: ICertificateRepository;
  readonly audit: IAuditRepository;
  transaction<T>(work: (uow: IUnitOfWork) => Promise<T>): Promise<T>;
}
