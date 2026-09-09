# Designing for non-functional requirements

**Applies to** `plan` stages, after `nfr-requirements.md` is answered.

Turn each recorded requirement into a decision written into `design.md`. Prefer the
pattern the codebase already uses; a new mechanism needs a stated reason.

---

## Pattern selection

| Requirement | Typical mechanisms | Record in design |
|---|---|---|
| Latency | Caching, indexing, pagination, projection, precomputation | What is cached, where, invalidated by what |
| Throughput | Batching, queueing, background jobs, connection pooling | Which work moves off the request path |
| Availability | Timeouts, retries with backoff, circuit breakers, fallbacks | Per dependency, with values |
| Consistency | Transactions, idempotency keys, optimistic locking, outbox | Which boundary is transactional |
| Security | Authn/authz checks, input validation, encryption, redaction | Where each check happens |
| Observability | Structured logs, metrics, traces, correlation ids | What is emitted at each boundary |

## Rules

1. **Values, not adjectives.** "Fast" is not a design. `timeout 2s, 2 retries,
   200ms backoff` is.
2. **Every dependency gets a failure policy.** Timeout, retry rule, and what the
   caller sees when it still fails.
3. **No silent degradation.** If a fallback serves stale or partial data, the user
   or the log must be able to tell.
4. **Validate at the boundary you own.** Do not rely on the caller having validated.
5. **Cache decisions include invalidation.** A cache without a written invalidation
   rule is a bug scheduled for later.
6. **Keep it proportional.** Do not add circuit breakers and queues to a change
   that has neither the volume nor the failure surface to need them; record that
   choice too.

## Components

List the logical components this design adds or changes, and for each: its single
responsibility, its inputs and outputs, and the failure modes it must handle. This
list should map one-to-one onto the structure table in `design.md`.

---

## Output

`design.md` → `## Non-functional decisions` with concrete values, plus rows in the
structure table for any new component. Spec scenarios cover the observable parts
(error responses, limits, permission failures).
