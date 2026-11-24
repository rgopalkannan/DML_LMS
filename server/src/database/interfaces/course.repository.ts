import { type CourseLevel, type CourseStatus } from '../../common/constants/domain';
import { type CourseDetail, type CourseSummary } from '../../domain/entities';

export interface NewCourse {
  code: string;
  title: string;
  summary: string;
  category: string;
  level: CourseLevel;
  requiredForNewStaff: boolean;
  certValidityMonths: number;
  instructorId: string | null;
}

export interface ICourseRepository {
  list(filter: { statuses: CourseStatus[] }): Promise<CourseSummary[]>;
  findDetail(id: string): Promise<CourseDetail | null>;
  existsByCode(code: string): Promise<boolean>;
  create(course: NewCourse): Promise<CourseSummary>;
  setStatus(id: string, status: CourseStatus): Promise<void>;
  /** Lesson ids of the course in reading order. */
  lessonIds(courseId: string): Promise<string[]>;
}
