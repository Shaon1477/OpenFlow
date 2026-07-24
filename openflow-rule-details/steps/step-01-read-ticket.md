# Step 1 — Read Ticket

## Purpose

Bootstrap or resume an OpenFlow run for a parent tracker ticket: normalize ticket data from the tracker MCP, resolve the four sub-ticket IDs (frontend, backend, context, test), explore scope and ambiguities, gather requirements at an adaptive depth, and produce a durable `context.md` plus workflow state before any implementation docs are written.

**Step index:** `1`  
**State key:** `openflow/state.json` → `currentStep: 1` until human gate passes, then `2`.

---

## Prerequisites

- `openflow.yml` (or project flow config) exists and lists at least: `context` repo (required), `frontend`, `backend`, `test` repos, tracker adapter, and active flow id (e.g. `v5-workflow`).
- Parent ticket id is known (CLI arg, env, or user input).
- OpenSpec CLI available in repos that will host changes later (not required to complete Step 1, but verify during branch check).

**Prior steps:** None (entry step).

---

## ON ENTRY — Rules and skills to load

Load these files **before** any tracker or analysis work:

| Order | Resource | Path |
|------:|----------|------|
| 1 | Workspace detection | `../inception/workspace-detection.md` |
| 2 | Session continuity (if `openflow/state.json` exists) | `../common/session-continuity.md` |
| 3 | Welcome message (if first run for this workspace) | `../common/welcome-message.md` |
| 4 | Error handling | `../common/error-handling.md` |
| 5 | Content validation (before any file write) | `../common/content-validation.md` |
| 6 | Terminology | `../common/terminology.md` |
| 7 | Security extension opt-in prompt | `../extensions/security/baseline/security-baseline.opt-in.md` |
| 8 | Property-based testing opt-in prompt | `../extensions/testing/property-based/property-based-testing.opt-in.md` |
| 9 | Resiliency extension opt-in prompt | `../extensions/resiliency/baseline/resiliency-baseline.opt-in.md` |

**OpenSpec skill (pre-work, before writing `context.md`):**

| Skill | Path | When |
|-------|------|------|
| `openspec-explore` | `../../openspec-skills/openspec-explore/SKILL.md` (fallback: `../../../OpenSpec/skills/openspec-explore/SKILL.md`) | After ticket normalization, **before** drafting `context.md` — map codebase, ambiguities, and scope; **not** implementation |

**ON ENTRY actions:**

1. Run workspace detection: locate or create `openflow/state.json`; set `flow`, `parentTicket`, `repos`, `extensions` object (`security`, `testing`, `resiliency` booleans from opt-in).
2. If resuming: follow session continuity — list last step, loaded artifacts, and exact next action; do not restart Step 1 unless user confirms via `../common/workflow-changes.md`.
3. If first run: display welcome per `welcome-message.md`.
4. Present extension opt-ins; record choices in state and `audit.md` (extensions apply in Steps 3, 6, 7, 8 per PLAN).

---

## MAIN WORK

1. **Tracker bridge** — Load `../tracker/tracker-bridge.md` and `../tracker/ticket-schema.md`. Call the configured tracker MCP; normalize parent ticket into OpenFlow schema (title, description, acceptance criteria, links, labels, attachments metadata).
2. **Sub-ticket collection** — Load `../tracker/subtask-collection.md`. Resolve four sub-ticket IDs:
   - `subTickets.frontend` (e.g. `PROD-5102`)
   - `subTickets.backend` (e.g. `PROD-5103`)
   - `subTickets.context` (e.g. `PROD-5101`)
   - `subTickets.test` (e.g. `PROD-5104`)  
   Auto-fetch linked subtasks when possible; otherwise write questions to `openflow/changes/{ticket}/questions.md` per `../common/question-format-guide.md` — **never** ask requirement-blocking questions only inline in chat.
3. **Explore (OpenSpec)** — Execute `openspec-explore` against repos implicated by the ticket. Capture: affected packages, existing patterns, API/UI touchpoints, risks, and open questions.
4. **Requirements analysis** — Load `../inception/requirements-analysis.md` and `../common/depth-levels.md`. Select depth: `minimal` | `standard` | `comprehensive`. Produce completeness notes and explicit assumptions list.
5. **Overconfidence prevention** — Load `../common/overconfidence-prevention.md`. For **any** ambiguity in ticket or scope, add questions to `questions.md` with `[Answer]:` placeholders; block `context.md` finalization until answered or explicitly deferred with user acknowledgment in audit.
6. **Workflow planning** — Load `../inception/workflow-planning.md`. Document transformation scope: UI, API, DB, infra, docs-only; cross-repo impact; suggested branch names per repo.
7. **Branch verification** — For each configured repo (including **context**): confirm repo path, default branch, feature branch naming (`{parentTicket}-*` or flow convention), clean working tree or documented exception. Log per-repo status in audit.
8. **Write `context.md`** — Use template `../../templates/context.md` if present; otherwise include at minimum:
   - Parent ticket summary and normalized fields
   - Sub-ticket ID map and repo mapping
   - Selected depth and rationale
   - Scope matrix (UI / API / DB / other)
   - Extension opt-in snapshot
   - Open questions and decisions
   - Links to explore notes and tracker URLs
9. **Initialize audit** — Create `openflow/changes/{ticket}/audit.md` with session start block if new.
10. **Update state** — Persist `currentStep: 1`, `parentTicket`, `subTickets`, `depth`, `extensions`, `repos`, `branches`, `humanGate.step1: pending`.

Validate all markdown/diagrams with `content-validation.md` before write.

---

## OUTPUT — Artifacts and paths

| Artifact | Path |
|----------|------|
| Ticket context (primary) | `openflow/changes/{parentTicket}/context.md` |
| Audit log (created/append) | `openflow/changes/{parentTicket}/audit.md` |
| Optional user questions | `openflow/changes/{parentTicket}/questions.md` |
| Workflow state | `openflow/state.json` |
| Branch verification | Recorded in `audit.md` (and optionally `state.json` → `branches`) |

`{parentTicket}` = normalized parent id (e.g. `PROD-5100`).

---

## HUMAN GATE

Advance to Step 2 only when **all** are true:

1. User has reviewed `openflow/changes/{parentTicket}/context.md` and confirms accuracy (scope, assumptions, depth).
2. All four sub-ticket IDs are confirmed and mapped to the correct repos.
3. Extension opt-ins are explicitly recorded (yes/no for security, testing, resiliency).
4. Branch strategy is confirmed for every repo in the flow (including context).
5. No blocking unanswered items in `questions.md` (or user explicitly accepts risk in audit).

**Command:** `/openflow approve` (or flow-equivalent) after confirmation. Set `humanGate.step1: approved` and `currentStep: 2` in `state.json`; log approval timestamp in `audit.md`.

---

## OpenSpec skills — fire order

| Skill | Phase | Notes |
|-------|--------|------|
| `openspec-explore` | MAIN WORK (early) | Thinking partner only; no `openspec/changes/*` artifacts required in Step 1 |

No other OpenSpec skills fire in Step 1.

---

## Audit log entry template

Append to `openflow/changes/{parentTicket}/audit.md`:

```markdown
## Step 1 — Read Ticket
**Timestamp**: {ISO-8601-UTC}
**Action**: Completed ticket read and context authoring
**Depth selected**: {minimal|standard|comprehensive} (complexity: {low|moderate|high})
**Sub-tickets resolved**: frontend={id}, backend={id}, context={id}, test={id}
**Branches verified**: {repo}={branch/status}, ...
**Extensions opted in**: security={YES|NO}, testing={YES|NO}, resiliency={YES|NO}
**Artifacts**: openflow/changes/{parentTicket}/context.md
**OpenSpec**: openspec-explore (pre-context)
**Human gate**: {pending|approved at {timestamp}}
**Decision**: {one-line summary of key scope decision}
```

On session start (once per run), also ensure:

```markdown
## Session Start
**Timestamp**: {ISO-8601-UTC}
**Flow**: {flowId}
**Ticket**: {parentTicket}
```

---

## Recovery pointers

| Situation | Rule | OpenSpec |
|-----------|------|----------|
| Mid-step interrupt | `../common/error-handling.md` | `openspec-continue-change` if explore was partial in another session |
| Modify requirements after gate | `../common/workflow-changes.md` | Re-run explore + update `context.md` |
