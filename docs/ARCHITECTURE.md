# Architecture

Layered, as the guideline requires: a component-driven React client talks to a modular NestJS API over HTTPS/JSON
with a JWT. Business rules live in services and pure domain functions; persistence is reached only through repository
interfaces and a Unit of Work; external providers sit behind integration interfaces.

```
client/src                         server/src
  routes/    route table             modules/<feature>/
  features/  pages + feature UI        *.controller.ts   HTTP only: DTOs in, response DTOs out
  components/ui     design system      *.service.ts      use cases, transactions, authorization rules
  components/layout app shell          domain/*.ts       pure business rules (unit tested)
  api/       Axios client, typed       dto/              request validation and response shapes
             endpoints, query keys     common/           guards, filters, decorators, logger, constants
  constants/ routes, labels, codes     database/
  types/     API contract types          interfaces/     repository + IUnitOfWork contracts
  styles/    theme tokens                repositories/   Prisma implementations (the only Prisma users)
                                         unit-of-work/   PrismaUnitOfWork, PrismaService, health probe
                                       integrations/     password hashing, tokens, PDF certificates
                                       config/           environment loading and checks
```

## A request, end to end

1. A page (for example `features/quizzes/QuizPage.tsx`) calls a React Query hook (`quiz-queries.ts`).
2. The hook calls a typed function in `api/endpoints.ts`, which uses the one Axios client (`api/http-client.ts`).
   The client adds the token, applies the timeout and turns every failure into an `ApiError` with a known code.
3. In the API, global guards run in order: rate limit (`ThrottlerGuard`), authentication (`JwtAuthGuard`, every route
   unless `@Public()`), role check (`RolesGuard`, from `@Roles(...)`). The `ValidationPipe` rejects unknown or
   invalid fields.
4. The controller calls one service method. The service applies the rules (for example "every lesson done before the
   quiz") and uses `IUnitOfWork`. Writes that must succeed together run in `uow.transaction(...)`.
5. Repositories build the Prisma queries. Duplicate-sensitive inserts (quiz attempts, certificates, enrolments) use
   unique keys with `ON CONFLICT DO NOTHING`, so a double click or two tabs cannot create two records.
6. The controller maps the result to a response DTO. Any thrown error becomes `{ error: { code, message } }` in
   `AllExceptionsFilter`; internal details are logged, never returned.
7. On success the hook updates or invalidates the affected query keys so every screen shows the new state.

## Data model

`Course → CourseModule → Lesson`, and one `Quiz` per course with its `Question`s and `QuestionOption`s. Assignment
(`Enrollment`), progress (`LessonProgress`), assessment (`QuizAttempt`) and certification (`Certificate`) are separate
tables with foreign keys and unique constraints. `AuditEvent` records who changed what. Schema changes go through
Prisma migrations in `server/prisma/migrations`.

## Quiz integrity

The draw endpoint picks random questions and returns them **without answers**, plus a short-lived token signed by the
server that lists the drawn question ids and the learner. The submit endpoint accepts only that token, grades on the
server and stores the attempt under the client's idempotency key.

## How to add a feature

1. Server: add a module under `server/src/modules/<name>` (controller, service, DTOs, `domain/` rules with tests). If it
   needs new data, change `schema.prisma`, run `npm run db:migrate:dev -w server`, add repository methods to an
   interface in `database/interfaces` and implement them in `database/repositories`.
2. Client: add `api/endpoints.ts` functions and `api/query-keys.ts` keys, a `features/<name>/<name>-queries.ts` hook
   file, and pages built from `components/ui`. Add the route in `routes/router.tsx` and `constants/routes.ts`.
3. Add tests at each level, then run `npm run verify` and `npm run test:integration`.
