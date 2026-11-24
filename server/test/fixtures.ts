/* Test data written straight to the test database. Tests may use Prisma directly; application code may not. */
import { PrismaClient, type Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

export const PASSWORD = 'TestPassword1';

export async function resetDatabase(prisma: PrismaClient): Promise<void> {
  await prisma.$executeRawUnsafe(
    'TRUNCATE "AuditEvent","Certificate","QuizAttempt","LessonProgress","Enrollment","QuestionOption","Question","Quiz","Lesson","CourseModule","Course","User" CASCADE'
  );
}

export async function createUser(prisma: PrismaClient, email: string, role: Role, isActive = true): Promise<string> {
  const passwordHash = await bcrypt.hash(PASSWORD, 4);
  return (
    await prisma.user.create({ data: { email, name: email.split('@')[0] ?? email, role, passwordHash, isActive } })
  ).id;
}

/** A published course with two lessons and a quiz drawing 2 of 3 questions. */
export async function createCourse(
  prisma: PrismaClient,
  code: string,
  status: 'DRAFT' | 'PUBLISHED' = 'PUBLISHED'
): Promise<string> {
  const course = await prisma.course.create({
    data: {
      code,
      title: `${code} title`,
      summary: 'A course used by the integration tests.',
      category: 'Foundations',
      status,
      certValidityMonths: 12,
      modules: {
        create: [
          {
            title: 'Module 1',
            position: 0,
            lessons: {
              create: [
                { title: 'Lesson A', body: 'Text', position: 0 },
                { title: 'Lesson B', body: 'Text', position: 1 }
              ]
            }
          }
        ]
      },
      quiz: {
        create: {
          passPercent: 100,
          questionCount: 2,
          questions: {
            create: [
              {
                type: 'SINGLE',
                prompt: 'Q1',
                position: 0,
                options: {
                  create: [
                    { label: 'right', isCorrect: true, position: 0 },
                    { label: 'wrong', position: 1 }
                  ]
                }
              },
              {
                type: 'TRUE_FALSE',
                prompt: 'Q2',
                position: 1,
                options: {
                  create: [
                    { label: 'True', isCorrect: true, position: 0 },
                    { label: 'False', position: 1 }
                  ]
                }
              },
              { type: 'SHORT_ANSWER', prompt: 'Q3', position: 2, acceptedAnswers: ['goAML'] }
            ]
          }
        }
      }
    }
  });
  return course.id;
}
