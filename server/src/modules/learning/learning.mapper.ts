import { type QuizAttempt } from '../../domain/entities';
import { toCourseSummaryResponse } from '../courses/course.mapper';
import { type AttemptSummaryDto, type CourseProgressResponseDto, type MyCourseResponseDto } from './dto/learning.dto';
import { type CourseProgress, type MyCourse } from './learning.service';

export const toAttemptSummary = (attempt: QuizAttempt): AttemptSummaryDto => ({
  id: attempt.id,
  score: attempt.score,
  total: attempt.total,
  percent: attempt.percent,
  passed: attempt.passed,
  submittedAt: attempt.submittedAt.toISOString()
});

export const toProgressResponse = (progress: CourseProgress): CourseProgressResponseDto => ({
  enrolled: progress.enrollment !== null,
  status: progress.enrollment?.status ?? null,
  completedLessonIds: progress.completedLessonIds,
  percent: progress.percent,
  quizUnlocked: progress.quizUnlocked,
  attempts: progress.attempts.map(toAttemptSummary),
  certificateId: progress.certificateId
});

export const toMyCourseResponse = (item: MyCourse): MyCourseResponseDto => ({
  course: toCourseSummaryResponse(item.course),
  status: item.enrollment.status,
  percent: item.percent,
  enrolledAt: item.enrollment.enrolledAt.toISOString(),
  completedAt: item.enrollment.completedAt?.toISOString() ?? null
});
