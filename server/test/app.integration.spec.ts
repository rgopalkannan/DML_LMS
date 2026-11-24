/* API-to-database tests against a real PostgreSQL (DATABASE_URL_TEST). Covers the learner journey, guards, validation and idempotency. */
import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';
import { createCourse, createUser, PASSWORD, resetDatabase } from './fixtures';

const DATABASE_URL = process.env.DATABASE_URL_TEST ?? 'postgresql://lms:lms_dev@localhost:5432/lms_test?schema=public';
Object.assign(process.env, {
  DATABASE_URL,
  JWT_SECRET: 'test-secret-that-is-long-enough-for-checks',
  NODE_ENV: 'test',
  RATE_LIMIT_PER_MINUTE: '1000',
  LOG_LEVEL: 'error'
});

const prisma = new PrismaClient({ datasources: { db: { url: DATABASE_URL } } });
let app: INestApplication;
let courseId: string;
let draftId: string;

const api = () => request(app.getHttpServer());
/* Tokens are cached per account: the login route allows only 10 attempts a minute, which these tests would exceed. */
const tokens = new Map<string, string>();
const login = async (email: string): Promise<string> => {
  const cached = tokens.get(email);
  if (cached) return cached;
  const token = (await api().post('/api/v1/auth/login').send({ email, password: PASSWORD }).expect(200)).body
    .accessToken as string;
  tokens.set(email, token);
  return token;
};
const key = (): string => `k${Math.random().toString(36).slice(2)}${Date.now()}`;

async function correctAnswers(
  questionIds: string[]
): Promise<{ questionId: string; optionIds: string[]; text?: string }[]> {
  const questions = await prisma.question.findMany({ where: { id: { in: questionIds } }, include: { options: true } });
  return questions.map(question => ({
    questionId: question.id,
    optionIds: question.options.filter(option => option.isCorrect).map(option => option.id),
    ...(question.type === 'SHORT_ANSWER' ? { text: ' GoAML. ' } : {})
  }));
}

beforeAll(async () => {
  await resetDatabase(prisma);
  await createUser(prisma, 'admin@test.example', 'ADMIN');
  await createUser(prisma, 'learner@test.example', 'LEARNER');
  await createUser(prisma, 'other@test.example', 'LEARNER');
  await createUser(prisma, 'gone@test.example', 'LEARNER', false);
  courseId = await createCourse(prisma, 'TST-101');
  draftId = await createCourse(prisma, 'TST-102', 'DRAFT');
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  app = moduleRef.createNestApplication({ logger: false });
  configureApp(app);
  await app.init();
});

afterAll(async () => {
  await app.close();
  await prisma.$disconnect();
});

describe('authentication', () => {
  it('rejects a wrong password and an inactive account with the same error', async () => {
    const wrong = await api()
      .post('/api/v1/auth/login')
      .send({ email: 'learner@test.example', password: 'Nope123456' })
      .expect(401);
    const inactive = await api()
      .post('/api/v1/auth/login')
      .send({ email: 'gone@test.example', password: PASSWORD })
      .expect(401);
    expect(wrong.body.error.code).toBe('INVALID_CREDENTIALS');
    expect(inactive.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('requires a token on protected routes', async () => {
    const response = await api().get('/api/v1/courses').expect(401);
    expect(response.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('rejects unknown fields', async () => {
    await api().post('/api/v1/auth/login').send({ email: 'a@b.co', password: 'x', isAdmin: true }).expect(400);
  });
});

describe('authorization', () => {
  it('keeps learners out of user administration', async () => {
    const token = await login('learner@test.example');
    await api().get('/api/v1/users').set('Authorization', `Bearer ${token}`).expect(403);
  });

  it('hides draft courses from learners but not from admins', async () => {
    const learner = await login('learner@test.example');
    const admin = await login('admin@test.example');
    await api().get(`/api/v1/courses/${draftId}`).set('Authorization', `Bearer ${learner}`).expect(404);
    await api().get(`/api/v1/courses/${draftId}`).set('Authorization', `Bearer ${admin}`).expect(200);
  });
});

describe('administration', () => {
  it('creates a user once and rejects a duplicate email', async () => {
    const admin = await login('admin@test.example');
    const body = { email: 'New.Person@Test.Example', name: 'New Person', role: 'LEARNER', password: 'Welcome2026x' };
    const created = await api().post('/api/v1/users').set('Authorization', `Bearer ${admin}`).send(body).expect(201);
    expect(created.body.email).toBe('new.person@test.example');
    expect(created.body.passwordHash).toBeUndefined();
    const again = await api().post('/api/v1/users').set('Authorization', `Bearer ${admin}`).send(body).expect(409);
    expect(again.body.error.code).toBe('EMAIL_TAKEN');
  });

  it('refuses to publish a course whose quiz bank is too small', async () => {
    const admin = await login('admin@test.example');
    await prisma.quiz.update({ where: { courseId: draftId }, data: { questionCount: 10 } });
    const response = await api()
      .patch(`/api/v1/courses/${draftId}/status`)
      .set('Authorization', `Bearer ${admin}`)
      .send({ status: 'PUBLISHED' })
      .expect(400);
    expect(response.body.error.code).toBe('COURSE_INCOMPLETE');
  });
});

describe('learner journey', () => {
  it('enrols, completes lessons, passes the quiz once and gets a verifiable certificate', async () => {
    const token = await login('learner@test.example');
    const auth = { Authorization: `Bearer ${token}` };
    await api().post(`/api/v1/courses/${courseId}/quiz/draw`).set(auth).expect(403);
    await api().post(`/api/v1/courses/${courseId}/enrollment`).set(auth).expect(200);
    await api().post(`/api/v1/courses/${courseId}/enrollment`).set(auth).expect(200);
    const locked = await api().post(`/api/v1/courses/${courseId}/quiz/draw`).set(auth).expect(400);
    expect(locked.body.error.code).toBe('LESSONS_INCOMPLETE');

    const detail = await api().get(`/api/v1/courses/${courseId}`).set(auth).expect(200);
    const lessonIds: string[] = detail.body.modules.flatMap((module: { lessons: { id: string }[] }) =>
      module.lessons.map(lesson => lesson.id)
    );
    for (const lessonId of lessonIds)
      await api().post(`/api/v1/courses/${courseId}/lessons/${lessonId}/complete`).set(auth).expect(200);
    const progress = await api().get(`/api/v1/courses/${courseId}/progress`).set(auth).expect(200);
    expect(progress.body).toMatchObject({ percent: 100, quizUnlocked: true, status: 'IN_PROGRESS' });

    const draw = await api().post(`/api/v1/courses/${courseId}/quiz/draw`).set(auth).expect(200);
    expect(draw.body.questions).toHaveLength(2);
    expect(JSON.stringify(draw.body)).not.toContain('isCorrect');

    const failed = await api()
      .post(`/api/v1/courses/${courseId}/quiz/attempts`)
      .set(auth)
      .send({ drawToken: draw.body.drawToken, idempotencyKey: key(), answers: [] })
      .expect(200);
    expect(failed.body).toMatchObject({ passed: false, score: 0, certificateId: null });

    const passKey = key();
    const answers = await correctAnswers(draw.body.questions.map((question: { id: string }) => question.id));
    const submit = () =>
      api()
        .post(`/api/v1/courses/${courseId}/quiz/attempts`)
        .set(auth)
        .send({ drawToken: draw.body.drawToken, idempotencyKey: passKey, answers });
    const [first, second] = await Promise.all([submit(), submit()]);
    expect(first.status).toBe(200);
    expect(first.body.passed).toBe(true);
    expect(second.body.certificateId).toBe(first.body.certificateId);
    expect(await prisma.quizAttempt.count()).toBe(2);
    expect(await prisma.certificate.count()).toBe(1);

    const certificates = await api().get('/api/v1/me/certificates').set(auth).expect(200);
    const serial: string = certificates.body[0].serial;
    const pdf = await api().get(`/api/v1/certificates/${first.body.certificateId}/pdf`).set(auth).expect(200);
    expect(pdf.headers['content-type']).toContain('application/pdf');

    const other = await login('other@test.example');
    await api()
      .get(`/api/v1/certificates/${first.body.certificateId}/pdf`)
      .set('Authorization', `Bearer ${other}`)
      .expect(404);

    const verified = await api().get(`/api/v1/certificates/verify/${serial}`).expect(200);
    expect(verified.body).toMatchObject({ valid: true, certificate: { courseCode: 'TST-101' } });
    const unknown = await api().get('/api/v1/certificates/verify/DML-2026-000000000000').expect(200);
    expect(unknown.body.valid).toBe(false);
  });

  it('rejects a draw token issued to another learner', async () => {
    const owner = await login('learner@test.example');
    const draw = await api()
      .post(`/api/v1/courses/${courseId}/quiz/draw`)
      .set('Authorization', `Bearer ${owner}`)
      .expect(200);
    const other = await login('other@test.example');
    await api().post(`/api/v1/courses/${courseId}/enrollment`).set('Authorization', `Bearer ${other}`).expect(200);
    const lessons = await prisma.lesson.findMany({ where: { module: { courseId } } });
    for (const lesson of lessons)
      await api()
        .post(`/api/v1/courses/${courseId}/lessons/${lesson.id}/complete`)
        .set('Authorization', `Bearer ${other}`)
        .expect(200);
    const response = await api()
      .post(`/api/v1/courses/${courseId}/quiz/attempts`)
      .set('Authorization', `Bearer ${other}`)
      .send({ drawToken: draw.body.drawToken, idempotencyKey: key(), answers: [] })
      .expect(400);
    expect(response.body.error.code).toBe('QUIZ_DRAW_INVALID');
  });
});
