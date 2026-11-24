import { type Prisma } from '@prisma/client';
import { type CourseStatus } from '../../common/constants/domain';
import { type CourseDetail, type CourseSummary } from '../../domain/entities';
import { type ICourseRepository, type NewCourse } from '../interfaces/course.repository';
import { type Db } from './prisma-types';

const summaryInclude = {
  instructor: { select: { name: true } },
  modules: { select: { lessons: { select: { durationMinutes: true } } } },
  quiz: { select: { id: true } }
} satisfies Prisma.CourseInclude;

type SummaryRow = Prisma.CourseGetPayload<{ include: typeof summaryInclude }>;

const toSummary = (row: SummaryRow): CourseSummary => {
  const lessons = row.modules.flatMap(module => module.lessons);
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    summary: row.summary,
    category: row.category,
    level: row.level,
    status: row.status,
    requiredForNewStaff: row.requiredForNewStaff,
    certValidityMonths: row.certValidityMonths,
    instructorName: row.instructor?.name ?? null,
    lessonCount: lessons.length,
    totalMinutes: lessons.reduce((sum, lesson) => sum + lesson.durationMinutes, 0),
    hasQuiz: row.quiz !== null
  };
};

export class PrismaCourseRepository implements ICourseRepository {
  constructor(private readonly db: Db) {}

  async list(filter: { statuses: CourseStatus[] }): Promise<CourseSummary[]> {
    const rows = await this.db.course.findMany({
      where: { status: { in: filter.statuses } },
      include: summaryInclude,
      orderBy: { code: 'asc' }
    });
    return rows.map(toSummary);
  }

  async findDetail(id: string): Promise<CourseDetail | null> {
    const row = await this.db.course.findUnique({
      where: { id },
      include: {
        instructor: { select: { name: true } },
        modules: { orderBy: { position: 'asc' }, include: { lessons: { orderBy: { position: 'asc' } } } },
        quiz: { select: { id: true, passPercent: true, questionCount: true, _count: { select: { questions: true } } } }
      }
    });
    if (!row) return null;
    const summary = toSummary({ ...row, quiz: row.quiz ? { id: row.quiz.id } : null });
    return {
      ...summary,
      modules: row.modules.map(module => ({
        id: module.id,
        title: module.title,
        position: module.position,
        lessons: module.lessons.map(lesson => ({ ...lesson }))
      })),
      quiz: row.quiz
        ? {
            id: row.quiz.id,
            passPercent: row.quiz.passPercent,
            questionCount: row.quiz.questionCount,
            bankSize: row.quiz._count.questions
          }
        : null
    };
  }

  async existsByCode(code: string): Promise<boolean> {
    return (await this.db.course.count({ where: { code } })) > 0;
  }

  async create(course: NewCourse): Promise<CourseSummary> {
    return toSummary(await this.db.course.create({ data: course, include: summaryInclude }));
  }

  async setStatus(id: string, status: CourseStatus): Promise<void> {
    await this.db.course.update({ where: { id }, data: { status } });
  }

  async lessonIds(courseId: string): Promise<string[]> {
    const lessons = await this.db.lesson.findMany({
      where: { module: { courseId } },
      orderBy: [{ module: { position: 'asc' } }, { position: 'asc' }],
      select: { id: true }
    });
    return lessons.map(lesson => lesson.id);
  }
}
