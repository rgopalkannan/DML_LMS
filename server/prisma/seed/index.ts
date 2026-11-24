/*
 * Development and demo seed: sample accounts and the sample AML/CFT courses (prisma/seed/courses/*.json).
 * Run: SEED_PASSWORD=... npm run db:seed -w server
 * Safe to run again: records are matched by email and course code. Remove sample data before going live.
 */
import { PrismaClient, type CourseLevel, type LessonType, type QuestionType, type Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

interface SeedCourse {
  code: string;
  title: string;
  summary: string;
  category: string;
  level: CourseLevel;
  status: 'PUBLISHED' | 'DRAFT';
  requiredForNewStaff: boolean;
  certValidityMonths: number;
  instructorName: string | null;
  modules: {
    title: string;
    lessons: { title: string; type: LessonType; body: string; videoUrl: string | null; durationMinutes: number }[];
  }[];
  quiz: {
    passPercent: number;
    questionCount: number;
    questions: {
      type: QuestionType;
      prompt: string;
      explanation: string | null;
      acceptedAnswers?: string[];
      options: { label: string; isCorrect: boolean }[];
    }[];
  } | null;
}

const BCRYPT_ROUNDS = 12;
const MIN_PASSWORD = 10;
const COURSES_DIR = join(__dirname, 'courses');

const SAMPLE_LEARNERS: { email: string; name: string; role: Role }[] = [
  { email: 'admin@example.com', name: 'Sample Administrator', role: 'ADMIN' },
  { email: 'aisha.learner@example.com', name: 'Aisha Rahman (sample)', role: 'LEARNER' },
  { email: 'omar.learner@example.com', name: 'Omar Haddad (sample)', role: 'LEARNER' }
];

const emailFor = (name: string): string =>
  `${name
    .toLowerCase()
    .replace(/^dr\.?\s+/, '')
    .replace(/[^a-z]+/g, '.')
    .replace(/^\.|\.$/g, '')}@example.com`;

async function upsertUser(
  prisma: PrismaClient,
  user: { email: string; name: string; role: Role },
  passwordHash: string
): Promise<string> {
  const row = await prisma.user.upsert({ where: { email: user.email }, update: {}, create: { ...user, passwordHash } });
  return row.id;
}

async function seedCourse(prisma: PrismaClient, course: SeedCourse, instructorId: string | null): Promise<void> {
  const ready =
    course.quiz !== null &&
    course.quiz.questions.length >= course.quiz.questionCount &&
    course.modules.some(m => m.lessons.length > 0);
  await prisma.$transaction(async tx => {
    await tx.course.deleteMany({ where: { code: course.code, enrollments: { none: {} } } });
    if (await tx.course.findUnique({ where: { code: course.code } })) return;
    await tx.course.create({
      data: {
        code: course.code,
        title: course.title,
        summary: course.summary,
        category: course.category,
        level: course.level,
        status: course.status === 'PUBLISHED' && ready ? 'PUBLISHED' : 'DRAFT',
        requiredForNewStaff: course.requiredForNewStaff,
        certValidityMonths: course.certValidityMonths,
        instructorId,
        modules: {
          create: course.modules.map((module, moduleIndex) => ({
            title: module.title,
            position: moduleIndex,
            lessons: { create: module.lessons.map((lesson, lessonIndex) => ({ ...lesson, position: lessonIndex })) }
          }))
        },
        quiz: course.quiz
          ? {
              create: {
                passPercent: course.quiz.passPercent,
                questionCount: course.quiz.questionCount,
                questions: {
                  create: course.quiz.questions.map((question, questionIndex) => ({
                    type: question.type,
                    prompt: question.prompt,
                    explanation: question.explanation,
                    acceptedAnswers: question.acceptedAnswers ?? [],
                    position: questionIndex,
                    options: {
                      create: question.options.map((option, optionIndex) => ({ ...option, position: optionIndex }))
                    }
                  }))
                }
              }
            }
          : undefined
      }
    });
  });
}

async function main(): Promise<void> {
  const password = process.env.SEED_PASSWORD;
  if (!password || password.length < MIN_PASSWORD)
    throw new Error(`Set SEED_PASSWORD (at least ${MIN_PASSWORD} characters) to seed sample accounts.`);
  const prisma = new PrismaClient();
  try {
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    for (const user of SAMPLE_LEARNERS) await upsertUser(prisma, user, passwordHash);
    const files = readdirSync(COURSES_DIR)
      .filter(file => file.endsWith('.json'))
      .sort();
    for (const file of files) {
      const course = JSON.parse(readFileSync(join(COURSES_DIR, file), 'utf8')) as SeedCourse;
      const instructorId = course.instructorName
        ? await upsertUser(
            prisma,
            { email: emailFor(course.instructorName), name: course.instructorName, role: 'INSTRUCTOR' },
            passwordHash
          )
        : null;
      await seedCourse(prisma, course, instructorId);
    }
    process.stdout.write(`Seeded ${SAMPLE_LEARNERS.length} sample accounts and ${files.length} courses.\n`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
