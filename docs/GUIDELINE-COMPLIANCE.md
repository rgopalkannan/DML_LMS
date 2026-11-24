# Guideline compliance (stage 1)

How this codebase meets the LMS Development Guideline, section by section. "Stage 2" marks items that are planned but
not built yet; nothing below is claimed without code or a check behind it.

## 1. Technology stack

| Guideline | Status | Where |
| --- | --- | --- |
| React 19, TypeScript 5.7, Vite 6 | Met | `client/package.json` |
| Tailwind CSS 3.4, Radix UI | Met | `client/tailwind.config.ts`, `client/src/components/ui` |
| React Router 8, TanStack React Query 5 | Met | `client/src/routes`, `client/src/features/*/*-queries.ts` |
| Axios | Met | `client/src/api/http-client.ts` |
| Node.js 22, NestJS 11, Express 5 | Met (NestJS 11's Express adapter) | `server/` |
| PostgreSQL 14+ | Met (tested on 16) | `server/prisma/schema.prisma` |
| Prisma 5 behind repositories | Met | `server/src/database` |
| Passport JWT, bcryptjs, Helmet, Throttler | Met | `modules/auth`, `bootstrap.ts`, `app.module.ts` |
| OCI Object Storage | Stage 2 (no uploads in stage 1) | |
| PDFKit / ExcelJS | PDFKit met; ExcelJS stage 2 (exports) | `integrations/documents` |
| Nodemailer, NestJS Schedule | Stage 2 (notifications, reminders) | |
| Vitest, Testing Library, ESLint, Husky | Met | `vitest.config.ts`, `eslint.config.mjs`, `.husky/` |
| Docker, Compose, Bitbucket Pipelines, OCI Registry | Met (pipeline pushes to OCI Registry with repository variables) | `Dockerfile`s, `docker-compose.yml`, `bitbucket-pipelines.yml` |

## 2. Architecture

- Layer boundaries: controllers hold no business rules or queries; services use only `IUnitOfWork`; Prisma is imported
  only in `server/src/database` (enforced by an ESLint `no-restricted-imports` rule).
- Unit of Work and transactions: `IUnitOfWork.transaction()`; multi-step writes (quiz submission, certificate issue,
  user and course changes with their audit event) run inside one.
- Integrations behind interfaces: `IPasswordHasher`, `ITokenService`, `ICertificateDocument`, `IHealthProbe`.
- Domain modelling: Course → Module → Lesson → Quiz; enrolment, progress, attempts and certificates are separate
  tables with constraints; states are enums in the schema and in `common/constants/domain.ts`.
- Project structure follows section 2.4 (`client/{app,routes,features,components/ui,components/layout,hooks,api,types,constants}`,
  `server/{modules,common,database/{interfaces,repositories,unit-of-work},integrations,config}`, `prisma/`, tests).

## 3. Coding standards

- Files of 250 lines or fewer: `npm run check:files` (also in the pre-commit hook and CI).
- Strict TypeScript on both sides (`strict`, `noUncheckedIndexedAccess`); ESLint forbids `any` and non-null
  assertions and requires return types.
- DTO validation with `whitelist` and `forbidNonWhitelisted`; one error shape; no stack traces or internal messages
  returned (tested in `all-exceptions.filter.spec.ts`).
- Centralized constants: error codes, roles, statuses, limits, routes, labels, query keys.
- Theme tokens only (`client/src/styles/tokens.css` via Tailwind colour names); no raw colours in screens.
- Shared JSON logger with structured context; `no-console` lint rule; passwords, tokens and emails are not logged.
- Loading, empty, error, success and disabled states: `QueryState`, `EmptyState`, `Alert`, button `loading`/`disabled`.
- Accessibility: labelled fields with `aria-invalid`/`aria-describedby`, Radix dialogs, radio groups and checkboxes,
  skip link, visible focus ring, `jsx-a11y` lint rules.
- Security: bcrypt (12 rounds), JWT with audience checks and a live active-user check, rate limits (stricter on
  login), Helmet, strict CORS list, server-side role guards, secrets only from the environment.

## 3.7 Tests

| Level | What | Command |
| --- | --- | --- |
| Unit | config, error filter, progress, grading, draws, course and certificate rules; client helpers | `npm test` |
| Integration | API + PostgreSQL: auth, roles, validation, duplicate email, publish rules, full learner journey, concurrent duplicate submit, certificate access and verification, forged quiz token | `npm run test:integration` |
| Component | login validation and errors, route guard, question inputs, query states | `npm test` |
| End-to-end | sign in, enrol, lessons, quiz, result, admin page blocked, verification page | `npm run test:e2e` |
| Static | file size, lint, format, type check, `npm audit` in CI | `npm run verify` |

## 4. Design considerations

- Concurrency: unique keys plus `ON CONFLICT DO NOTHING` for enrolments, attempts and certificates; idempotency key on
  attempts.
- Confirmation for destructive actions: unpublishing a course and deactivating a user ask first.
- Responsive layout with a collapsible menu at phone width (checked on the verification page; a full mobile pass is stage 2); keyboard navigation through Radix primitives.
- Health check at `/api/v1/health` (used by the Docker `HEALTHCHECK`); audit trail in `AuditEvent`.

## Known gaps (stage 2)

Course and quiz editor UI, matching questions and lesson quizzes, reports and Excel exports, email and scheduled
jobs, file uploads to OCI Object Storage, metrics, refresh tokens and password reset, and the compliance, company and
billing features of the original prototype. Production hosting (OCI) and its secrets are not set up yet.
