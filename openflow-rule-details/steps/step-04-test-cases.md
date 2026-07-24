# Step 4 — Write Test Cases

## Purpose

Author human-readable test scenarios in the **context repo** (required for every flow) as an OpenSpec change, grounded in parent ticket requirements and frontend scope from Step 2. Backend Step 5 and automation Step 8 must satisfy these scenarios.

**Step index:** `4`  
**Sub-ticket key:** `state.subTickets.context` (change id typically matches context sub-ticket, e.g. `PROD-5101`).

---

## Prerequisites

- Step 3 human gate passed (frontend implemented and verified).
- `openflow/changes/{parentTicket}/context.md` and Step 2 frontend specs/design available.
- Context repo path in `state.repos.context` (non-optional per OpenFlow constant).

**Prior steps:** Step 1 `context.md`; Step 2 frontend `specs/*.md` and `design.md`.

---

## ON ENTRY — Rules and skills to load

Step 4 has no separate ON ENTRY block in PLAN beyond implicit session start. Load at step start:

| Order | Resource | Path |
|------:|----------|------|
| 1 | Session continuity | `../common/session-continuity.md` |
| 2 | Error handling | `../common/error-handling.md` |
| 3 | Content validation | `../common/content-validation.md` |
| 4 | Requirements analysis (test scenario depth) | `../inception/requirements-analysis.md` |
| 5 | Overconfidence prevention | `../common/overconfidence-prevention.md` |
| 6 | Question format | `../common/question-format-guide.md` |
| 7 | Depth levels (optional tuning) | `../common/depth-levels.md` |

**OpenSpec skill:**

| Skill | Path | When |
|-------|------|------|
| `openspec-propose` | `../../openspec-skills/openspec-propose/SKILL.md` | MAIN WORK — create test-cases change in context repo |

(`openspec-new-change` / `openspec-ff-change` acceptable if user prefers; default per PLAN is `openspec-propose`.)

**ON ENTRY actions:**

1. Confirm `currentStep` is `4`.
2. Load Step 2 frontend artifacts and Step 1 acceptance criteria.
3. Identify context sub-ticket id for change directory naming.

---

## MAIN WORK

1. **Scenario inventory** — Using `requirements-analysis.md`, list functional paths, negative paths, permissions, and data boundaries implied by ticket + frontend specs.
2. **Edge cases** — Apply `overconfidence-prevention.md`: for unclear error handling, boundaries, or integrations, add items to `openflow/changes/{parentTicket}/questions.md` until resolved or explicitly accepted.
3. **OpenSpec change in context repo** — Run `openspec-propose` to create:
   - `{context_repo}/openspec/changes/{contextSubTicket}/`  
   Focus the change on test documentation (may include minimal `proposal.md` + `tasks.md` if skill requires full change layout; primary deliverable is the spec file below).
4. **Author test cases** — Primary artifact:
   - `{context_repo}/openspec/changes/{contextSubTicket}/specs/test-cases.md`  
   Structure each case with: id, title, preconditions, steps, expected result, priority, traceability to ticket/spec section.
5. **Coverage matrix** — Map cases to frontend capabilities and anticipated backend APIs (for Step 5 consumption).
6. **Validate** — Content-validation on all written files.
7. **State & audit** — `artifacts.testCasesChange`, `humanGate.step4: pending`.

---

## OUTPUT — Artifacts and paths

| Artifact | Path |
|----------|------|
| Test cases (primary) | `{context_repo}/openspec/changes/{contextSubTicket}/specs/test-cases.md` |
| Change root (supporting) | `{context_repo}/openspec/changes/{contextSubTicket}/` |
| Audit | `openflow/changes/{parentTicket}/audit.md` |
| State | `openflow/state.json` → `artifacts.testCasesChange` |

---

## HUMAN GATE

Advance to Step 5 only when **all** are true:

1. User reviewed `test-cases.md` for completeness and correctness.
2. Critical user journeys and failure modes are covered (not only happy path).
3. Cases are traceable to ticket acceptance criteria and Step 2 specs.
4. Explicit note if any case is deferred to Step 8 automation only (documented in audit).

On approval: `humanGate.step4: approved`, `currentStep: 5`.

---

## OpenSpec skills — fire order

| Skill | When |
|-------|------|
| `openspec-propose` | MAIN WORK — create and populate test-cases change |

No `apply-change` or `verify-change` in Step 4 per PLAN (review gate is human on the document).

---

## Audit log entry template

```markdown
## Step 4 — Write Test Cases
**Timestamp**: {ISO-8601-UTC}
**Action**: Authored test cases in context repo
**Skill used**: openspec-propose
**Sub-ticket**: {contextSubTicket}
**Artifacts**: specs/test-cases.md (+ supporting change files if any)
**Location**: {context_repo}/openspec/changes/{contextSubTicket}/
**Case count**: {N} ({smoke|regression|edge} breakdown optional)
**Human gate**: {pending|approved at {timestamp}}
**Decision**: {e.g. agreed error-handling cases for timeout X}
```

---

## Recovery pointers

| Situation | Rule | OpenSpec |
|-----------|------|----------|
| Cases wrong after backend scoping | `../common/workflow-changes.md` | `openspec-update-change` on context change |
