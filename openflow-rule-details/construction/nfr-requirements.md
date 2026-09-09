# Non-functional requirements

**Applies to** `plan` stages for service-side and infrastructure-touching work.

Capture only what this work item actually needs. A number you invented is worse
than an explicit "not constrained" — write the source of every number (work item,
existing SLO, rule pack, or the developer's answer).

---

## Performance

| Question | Record |
|---|---|
| Expected request volume and peak? | |
| Acceptable latency (p50 / p95)? | |
| Payload sizes, page sizes, batch limits? | |
| Anything synchronous that should be asynchronous? | |

## Scalability

- Growth expected over the next year; what breaks first when it arrives.
- Statefulness: can this run in multiple instances as-is?
- Hot spots: shared counters, single-partition keys, global locks.

## Availability and reliability

- What happens if this is down — degraded feature or blocked business?
- Acceptable data loss window, if any.
- Idempotency and retry safety for every write path.

## Security and privacy

- What data is sensitive; what must never be logged.
- Authentication and authorization model for each new surface.
- Secrets: where they come from (never committed, never in artifacts).
- Regulatory or contractual constraints the project rule pack names.

## Observability

- What must be logged, at what level, with which correlation id.
- Metrics that would reveal this feature failing.
- Alerts worth adding, and who receives them.

## Constraints from the existing system

- Frameworks, versions and libraries the project mandates or forbids.
- Existing patterns for caching, queuing, background work, migrations.
- Deployment target and its limits.

---

## Output

A `## Non-functional decisions` section in `design.md` recording each answer with
its source, plus spec scenarios for any requirement that is testable (limits,
error behaviour, permissions). If the security or resiliency extension is enabled,
those rule files are blocking and must be satisfied here rather than deferred.
