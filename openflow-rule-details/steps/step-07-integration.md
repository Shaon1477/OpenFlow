# Step 7 — Backend ↔ Frontend Integration

## Purpose

Wire the implemented frontend to live backend APIs (or contract-compatible stubs in lower envs), complete integration tasks in the frontend repo, apply resiliency patterns when opted in, run integration smoke tests, and verify before test automation (Step 8).

**Step index:** `7`  
**Primary repo for apply:** `state.repos.frontend` (integration tasks live with UI wiring per PLAN).

---

## Prerequisites

- Step 6 human gate passed; backend feature branch deployable or reachable in target env.
- Step 3 frontend implementation merged or on feature branch ready for integration commits.
- Step 2 and Step 5 design/specs for contract reference.

**CONTEXT LOADED (mandatory):**

- Step 2: `{frontend_repo}/openspec/changes/{frontendSubTicket}/`
- Step 5: `{backend_repo}/openspec/changes/{backendSubTicket}/`
- If `extensions.resiliency`: `../extensions/resiliency/baseline/resiliency-baseline.md`

---

## ON ENTRY — Rules and skills to load

| Order | Resource | Path |
|------:|----------|------|
| 1 | Session continuity | `../common/session-continuity.md` |
| 2 | Error handling | `../common/error-handling.md` |
| 3 | Code generation (plan → approve → execute for integration work) | `../construction/code-generation.md` |
| 4 | Content validation | `../common/content-validation.md` |
| 5 | Resiliency baseline (if opted in) | `../extensions/resiliency/baseline/resiliency-baseline.md` |
| 6 | Build and test (smoke guidance) | `../construction/build-and-test.md` |

**OpenSpec skills:**

| Skill | Path | When |
|-------|------|------|
| `openspec-apply-change` | `../../openspec-skills/openspec-apply-change/SKILL.md` | MAIN WORK — integration tasks (frontend change or dedicated integration tasks in `tasks.md`) |
| `openspec-continue-change` | `../../openspec-skills/openspec-continue-change/SKILL.md` | ON ENTRY if resuming |
| `openspec-verify-change` | `../../openspec-skills/openspec-verify-change/SKILL.md` | HUMAN GATE |

**ON ENTRY actions:**

1. Confirm environment matrix (local API URL, dev, test) in `context.md` or audit.
2. Reconcile API contract: Step 2 vs Step 5 vs actual backend OpenAPI/handlers; escalate mismatches via `questions.md` if blocking.
3. **Code generation Part 1** — Integration plan (env config, feature flags, error handling, resiliency hooks) → approve before Part 2.
4. Load resiliency rules if opted in for client-side retries/timeouts/fallback UX.

---

## MAIN WORK

1. **Integration tasks** — Extend or use existing frontend change `tasks.md` (add integration section if needed via `openspec-update-change` when contract shifted). Run `openspec-apply-change` in **frontend repo**:
   - Point client SDK/fetch layer to backend base URL per environment
   - Auth headers, correlation ids, error mapping
   - Loading/error UI states for real API failures
2. **Resiliency** (if opted in) — Client timeouts, retry policy, circuit-breaker or graceful degradation per baseline.
3. **Smoke tests** — Per `build-and-test.md`, run integration smoke: critical paths from Step 4 test cases that require both tiers.
4. **Commits** — Integration commits on frontend feature branch (and backend if contract fixes required — coordinate with audit).
5. **State** — `humanGate.step7: pending`.

---

## OUTPUT — Artifacts and paths

| Artifact | Path |
|----------|------|
| Integrated frontend code | `{frontend_repo}/` (feature branch) |
| Updated tasks | `{frontend_repo}/openspec/changes/{frontendSubTicket}/tasks.md` (integration items complete) |
| Optional integration plan | `openflow/changes/{parentTicket}/integration-plan.md` |
| Smoke test notes | `openflow/changes/{parentTicket}/audit.md` |
| State | `openflow/state.json` |

---

## HUMAN GATE

Advance to Step 8 only when **all** are true:

### `openspec-verify-change`

Focus on **integration completeness**: end-to-end flows in specs work against live backend in agreed environment.

### `build-and-test.md` integration smoke

Documented pass of agreed smoke subset (reference test case ids).

### Human

1. User confirms UI ↔ API behavior for primary workflows.
2. Known env limitations documented if full test env unavailable.

On approval: `humanGate.step7: approved`, `currentStep: 8`.

---

## OpenSpec skills — fire order

| Order | Skill | Phase |
|------:|-------|--------|
| 1 | `openspec-continue-change` | ON ENTRY (conditional) |
| 2 | `openspec-apply-change` | MAIN WORK |
| 3 | `openspec-verify-change` | HUMAN GATE |

Optional: `openspec-update-change` if integration tasks were added to planning artifacts before apply.

---

## Audit log entry template

```markdown
## Step 7 — Integration
**Timestamp**: {ISO-8601-UTC}
**Action**: Frontend-backend integration {completed|in progress}
**Environment**: {local|dev|test} — base URL {url}
**Resiliency extension**: {active|n/a}
**OpenSpec**: apply-change; verify-change={pass|fail}
**Smoke tests**: {pass|fail} — cases {ids}
**Human gate**: {pending|approved at {timestamp}}
**Decision**: {e.g. stub removed, env var naming}
```

---

## Recovery pointers

| Situation | Rule | OpenSpec |
|-----------|------|----------|
| `/openflow retry-step 7` | `../common/workflow-changes.md` | `openspec-continue-change` |
