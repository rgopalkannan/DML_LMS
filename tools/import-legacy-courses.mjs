/*
 * One-time import of the sample courses from the original no-build app into JSON seed files.
 * Usage: node tools/import-legacy-courses.mjs <path-to-old-app> <output-dir>
 * Matching questions and per-lesson quizzes are not in stage 1 and are skipped (counted in the summary).
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';

const [legacyDir, outDir] = process.argv.slice(2);
if (!legacyDir || !outDir) {
  process.stderr.write('Usage: node tools/import-legacy-courses.mjs <old-app-dir> <output-dir>\n');
  process.exit(1);
}

const LEVELS = { Beginner: 'BEGINNER', Intermediate: 'INTERMEDIATE', Advanced: 'ADVANCED' };
const LESSON_TYPES = { reading: 'READING', video: 'VIDEO' };
const DEFAULT_MINUTES = 5;

function loadLegacySeed(dir) {
  const sandbox = { SAM: { seed: { courses: [], instructors: [] } } };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  for (const folder of ['courses', 'instructors']) {
    const path = join(dir, 'src', 'seed', folder);
    for (const file of readdirSync(path)
      .filter(name => name.endsWith('.js'))
      .sort()) {
      vm.runInContext(readFileSync(join(path, file), 'utf8'), context, { filename: file, timeout: 1000 });
    }
  }
  return sandbox.SAM.seed;
}

function convertQuestion(question) {
  const base = { prompt: question.q, explanation: question.explain ?? null };
  switch (question.type) {
    case 'single':
      return {
        ...base,
        type: 'SINGLE',
        options: question.options.map((label, index) => ({ label, isCorrect: index === question.answer }))
      };
    case 'multiple':
      return {
        ...base,
        type: 'MULTIPLE',
        options: question.options.map((label, index) => ({ label, isCorrect: question.answers.includes(index) }))
      };
    case 'truefalse':
      return {
        ...base,
        type: 'TRUE_FALSE',
        options: [
          { label: 'True', isCorrect: question.answer === true },
          { label: 'False', isCorrect: question.answer === false }
        ]
      };
    case 'short':
      return { ...base, type: 'SHORT_ANSWER', acceptedAnswers: question.accepted, options: [] };
    default:
      return null;
  }
}

function convertCourse(course, instructors) {
  const instructor = instructors.find(item => item.name === course.instructor);
  const questions = (course.quiz?.questions ?? []).map(convertQuestion);
  const kept = questions.filter(Boolean);
  return {
    course: {
      code: course.code,
      title: course.title,
      summary: course.summary,
      category: course.category,
      level: LEVELS[course.level] ?? 'BEGINNER',
      status: course.published ? 'PUBLISHED' : 'DRAFT',
      requiredForNewStaff: Boolean(course.onboarding),
      certValidityMonths: course.certMonths ?? 12,
      instructorName: instructor?.name ?? null,
      instructorTitle: instructor?.title ?? null,
      modules: [
        {
          title: 'Course lessons',
          lessons: course.lessons.map(lesson => ({
            title: lesson.title,
            type: LESSON_TYPES[lesson.type] ?? 'READING',
            body: lesson.content ?? '',
            videoUrl: lesson.type === 'video' && lesson.url ? lesson.url : null,
            durationMinutes: lesson.minutes ?? DEFAULT_MINUTES
          }))
        }
      ],
      quiz: kept.length
        ? {
            passPercent: course.quiz.passMark ?? 70,
            questionCount: Math.min(course.quiz.drawCount || kept.length, kept.length),
            questions: kept
          }
        : null
    },
    skipped: {
      questions: questions.length - kept.length,
      lessonQuizzes: course.lessons.filter(lesson => lesson.quiz).length
    }
  };
}

const seed = loadLegacySeed(legacyDir);
mkdirSync(outDir, { recursive: true });
for (const legacy of seed.courses) {
  const { course, skipped } = convertCourse(legacy, seed.instructors);
  writeFileSync(join(outDir, `${course.code.toLowerCase()}.json`), JSON.stringify(course, null, 2) + '\n');
  process.stdout.write(
    `${course.code}: ${course.modules[0].lessons.length} lessons, ${course.quiz?.questions.length ?? 0} questions (skipped ${skipped.questions} matching, ${skipped.lessonQuizzes} lesson quizzes)\n`
  );
}
