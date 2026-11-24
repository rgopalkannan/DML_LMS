import { Inject, Injectable } from '@nestjs/common';
import { type CourseStatus } from '../../common/constants/domain';
import { ERROR_CODES } from '../../common/constants/error-codes';
import { DomainError } from '../../common/errors/domain-error';
import { type AuthUser } from '../../common/types/auth-user';
import { type IUnitOfWork, UNIT_OF_WORK } from '../../database/interfaces/unit-of-work.interface';
import { type CourseDetail, type CourseSummary } from '../../domain/entities';
import { canViewCourse, publishBlockers, visibleStatuses } from './domain/course-rules';
import { type CreateCourseRequestDto } from './dto/course.dto';

const notFound = (): DomainError => new DomainError('not_found', ERROR_CODES.NOT_FOUND, 'Course not found.');

@Injectable()
export class CoursesService {
  constructor(@Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork) {}

  list(viewer: AuthUser): Promise<CourseSummary[]> {
    return this.uow.courses.list({ statuses: visibleStatuses(viewer.role) });
  }

  /** A course the viewer may see; hidden courses read as not found so their existence is not revealed. */
  async get(viewer: AuthUser, courseId: string): Promise<CourseDetail> {
    const course = await this.uow.courses.findDetail(courseId);
    if (!course || !canViewCourse(viewer.role, course.status)) throw notFound();
    return course;
  }

  async create(actor: AuthUser, input: CreateCourseRequestDto): Promise<CourseSummary> {
    return this.uow.transaction(async uow => {
      if (await uow.courses.existsByCode(input.code)) {
        throw new DomainError('conflict', ERROR_CODES.COURSE_CODE_TAKEN, `Course code ${input.code} is already used.`);
      }
      const course = await uow.courses.create({
        ...input,
        instructorId: actor.role === 'INSTRUCTOR' ? actor.id : null
      });
      await uow.audit.record({ actorId: actor.id, action: 'course.create', entity: 'course', entityId: course.id });
      return course;
    });
  }

  async setStatus(actor: AuthUser, courseId: string, status: CourseStatus): Promise<CourseDetail> {
    return this.uow.transaction(async uow => {
      const course = await uow.courses.findDetail(courseId);
      if (!course) throw notFound();
      if (status === 'PUBLISHED') {
        const blockers = publishBlockers(course);
        if (blockers.length > 0) throw new DomainError('validation', ERROR_CODES.COURSE_INCOMPLETE, blockers.join(' '));
      }
      await uow.courses.setStatus(courseId, status);
      await uow.audit.record({
        actorId: actor.id,
        action: `course.${status.toLowerCase()}`,
        entity: 'course',
        entityId: courseId
      });
      return { ...course, status };
    });
  }
}
