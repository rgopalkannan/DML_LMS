import { type CourseDetail } from '../../../domain/entities';
import { canViewCourse, publishBlockers, visibleStatuses } from './course-rules';

const course = (overrides: Partial<CourseDetail>): CourseDetail => ({
  id: 'c',
  code: 'AML-101',
  title: 't',
  summary: 's',
  category: 'Foundations',
  level: 'BEGINNER',
  status: 'DRAFT',
  requiredForNewStaff: false,
  certValidityMonths: 12,
  instructorName: null,
  lessonCount: 2,
  totalMinutes: 10,
  hasQuiz: true,
  modules: [],
  quiz: { id: 'q', passPercent: 70, questionCount: 8, bankSize: 10 },
  ...overrides
});

describe('course rules', () => {
  it('shows learners only published courses', () => {
    expect(visibleStatuses('LEARNER')).toEqual(['PUBLISHED']);
    expect(canViewCourse('LEARNER', 'DRAFT')).toBe(false);
    expect(canViewCourse('INSTRUCTOR', 'DRAFT')).toBe(true);
    expect(canViewCourse('ADMIN', 'ARCHIVED')).toBe(false);
  });

  it('allows publishing a complete course', () => {
    expect(publishBlockers(course({}))).toEqual([]);
  });

  it('blocks a course without lessons or quiz', () => {
    expect(publishBlockers(course({ lessonCount: 0, quiz: null }))).toHaveLength(2);
  });

  it('blocks a quiz whose bank is smaller than the draw', () => {
    expect(publishBlockers(course({ quiz: { id: 'q', passPercent: 70, questionCount: 8, bankSize: 5 } }))[0]).toMatch(
      /only has 5/
    );
  });
});
