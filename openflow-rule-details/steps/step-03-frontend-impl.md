# Step 3 — Implement Frontend

## Purpose

Implement the frontend sub-ticket on a feature branch by executing `tasks.md` from the Step 2 OpenSpec change, following aidlc two-part code generation (plan → approval → execute), optional security baseline rules, and OpenSpec verification before advancing.

**Step index:** `3`  
**Repo:** `state.repos.frontend`  
**Change:** `state.artifacts.frontendChange` or `{frontend_repo}/openspec/changes/{frontendSubTicket}/`.

---

## Prerequisites

- Step 2 human gate passed; `tasks.md` and sibling artifacts exist.
- Feature branch checked out in frontend repo (per Step 1 branch plan).
- If `state.extensions.security === true`, security baseline will load ON ENTRY.

**Prior steps:** Step 2 artifacts (proposal, specs, design, tasks).

---

## ON ENTRY — Rules and skills to load

| Order | Resource | Path |
|------:|----------|------|
| 1 | Session continuity | `../common/session-continuity.md` |
| 2 | Error handling | `../common/error-handling.md` |
| 3 | Code generation (Part 1 → gate → Part 2) | `../construction/code-generation.md` |
| 4 | Content validation | `../common/content-validation.md` |
| 5 | Security baseline (only if opted in Step 1) | `../extensions/security/baseline/security-baseline.md` |

**OpenSpec skills:**

| Skill | Path | When |
|-------|------|------|
| `openspec-apply-change` | `../../openspec-skills/openspec-apply-change/SKILL.md` | MAIN WORK — implement from `tasks.md` |
| `openspec-continue-change` | `../../openspec-skills/openspec-continue-change/SKILL.md` | ON ENTRY if resuming interrupted implementation |
| `openspec-verify-change` | `../../openspec-skills/openspec-verify-change/SKILL.md` | Before human gate / before `/openflow approve` |

**ON ENTRY actions:**

1. Load Step 2 change directory; read `proposal.md`, `specs/`, `design.md`, `tasks.md`.
2. **Code generation Part 1** — Produce numbered implementation plan with checkboxes mapped to `tasks.md` items; write plan to `openflow/changes/{parentTicket}/frontend-impl-plan.md` (or append to audit). **Stop** until human approves the plan (mini-gate inside step).
3. After plan approval, **Part 2** — Proceed to MAIN WORK.
4. If security opted in, enforce blocking rules from `security-baseline.md` on all new/changed code (input validation, secrets, logging, etc.).

---

## MAIN WORK

1. **Apply change** — Run `openspec-apply-change` against `{frontend_repo}/openspec/changes/{frontendSubTicket}/`:
   - Read context files listed by the skill (including `context.md` from OpenFlow if skill references project context).
   - Execute tasks in order; mark `- [ ]` → `- [x]` in `tasks.md` as work completes.
2. **Implement on feature branch** — Commit logically grouped changes; message references sub-ticket id.
3. **Local validation** — Run repo-standard lint/build/unit commands; fix failures before claiming complete.
4. **Security pass** (if opted in) — Self-check against security baseline checklist; log any compensating controls in audit.
5. **Update state** — `humanGate.step3: pending` until verify + user approval.
6. **Audit** — Log commits (sha or summary), tasks completed, and any deviations from design with rationale.

If interrupted: on next session, `openspec-continue-change` from last incomplete task instead of restarting from task 1 unless user requests retry via `../flow-engine/recovery.md` / `workflow-changes.md`.

---

## OUTPUT — Artifacts and paths

| Artifact | Path |
|----------|------|
| Implemented code | `{frontend_repo}/` (feature branch) |
| Updated tasks | `{frontend_repo}/openspec/changes/{frontendSubTicket}/tasks.md` (all items checked) |
| Optional impl plan | `openflow/changes/{parentTicket}/frontend-impl-plan.md` |
| Audit | `openflow/changes/{parentTicket}/audit.md` |
| State | `openflow/state.json` — `currentStep: 3` until gate passed |

---

## HUMAN GATE

Do **not** advance to Step 4 until **all** pass:

### Automated verification (required)

Run `openspec-verify-change` on the frontend change. All three dimensions must pass:

| Dimension | Criterion |
|-----------|-----------|
| **Completeness** | Every `tasks.md` checkbox marked done; no skipped tasks without documented waiver |
| **Correctness** | Implementation matches `specs/*.md` and acceptance criteria in `context.md` |
| **Coherence** | Code and structure align with `design.md`; no undocumented API assumptions |

### Human confirmation

1. User reviewed verify output and any residual risks.
2. Feature branch builds/tests per repo norms.
3. `/openflow approve` logged with timestamp.

On approval: `humanGate.step3: approved`, `currentStep: 4`.

---

## OpenSpec skills — fire order

| Order | Skill | Phase |
|------:|-------|--------|
| 1 | `openspec-continue-change` | ON ENTRY (conditional — resume only) |
| 2 | `openspec-apply-change` | MAIN WORK |
| 3 | `openspec-verify-change` | HUMAN GATE (mandatory before approve) |

---

## Audit log entry template

```markdown
## Step 3 — Implement Frontend
**Timestamp**: {ISO-8601-UTC}
**Action**: Frontend implementation {completed|in progress}
**Sub-ticket**: {frontendSubTicket}
**Branch**: {branchName}
**Plan approved**: {timestamp}
**Security extension**: {active|n/a}
**OpenSpec**: openspec-apply-change; verify-change={pass|fail + notes}
**Artifacts**: {frontend_repo}/openspec/changes/{frontendSubTicket}/tasks.md (all complete)
**Commits**: {short shas or count}
**Human gate**: {pending|approved at {timestamp}}
**Decision**: {e.g. deferred item X to Step 7}
```

---

## Recovery pointers

| Situation | Rule | OpenSpec |
|-----------|------|----------|
| Retry mid-implementation | `../common/workflow-changes.md` | `openspec-continue-change` |
| Spec/design drift found | `../common/workflow-changes.md` | `openspec-update-change` then re-apply |
