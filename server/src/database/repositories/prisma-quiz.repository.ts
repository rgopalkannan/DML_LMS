import { type Quiz } from '../../domain/entities';
import { type IQuizRepository } from '../interfaces/quiz.repository';
import { type Db } from './prisma-types';

export class PrismaQuizRepository implements IQuizRepository {
  constructor(private readonly db: Db) {}

  async findByCourseId(courseId: string): Promise<Quiz | null> {
    const row = await this.db.quiz.findUnique({
      where: { courseId },
      include: {
        questions: { orderBy: { position: 'asc' }, include: { options: { orderBy: { position: 'asc' } } } }
      }
    });
    if (!row) return null;
    return {
      id: row.id,
      courseId: row.courseId,
      passPercent: row.passPercent,
      questionCount: row.questionCount,
      questions: row.questions.map(question => ({
        id: question.id,
        type: question.type,
        prompt: question.prompt,
        explanation: question.explanation,
        acceptedAnswers: question.acceptedAnswers,
        position: question.position,
        options: question.options.map(option => ({
          id: option.id,
          label: option.label,
          isCorrect: option.isCorrect,
          position: option.position
        }))
      }))
    };
  }
}
