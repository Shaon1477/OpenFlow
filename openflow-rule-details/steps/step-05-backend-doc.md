# Step 5 — Backend Implementation Doc

## Purpose

Produce a complete OpenSpec change in the **backend repo** for the backend sub-ticket, aligned with the frontend contract (Step 2) and test scenarios (Step 4), including NFR and infrastructure mapping for APIs, data, and platform services.

**Step index:** `5`  
**Sub-ticket key:** `state.subTickets.backend`  
**Change id:** backend sub-ticket id (e.g. `PROD-5103`).

---

## Prerequisites

- Step 4 human gate passed.
- Step 2 frontend change artifacts available.
- Step 4 `test-cases.md` in context repo.
- Backend repo OpenSpec initialized.

**Prior steps:** Step 2 (frontend doc), Step 4 (test cases) — **must load before MAIN WORK**.

---

## ON ENTRY — Rules and skills to load

| Order | Resource | Path |
|------:|----------|------|
| 1 | Session continuity | `../common/session-continuity.md` |
| 2 | Error handling | `../common/error-handling.md` |
| 3 | Content validation | `../common/content-validation.md` |
| 4 | Depth levels | `../common/depth-levels.md` |
| 5 | Functional design | `../construction/functional-design.md` |
| 6 | NFR requirements | `../construction/nfr-requirements.md` |
| 7 | NFR design | `../construction/nfr-design.md` |
| 8 | Infrastructure design | `../construction/infrastructure-design.md` |
| 9 | Overconfidence prevention | `../common/overconfidence-prevention.md` |
| 10 | Question format | `../common/question-format-guide.md` |

**OpenSpec skills (choose one):**

| Skill | Path | Use when |
|-------|------|----------|
| `openspec-propose` | `../../openspec-skills/openspec-propose/SKILL.md` | Default |
| `openspec-ff-change` | `../../openspec-skills/openspec-ff-change/SKILL.md` | Fast all-in-one (per PLAN) |
| `openspec-new-change` | `../../openspec-skills/openspec-new-change/SKILL.md` | Step-by-step artifact approval |

**CONTEXT LOADED (mandatory):**

- `{frontend_repo}/openspec/changes/{frontendSubTicket}/` — especially API/UI contract in specs + design
- `{context_repo}/openspec/changes/{contextSubTicket}/specs/test-cases.md`

**ON ENTRY actions:**

1. Confirm `currentStep` is `5`.
2. Diff frontend API assumptions vs test cases; list mismatches in questions file if any.
3. Set backend doc depth via `depth-levels.md`.
4. Select OpenSpec creation mode; log in audit.

---

## MAIN WORK

1. **Contract alignment** — Document request/response shapes, auth, error codes, and idempotency rules matching Step 2 design; note every test case id the API must satisfy.
2. **NFR pass** — Apply `nfr-requirements.md` and `nfr-design.md`: performance, security, scalability, reliability targets for this ticket.
3. **Infrastructure pass** — Apply `infrastructure-design.md`: DB tables/collections, caches, queues, external services, migrations.
4. **Functional design** — Domain rules, invariants, and data lifecycle not covered in frontend doc.
5. **Clarifications** — Unresolved backend ambiguities → `openflow/changes/{parentTicket}/questions.md`.
6. **Create backend change** — Run selected OpenSpec skill in `{backend_repo}/openspec/changes/{backendSubTicket}/`.
7. **Required artifacts:**
   - `proposal.md`
   - `specs/*.md` (API, domain, persistence as needed)
   - `design.md` (components, sequences, NFR patterns)
   - `tasks.md` (ordered implementation for Step 6)
8. **Traceability** — In specs or design, include matrix: test case id → endpoint/rule.
9. **Validate & persist** — Content validation; update `artifacts.backendChange`; `humanGate.step5: pending`.

---

## OUTPUT — Artifacts and paths

| Artifact | Path |
|----------|------|
| Backend change root | `{backend_repo}/openspec/changes/{backendSubTicket}/` |
| Proposal | `{backend_repo}/openspec/changes/{backendSubTicket}/proposal.md` |
| Specs | `{backend_repo}/openspec/changes/{backendSubTicket}/specs/*.md` |
| Design | `{backend_repo}/openspec/changes/{backendSubTicket}/design.md` |
| Tasks | `{backend_repo}/openspec/changes/{backendSubTicket}/tasks.md` |
| Audit | `openflow/changes/{parentTicket}/audit.md` |
| State | `openflow/state.json` |

---

## HUMAN GATE

Advance to Step 6 only when **all** are true:

1. User reviewed backend proposal, specs, design, and tasks.
2. API contract is consistent with Step 2 frontend design (or deltas explicitly agreed).
3. Every priority test case from Step 4 is addressable by the backend design (or waived with reason).
4. NFR and infra sections are complete for this ticket’s scope.

On approval: `humanGate.step5: approved`, `currentStep: 6`.

---

## OpenSpec skills — fire order

| Skill | When |
|-------|------|
| `openspec-propose` | MAIN WORK (default) |
| `openspec-ff-change` | MAIN WORK (alternative) |
| `openspec-new-change` | MAIN WORK (alternative) |

---

## Audit log entry template

```markdown
## Step 5 — Backend Implementation Doc
**Timestamp**: {ISO-8601-UTC}
**Action**: Created backend OpenSpec change
**Skill used**: openspec-{propose|ff-change|new-change}
**Depth**: {minimal|standard|comprehensive}
**Sub-ticket**: {backendSubTicket}
**Upstream loaded**: frontend change {frontendSubTicket}, test-cases.md
**Artifacts created**: proposal.md, specs/{list}, design.md, tasks.md
**Location**: {backend_repo}/openspec/changes/{backendSubTicket}/
**Human gate**: {pending|approved at {timestamp}}
**Decision**: {e.g. pagination strategy, auth model}
```

---

## Recovery pointers

| Situation | Rule | OpenSpec |
|-----------|------|----------|
| Frontend contract changed | `../common/workflow-changes.md` | Update Step 2 or backend via `openspec-update-change` |
