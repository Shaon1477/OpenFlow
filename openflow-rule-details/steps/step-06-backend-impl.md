# Step 6 — Implement Backend

## Purpose

Implement the backend sub-ticket on a feature branch by executing Step 5 `tasks.md`, following code-generation plan approval, optional security and resiliency baselines, and OpenSpec verification before advancing to integration.

**Step index:** `6`  
**Repo:** `state.repos.backend`  
**Change:** `{backend_repo}/openspec/changes/{backendSubTicket}/`.

---

## Prerequisites

- Step 5 human gate passed.
- Feature branch for backend repo per Step 1 plan.
- Extensions from Step 1: `security`, `resiliency` (testing extension applies in Step 8).

**Prior steps:** Step 5 artifacts; Step 4 test cases for validation reference.

---

## ON ENTRY — Rules and skills to load

| Order | Resource | Path |
|------:|----------|------|
| 1 | Session continuity | `../common/session-continuity.md` |
| 2 | Error handling | `../common/error-handling.md` |
| 3 | Code generation (Part 1 → approval → Part 2) | `../construction/code-generation.md` |
| 4 | Content validation | `../common/content-validation.md` |
| 5 | Security baseline (if `extensions.security`) | `../extensions/security/baseline/security-baseline.md` |
| 6 | Resiliency baseline (if `extensions.resiliency`) | `../extensions/resiliency/baseline/resiliency-baseline.md` |

**OpenSpec skills:**

| Skill | Path | When |
|-------|------|------|
| `openspec-apply-change` | `../../openspec-skills/openspec-apply-change/SKILL.md` | MAIN WORK |
| `openspec-continue-change` | `../../openspec-skills/openspec-continue-change/SKILL.md` | ON ENTRY if resuming |
| `openspec-verify-change` | `../../openspec-skills/openspec-verify-change/SKILL.md` | HUMAN GATE |

**ON ENTRY actions:**

1. Load Step 5 change; read proposal, specs, design, tasks.
2. Load Step 4 `test-cases.md` for implementation acceptance checks.
3. **Part 1** — Numbered impl plan → `openflow/changes/{parentTicket}/backend-impl-plan.md`; wait for human approval.
4. **Part 2** — After approval, enable MAIN WORK.
5. If security opted in, enforce API encryption, logging, secrets, validation per baseline.
6. If resiliency opted in, apply retries, timeouts, circuit breakers per baseline in new service code.

---

## MAIN WORK

1. **Apply change** — `openspec-apply-change` on backend change directory; complete tasks in order; update checkboxes in `tasks.md`.
2. **Implement** — Migrations, APIs, domain logic, config; commit on feature branch with sub-ticket references.
3. **Test against cases** — Manually or via repo unit tests, map completed work to test case ids from Step 4; note gaps in audit.
4. **Run build/test** — Repo-standard commands; fix failures.
5. **Extension self-check** — Security and/or resiliency checklists if opted in.
6. **State** — `humanGate.step6: pending` until verify + approve.

---

## OUTPUT — Artifacts and paths

| Artifact | Path |
|----------|------|
| Implemented code | `{backend_repo}/` (feature branch) |
| Updated tasks | `{backend_repo}/openspec/changes/{backendSubTicket}/tasks.md` |
| Optional impl plan | `openflow/changes/{parentTicket}/backend-impl-plan.md` |
| Audit | `openflow/changes/{parentTicket}/audit.md` |
| State | `openflow/state.json` |

---

## HUMAN GATE

Advance to Step 7 only when:

### `openspec-verify-change` (mandatory)

| Dimension | Criterion |
|-----------|-----------|
| Completeness | All `tasks.md` items checked |
| Correctness | Behavior matches `specs/*.md` and satisfies Step 4 cases (or documented exceptions) |
| Coherence | Matches `design.md` and NFR/infra decisions |

### Human

1. User approves verify report and local test evidence.
2. `/openflow approve` recorded.

On approval: `humanGate.step6: approved`, `currentStep: 7`.

---

## OpenSpec skills — fire order

| Order | Skill | Phase |
|------:|-------|--------|
| 1 | `openspec-continue-change` | ON ENTRY (conditional) |
| 2 | `openspec-apply-change` | MAIN WORK |
| 3 | `openspec-verify-change` | HUMAN GATE |

---

## Audit log entry template

```markdown
## Step 6 — Implement Backend
**Timestamp**: {ISO-8601-UTC}
**Action**: Backend implementation {completed|in progress}
**Sub-ticket**: {backendSubTicket}
**Branch**: {branchName}
**Plan approved**: {timestamp}
**Extensions**: security={YES|NO}, resiliency={YES|NO}
**OpenSpec**: apply-change; verify-change={pass|fail}
**Test case coverage**: {summary}
**Human gate**: {pending|approved at {timestamp}}
**Decision**: {e.g. migration rolled to env X}
```

---

## Recovery pointers

| Situation | Rule | OpenSpec |
|-----------|------|----------|
| Interrupted | `../common/error-handling.md` | `openspec-continue-change` |
| `/openflow retry-step 6` | `../common/workflow-changes.md` | `openspec-continue-change` |
