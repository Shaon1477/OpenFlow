# Step 2 — Frontend Implementation Doc

## Purpose

Produce a complete OpenSpec change in the **frontend repo** for the frontend sub-ticket: `proposal.md`, delta `specs/`, `design.md`, and `tasks.md`. This document set is the contract for Step 3 implementation and informs backend (Step 5) and integration (Step 7).

**Step index:** `2`  
**Sub-ticket key:** `state.subTickets.frontend`  
**Change id:** same as frontend sub-ticket id (e.g. `PROD-5102`).

---

## Prerequisites

- Step 1 human gate passed; `openflow/changes/{parentTicket}/context.md` exists.
- `openflow/state.json` has `repos.frontend` path and `subTickets.frontend`.
- Frontend repo has OpenSpec initialized (`openspec/` scaffolding).

**Prior steps:** Step 1 outputs loaded explicitly in MAIN WORK step 1.

---

## ON ENTRY — Rules and skills to load

| Order | Resource | Path |
|------:|----------|------|
| 1 | Session continuity | `../common/session-continuity.md` |
| 2 | Error handling | `../common/error-handling.md` |
| 3 | Content validation | `../common/content-validation.md` |
| 4 | Depth levels | `../common/depth-levels.md` |
| 5 | Functional design (business questions) | `../construction/functional-design.md` |
| 6 | Overconfidence prevention | `../common/overconfidence-prevention.md` |
| 7 | Question format (if clarifications needed) | `../common/question-format-guide.md` |
| 8 | ASCII diagram standards (if design diagrams) | `../common/ascii-diagram-standards.md` |

**OpenSpec skills (choose one mode before MAIN WORK):**

| Mode | Skill path | Use when |
|------|------------|----------|
| Default / balanced | `../../openspec-skills/openspec-propose/SKILL.md` | User wants proposal→specs→design→tasks in one guided flow |
| Step-by-step | `../../openspec-skills/openspec-new-change/SKILL.md` | User wants approval after each artifact |
| Fast-forward | `../../openspec-skills/openspec-ff-change/SKILL.md` | User wants all artifacts in one shot |

Fallback if `openspec-skills/` not linked: `../../../OpenSpec/skills/{skill-name}/SKILL.md`.

**ON ENTRY actions:**

1. Confirm `currentStep` is `2` (or user explicitly restarted this step per `../common/workflow-changes.md`).
2. Re-read `context.md`; align frontend sub-ticket id and repo path from state.
3. Apply `depth-levels.md` to frontend sub-ticket complexity (may differ from parent ticket depth).
4. Agree with user on OpenSpec mode (propose | new-change | ff-change); log in audit.

`openspec-explore` does **not** re-fire unless user requests re-exploration; Step 1 explore notes are input.

---

## MAIN WORK

1. **Load upstream context** — Read `openflow/changes/{parentTicket}/context.md`; extract UI scope, acceptance criteria, and open decisions affecting frontend.
2. **Functional design pass** — Work through `functional-design.md` questions relevant to UI: user workflows, validation rules, error UX, state management boundaries. Record answers in change `design.md` or linked spec sections.
3. **Clarifications** — If gaps remain, append to `openflow/changes/{parentTicket}/questions.md` (not inline chat) per overconfidence + question-format rules.
4. **Create OpenSpec change** — In `{frontend_repo}`, run the selected skill targeting change directory:
   - `{frontend_repo}/openspec/changes/{frontendSubTicket}/`
5. **Artifacts (required)** — Ensure all exist and are internally consistent:
   - `proposal.md` — intent, scope, non-goals
   - `specs/*.md` — delta requirements (one or more capability files)
   - `design.md` — UI structure, data flow from UI perspective, API consumption assumptions
   - `tasks.md` — ordered, checkbox implementation tasks for Step 3
6. **Cross-check** — Tasks must be traceable to specs; design must not contradict `context.md`. Validate markdown/diagrams before save.
7. **Update state** — Set `artifacts.frontendChange` path, `humanGate.step2: pending`.
8. **Audit** — Log skill used, artifact list, and paths.

---

## OUTPUT — Artifacts and paths

| Artifact | Path |
|----------|------|
| Frontend change root | `{frontend_repo}/openspec/changes/{frontendSubTicket}/` |
| Proposal | `{frontend_repo}/openspec/changes/{frontendSubTicket}/proposal.md` |
| Specs | `{frontend_repo}/openspec/changes/{frontendSubTicket}/specs/*.md` |
| Design | `{frontend_repo}/openspec/changes/{frontendSubTicket}/design.md` |
| Tasks | `{frontend_repo}/openspec/changes/{frontendSubTicket}/tasks.md` |
| Audit append | `openflow/changes/{parentTicket}/audit.md` |
| State | `openflow/state.json` → `artifacts.frontendChange`, `currentStep: 2` until approved |

---

## HUMAN GATE

Advance to Step 3 only when **all** are true:

1. User has reviewed `proposal.md`, relevant `specs/*.md`, `design.md`, and `tasks.md`.
2. API assumptions documented in design are explicit enough for backend Step 5 (even if provisional).
3. Tasks are actionable and ordered; no placeholder “TBD” on blocking items.
4. User approves selected depth and any deferred questions are acknowledged in audit.

On approval: `humanGate.step2: approved`, `currentStep: 3`.

---

## OpenSpec skills — fire order

| Skill | When |
|-------|------|
| `openspec-propose` | MAIN WORK — default single-flow doc creation |
| `openspec-new-change` | MAIN WORK — alternative, per-artifact gates inside skill |
| `openspec-ff-change` | MAIN WORK — alternative, all artifacts at once |

Exactly **one** creation skill per run unless user switches after `workflow-changes` restart.

---

## Audit log entry template

```markdown
## Step 2 — Frontend Implementation Doc
**Timestamp**: {ISO-8601-UTC}
**Action**: Created frontend OpenSpec change
**Skill used**: openspec-{propose|new-change|ff-change}
**Depth**: {minimal|standard|comprehensive}
**Sub-ticket**: {frontendSubTicket}
**Artifacts created**: proposal.md, specs/{list}, design.md, tasks.md
**Location**: {frontend_repo}/openspec/changes/{frontendSubTicket}/
**Human gate**: {pending|approved at {timestamp}}
**Decision**: {e.g. chosen component pattern, routing approach}
```

---

## Recovery pointers

| Situation | Rule | OpenSpec |
|-----------|------|----------|
| Wrong doc after approval | `../common/workflow-changes.md` | `openspec-update-change` on frontend change |
| Regenerate from scratch | `../common/workflow-changes.md` (confirm destructive) | `openspec-new-change` or `openspec-ff-change` |
