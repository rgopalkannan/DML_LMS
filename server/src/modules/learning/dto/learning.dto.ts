import { type EnrollmentStatus } from '../../../common/constants/domain';
import { type CourseSummaryResponseDto } from '../../courses/dto/course.dto';

export interface AttemptSummaryDto {
  id: string;
  score: number;
  total: number;
  percent: number;
  passed: boolean;
  submittedAt: string;
}

export interface CourseProgressResponseDto {
  enrolled: boolean;
  status: EnrollmentStatus | null;
  completedLessonIds: string[];
  percent: number;
  quizUnlocked: boolean;
  attempts: AttemptSummaryDto[];
  certificateId: string | null;
}

export interface MyCourseResponseDto {
  course: CourseSummaryResponseDto;
  status: EnrollmentStatus;
  percent: number;
  enrolledAt: string;
  completedAt: string | null;
}
