import { Inject, Injectable } from '@nestjs/common';
import { LIMITS } from '../../common/constants/domain';
import { ERROR_CODES } from '../../common/constants/error-codes';
import { DomainError } from '../../common/errors/domain-error';
import { type AuthUser } from '../../common/types/auth-user';
import { type IUnitOfWork, UNIT_OF_WORK } from '../../database/interfaces/unit-of-work.interface';
import { type Question, type Quiz, type SubmittedAnswer } from '../../domain/entities';
import { type ITokenService, TOKEN_SERVICE } from '../../integrations/tokens/token-service';
import { CertificatesService } from '../certificates/certificates.service';
import { LearningService } from '../learning/learning.service';
import { drawQuestionIds } from './domain/draw';
import { type GradeResult, gradeAttempt } from './domain/grading';

export interface QuizDraw {
  drawToken: string;
  passPercent: number;
  questions: Question[];
}

export interface AttemptOutcome extends GradeResult {
  attemptId: string;
  passPercent: number;
  certificateId: string | null;
}

const drawInvalid = (): DomainError =>
  new DomainError('validation', ERROR_CODES.QUIZ_DRAW_INVALID, 'This quiz has expired. Start it again.');

@Injectable()
export class QuizzesService {
  constructor(
    @Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
    @Inject(TOKEN_SERVICE) private readonly tokens: ITokenService,
    private readonly learning: LearningService,
    private readonly certificates: CertificatesService
  ) {}

  /** Draws a fresh set of questions; the signed token pins which ones this attempt must answer. */
  async draw(learner: AuthUser, courseId: string): Promise<QuizDraw> {
    const quiz = await this.unlockedQuiz(learner, courseId);
    const questionIds = drawQuestionIds(
      quiz.questions.map(question => question.id),
      quiz.questionCount
    );
    const drawToken = await this.tokens.sign(
      'quiz-draw',
      learner.id,
      { quizId: quiz.id, questionIds },
      LIMITS.QUIZ_DRAW_TTL_SECONDS
    );
    const byId = new Map(quiz.questions.map(question => [question.id, question]));
    return { drawToken, passPercent: quiz.passPercent, questions: questionIds.map(id => byId.get(id) as Question) };
  }

  async submit(
    learner: AuthUser,
    courseId: string,
    drawToken: string,
    idempotencyKey: string,
    answers: SubmittedAnswer[]
  ): Promise<AttemptOutcome> {
    const quiz = await this.unlockedQuiz(learner, courseId);
    const questions = await this.questionsFromToken(learner, quiz, drawToken);
    const course = await this.uow.courses.findDetail(courseId);
    const validityMonths = course?.certValidityMonths ?? 0;

    return this.uow.transaction(async uow => {
      const enrollment = await this.learning.requireEnrollment(uow, learner.id, courseId);
      const previous = await uow.attempts.findByIdempotencyKey(idempotencyKey);
      const grade = gradeAttempt(questions, answers, quiz.passPercent);
      if (previous) {
        if (previous.enrollmentId !== enrollment.id)
          throw new DomainError('conflict', ERROR_CODES.CONFLICT, 'Duplicate submission.');
        const certificate = await uow.certificates.findByEnrollment(enrollment.id);
        return {
          ...grade,
          attemptId: previous.id,
          passPercent: quiz.passPercent,
          certificateId: certificate?.id ?? null
        };
      }
      const attempt = await uow.attempts.create({
        enrollmentId: enrollment.id,
        quizId: quiz.id,
        idempotencyKey,
        questionIds: questions.map(question => question.id),
        answers,
        score: grade.score,
        total: grade.total,
        percent: grade.percent,
        passed: grade.passed
      });
      let certificateId: string | null = null;
      if (grade.passed) {
        const now = new Date();
        if (enrollment.status !== 'COMPLETED') await uow.enrollments.setStatus(enrollment.id, 'COMPLETED', now);
        certificateId = (await this.certificates.issue(uow, enrollment, grade.percent, validityMonths, now)).id;
      }
      return { ...grade, attemptId: attempt.id, passPercent: quiz.passPercent, certificateId };
    });
  }

  private async unlockedQuiz(learner: AuthUser, courseId: string): Promise<Quiz> {
    const progress = await this.learning.progress(learner, courseId);
    if (!progress.enrollment)
      throw new DomainError('forbidden', ERROR_CODES.NOT_ENROLLED, 'Enrol in this course first.');
    if (!progress.quizUnlocked) {
      throw new DomainError('validation', ERROR_CODES.LESSONS_INCOMPLETE, 'Finish every lesson before the final quiz.');
    }
    const quiz = await this.uow.quizzes.findByCourseId(courseId);
    if (!quiz || quiz.questions.length === 0)
      throw new DomainError('not_found', ERROR_CODES.NOT_FOUND, 'This course has no quiz.');
    return quiz;
  }

  private async questionsFromToken(learner: AuthUser, quiz: Quiz, drawToken: string): Promise<Question[]> {
    const claims = await this.tokens.verify('quiz-draw', drawToken);
    if (!claims || claims.sub !== learner.id || claims.quizId !== quiz.id || !Array.isArray(claims.questionIds))
      throw drawInvalid();
    const byId = new Map(quiz.questions.map(question => [question.id, question]));
    const questions = (claims.questionIds as unknown[]).map(id => (typeof id === 'string' ? byId.get(id) : undefined));
    if (questions.some(question => question === undefined)) throw drawInvalid();
    return questions as Question[];
  }
}
