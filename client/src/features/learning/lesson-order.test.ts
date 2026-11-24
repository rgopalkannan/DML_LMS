import type { CourseDetail, Lesson } from '@/types/api';
import { firstIncompleteLesson, nextLesson, orderedLessons, previousLesson } from './lesson-order';

const lesson = (id: string): Lesson => ({
  id,
  title: id,
  type: 'READING',
  body: '',
  videoUrl: null,
  durationMinutes: 5
});
const course = {
  modules: [
    { id: 'm1', title: 'One', lessons: [lesson('a'), lesson('b')] },
    { id: 'm2', title: 'Two', lessons: [lesson('c')] }
  ]
} as CourseDetail;

describe('lesson order', () => {
  it('flattens modules in order', () => {
    expect(orderedLessons(course).map(item => item.id)).toEqual(['a', 'b', 'c']);
  });

  it('moves across module boundaries', () => {
    expect(nextLesson(course, 'b')?.id).toBe('c');
    expect(previousLesson(course, 'c')?.id).toBe('b');
    expect(nextLesson(course, 'c')).toBeNull();
    expect(previousLesson(course, 'a')).toBeNull();
  });

  it('finds the first incomplete lesson', () => {
    expect(firstIncompleteLesson(course, ['a'])?.id).toBe('b');
    expect(firstIncompleteLesson(course, ['a', 'b', 'c'])).toBeNull();
  });
});
