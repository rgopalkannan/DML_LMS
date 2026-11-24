import type { CourseDetail, Lesson } from '@/types/api';

/** Lessons of a course in reading order across its modules. */
export const orderedLessons = (course: CourseDetail): Lesson[] => course.modules.flatMap(module => module.lessons);

export function nextLesson(course: CourseDetail, lessonId: string): Lesson | null {
  const lessons = orderedLessons(course);
  const index = lessons.findIndex(lesson => lesson.id === lessonId);
  return index >= 0 ? (lessons[index + 1] ?? null) : null;
}

export function previousLesson(course: CourseDetail, lessonId: string): Lesson | null {
  const lessons = orderedLessons(course);
  const index = lessons.findIndex(lesson => lesson.id === lessonId);
  return index > 0 ? (lessons[index - 1] ?? null) : null;
}

/** Where "Continue" should go: the first lesson not yet completed, or null when all are done. */
export function firstIncompleteLesson(course: CourseDetail, completedIds: readonly string[]): Lesson | null {
  const done = new Set(completedIds);
  return orderedLessons(course).find(lesson => !done.has(lesson.id)) ?? null;
}
