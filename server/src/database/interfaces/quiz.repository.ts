import { type Quiz } from '../../domain/entities';

export interface IQuizRepository {
  /** The quiz with every question, option and correct answer. Never send this to a learner as is. */
  findByCourseId(courseId: string): Promise<Quiz | null>;
}
