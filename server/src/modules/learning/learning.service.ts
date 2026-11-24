import { Inject, Injectable } from '@nestjs/common';
import { ERROR_CODES } from '../../common/constants/error-codes';
import { DomainError } from '../../common/errors/domain-error';
import { type AuthUser } from '../../common/types/auth-user';
import { type IUnitOfWork, UNIT_OF_WORK } from '../../database/interfaces/unit-of-work.interface';
import { type CourseSummary, type Enrollment, type QuizAttempt } from '../../domain/entities';
import { CoursesService } from '../courses/courses.service';
import { allLessonsComplete, progressPercent, statusAfterLesson } from './domain/progress';

export interface CourseProgress {
  enrollment: Enrollment | null;
  completedLessonIds: string[];
  percent: number;
  quizUnlocked: boolean;
  attempts: QuizAttempt[];
  certificateId: string | null;
}

export interface MyCourse {
  course: CourseSummary;
  enrollment: Enrollment;
  percent: number;
}

@Injectable()
export class LearningService {
  constructor(
    @Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
    private readonly courses: CoursesService
  ) {}

  async enroll(learner: AuthUser, courseId: string): Promise<CourseProgress> {
    const course = await this.courses.get(learner, courseId);
    if (course.status !== 'PUBLISHED') {
      throw new DomainError(
        'validation',
        ERROR_CODES.COURSE_NOT_PUBLISHED,
        'This course is not open for enrolment yet.'
      );
    }
    await this.uow.transaction(async uow => {
      const enrollment = await uow.enrollments.create(learner.id, courseId);
      await uow.audit.record({
        actorId: learner.id,
        action: 'enrollment.create',
        entity: 'enrollment',
        entityId: enrollment.id
      });
    });
    return this.progress(learner, courseId);
  }

  async progress(learner: AuthUser, courseId: string): Promise<CourseProgress> {
    await this.courses.get(learner, courseId);
    const enrollment = await this.uow.enrollments.find(learner.id, courseId);
    const lessonIds = await this.uow.courses.lessonIds(courseId);
    if (!enrollment) {
      return {
        enrollment: null,
        completedLessonIds: [],
        percent: 0,
        quizUnlocked: false,
        attempts: [],
        certificateId: null
      };
    }
    const [completed, attempts, certificate] = await Promise.all([
      this.uow.enrollments.completedLessonIds(enrollment.id),
      this.uow.attempts.listForEnrollment(enrollment.id),
      this.uow.certificates.findByEnrollment(enrollment.id)
    ]);
    return {
      enrollment,
      completedLessonIds: completed.filter(id => lessonIds.includes(id)),
      percent: progressPercent(completed, lessonIds),
      quizUnlocked: allLessonsComplete(completed, lessonIds),
      attempts,
      certificateId: certificate?.id ?? null
    };
  }

  async completeLesson(learner: AuthUser, courseId: string, lessonId: string): Promise<CourseProgress> {
    await this.uow.transaction(async uow => {
      const enrollment = await this.requireEnrollment(uow, learner.id, courseId);
      const lessonIds = await uow.courses.lessonIds(courseId);
      if (!lessonIds.includes(lessonId))
        throw new DomainError('not_found', ERROR_CODES.NOT_FOUND, 'Lesson not found in this course.');
      await uow.enrollments.markLessonComplete(enrollment.id, lessonId);
      const next = statusAfterLesson(enrollment.status);
      if (next !== enrollment.status) await uow.enrollments.setStatus(enrollment.id, next, enrollment.completedAt);
    });
    return this.progress(learner, courseId);
  }

  async myCourses(learner: AuthUser): Promise<MyCourse[]> {
    const enrollments = await this.uow.enrollments.listForUser(learner.id);
    const courses = new Map(
      (await this.uow.courses.list({ statuses: ['PUBLISHED', 'DRAFT', 'ARCHIVED'] })).map(c => [c.id, c])
    );
    const result: MyCourse[] = [];
    for (const enrollment of enrollments) {
      const course = courses.get(enrollment.courseId);
      if (!course) continue;
      const [completed, lessonIds] = await Promise.all([
        this.uow.enrollments.completedLessonIds(enrollment.id),
        this.uow.courses.lessonIds(course.id)
      ]);
      result.push({ course, enrollment, percent: progressPercent(completed, lessonIds) });
    }
    return result;
  }

  async requireEnrollment(uow: IUnitOfWork, userId: string, courseId: string): Promise<Enrollment> {
    const enrollment = await uow.enrollments.find(userId, courseId);
    if (!enrollment) throw new DomainError('forbidden', ERROR_CODES.NOT_ENROLLED, 'Enrol in this course first.');
    return enrollment;
  }
}
