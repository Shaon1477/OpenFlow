# Backend rules (example rule pack)

Copy to `.openflow/rules/backend.md` (or point `rules.packs.backend` at your
existing `AGENTS.md`) and replace with your own conventions.

---

## Stack

- Node 22 + TypeScript, Fastify, PostgreSQL via Drizzle, Redis for cache
- BullMQ for background work
- **Forbidden**: raw SQL string concatenation, ORM lazy loading, new HTTP clients

## Layout

```
src/
  modules/<domain>/
    routes.ts          # transport only: parse, authorize, delegate
    service.ts         # business rules, no framework imports
    repository.ts      # all database access
    schema.ts          # zod request/response contracts
  platform/            # db, cache, queue, logging setup
```

Business rules live in services. Routes and repositories stay thin.

## API conventions

- REST, plural nouns, kebab-case paths: `/api/v1/work-shifts`
- Request and response bodies validated by zod at the boundary, both directions
- Errors use our envelope: `{ error: { code, message, details? } }`
- Codes: `400` validation, `401` unauthenticated, `403` unauthorized,
  `404` missing, `409` conflict, `422` business rule, `5xx` unexpected only
- Every list endpoint is paginated; default 25, max 100
- Breaking a contract requires a new version, never a silent change

## Data

- One migration per change, forward-only, reviewed
- Every table: `id`, `created_at`, `updated_at`; soft delete via `deleted_at`
- Money in minor units as integers; timestamps in UTC `timestamptz`
- Transactions wrap multi-write operations; no partial writes

## Reliability

- Every outbound call: explicit timeout and a documented retry policy
- Writes that a client may repeat are idempotent (idempotency key or natural key)
- Structured logs with `requestId`; never log tokens, passwords or personal data

## Testing

- Vitest. Unit tests for services (no I/O), integration tests for repositories and
  routes against a real Postgres in Docker.
- Every error branch asserted, not just the happy path.
- Fixtures from `test/factories`; no shared mutable state between tests.

## Commands

```bash
pnpm install
pnpm db:migrate
pnpm dev
pnpm lint          # must pass
pnpm test
pnpm build         # must pass before any gate
```

## Review bar — what gets rejected

- Business logic in a route handler
- Database access outside a repository
- An unversioned breaking contract change
- A new outbound call without timeout and retry policy
- A migration that cannot run on a live database
