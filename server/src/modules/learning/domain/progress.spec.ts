import { allLessonsComplete, progressPercent, statusAfterLesson } from './progress';

describe('progress rules', () => {
  it('is 0 for a course with no lessons', () => {
    expect(progressPercent([], [])).toBe(0);
    expect(allLessonsComplete([], [])).toBe(false);
  });

  it('rounds down and ignores lessons from other courses', () => {
    expect(progressPercent(['a', 'x'], ['a', 'b', 'c'])).toBe(33);
  });

  it('reaches 100 only when every lesson is done', () => {
    expect(progressPercent(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(100);
    expect(allLessonsComplete(['c', 'b', 'a'], ['a', 'b', 'c'])).toBe(true);
  });

  it('moves to in progress but never back from completed', () => {
    expect(statusAfterLesson('ENROLLED')).toBe('IN_PROGRESS');
    expect(statusAfterLesson('COMPLETED')).toBe('COMPLETED');
  });
});
