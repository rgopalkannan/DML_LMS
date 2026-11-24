import { type CourseDetail, type CourseSummary } from '../../domain/entities';
import { type CourseDetailResponseDto, type CourseSummaryResponseDto } from './dto/course.dto';

export const toCourseSummaryResponse = (course: CourseSummary): CourseSummaryResponseDto => ({
  id: course.id,
  code: course.code,
  title: course.title,
  summary: course.summary,
  category: course.category,
  level: course.level,
  status: course.status,
  requiredForNewStaff: course.requiredForNewStaff,
  certValidityMonths: course.certValidityMonths,
  instructorName: course.instructorName,
  lessonCount: course.lessonCount,
  totalMinutes: course.totalMinutes,
  hasQuiz: course.hasQuiz
});

export const toCourseDetailResponse = (course: CourseDetail): CourseDetailResponseDto => ({
  ...toCourseSummaryResponse(course),
  modules: course.modules.map(module => ({
    id: module.id,
    title: module.title,
    lessons: module.lessons.map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      type: lesson.type,
      body: lesson.body,
      videoUrl: lesson.videoUrl,
      durationMinutes: lesson.durationMinutes
    }))
  })),
  quiz: course.quiz ? { passPercent: course.quiz.passPercent, questionCount: course.quiz.questionCount } : null
});
