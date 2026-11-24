/*
 * End-to-end check of the critical learner journey against a running stack (seeded database, API, built client):
 * sign in, enrol, complete every lesson, take the quiz, see the result, and check access control and the verify page.
 * Run: BASE_URL=http://localhost:4173 E2E_PASSWORD=... node client/e2e/learner-journey.e2e.mjs
 * Uses Playwright's Chromium; set CHROMIUM_PATH to use another browser binary.
 */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4173';
const LEARNER = process.env.E2E_LEARNER ?? 'omar.learner@example.com';
const PASSWORD = process.env.E2E_PASSWORD;
const COURSE_CODE = process.env.E2E_COURSE ?? 'AWR-180';
if (!PASSWORD) throw new Error('Set E2E_PASSWORD to the seeded accounts password.');

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));

try {
  await page.goto(`${BASE_URL}/certificates`);
  await page.getByRole('heading', { name: 'Sign in' }).waitFor();

  await page.getByLabel('Email').fill(LEARNER);
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('heading', { name: 'Certificates' }).waitFor();

  await page.getByRole('link', { name: 'Course catalog' }).click();
  await page.getByLabel('Search').fill(COURSE_CODE);
  await page.locator('h2 a').first().click();

  /* The test can run again on the same database: it resumes or skips lessons that are already done. */
  const enrol = page.getByRole('button', { name: 'Enrol and start' });
  const resume = page.getByRole('link', { name: 'Continue learning' });
  const quizLink = page.getByRole('link', { name: /final quiz|Retake the quiz/ });
  await enrol.or(resume).or(quizLink).first().waitFor();
  if (!(await quizLink.isVisible())) {
    await ((await enrol.isVisible()) ? enrol : resume).click();
    for (;;) {
      const finish = page.getByRole('button', { name: /Mark complete|Next lesson|Back to course/ });
      await finish.waitFor();
      const label = (await finish.textContent()) ?? '';
      const before = page.url();
      await finish.click();
      await page.waitForURL(url => url.toString() !== before);
      if (/finish|Back to course/.test(label)) break;
    }
  }
  await page.getByText('100% of lessons completed').waitFor();

  await page.getByRole('link', { name: /final quiz|Retake the quiz/ }).click();
  await page.getByRole('button', { name: 'Start the quiz' }).click();
  const submit = page.getByRole('button', { name: 'Submit answers' });
  assert.equal(await submit.isDisabled(), true, 'cannot submit before answering');
  for (const group of await page.getByRole('radiogroup').all()) await group.getByRole('radio').first().click();
  for (const box of await page.getByRole('textbox').all()) await box.fill('answer');
  for (const fieldset of await page.locator('fieldset:has([role=checkbox])').all())
    await fieldset.getByRole('checkbox').first().click();
  await submit.click();
  await page.getByText(/You scored \d+ of \d+/).waitFor();

  await page.goto(`${BASE_URL}/admin/users`);
  await page.getByText('You do not have access to this page').waitFor();

  await page.goto(`${BASE_URL}/verify/DML-2026-000000000000`);
  await page.getByText('No certificate has this ID.').waitFor();

  assert.deepEqual(errors, [], 'no page errors');
  process.stdout.write('E2E learner journey: passed\n');
} finally {
  await browser.close();
}
