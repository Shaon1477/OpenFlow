# Step 10 — Update Functional Context

## Purpose

Merge this delivery’s delta specifications into the **living functional context** in the context repo, archive completed OpenSpec changes across involved repos, and mark the parent ticket Done in `openflow/state.json` after **human** review.

**Step index:** `10`  
**Terminal step** for the default v5 workflow.

OpenFlow does **not** run a Definition of Done checklist — the human verifies readiness and approves.

---

## Prerequisites

- Step 9 human gate passed.
- `{context_repo}/jira-context/{parentTicket}-context.md` exists.
- All implementation and test work accepted in prior gates.

**Prior artifacts:** Active changes in frontend, backend, context (test cases + any doc changes), and test repos.

---

## ON ENTRY — Rules and skills to load

| Order | Resource | Path |
|------:|----------|------|
| 1 | Session continuity | `../common/session-continuity.md` |
| 2 | Error handling | `../common/error-handling.md` |
| 3 | Content validation | `../common/content-validation.md` |
| 4 | Workflow changes (if user requests reopen) | `../common/workflow-changes.md` |

**OpenSpec skills:**

| Skill | Path | When |
|-------|------|------|
| `openspec-sync-specs` | `../../openspec-skills/openspec-sync-specs/SKILL.md` | MAIN WORK — merge delta specs into living functional context |
| `openspec-update-change` | `../../openspec-skills/openspec-update-change/SKILL.md` | MAIN WORK — revise existing functional context sections for coherence |
| `openspec-archive-change` | `../../openspec-skills/openspec-archive-change/SKILL.md` | ARCHIVE — per repo / per sub-ticket |
| `openspec-bulk-archive-change` | `../../openspec-skills/openspec-bulk-archive-change/SKILL.md` | ARCHIVE — all sub-ticket changes in one operation |

**ON ENTRY actions:**

1. Confirm `currentStep` is `10`.
2. Locate living functional context root (typically `{context_repo}/functional-context/` or `openspec/specs/` per project — follow project OpenSpec layout).
3. Load template sections from `../../templates/functional-context.md` if present.

---

## MAIN WORK

### A. Sync living documentation

1. **`openspec-sync-specs`** — For each completed change (frontend, backend, context test cases, test automation), sync delta specs into the main/living spec in the **context repo** (intelligent merge: add scenarios, do not blindly overwrite entire files).
2. **`openspec-update-change`** — Update structured functional context sections to stay coherent with merged specs:
   - Objective & Business Purpose
   - Scope
   - User Workflows
   - Functional Behavior
   - Data Model & Entities
   - Edge Cases & Exception Handling
   - Compliance & Security
   - Acceptance Criteria
3. Validate all updated markdown with `content-validation.md`.

### B. Archive

4. **`openspec-archive-change`** — Archive each sub-ticket change in its home repo:
   - `{frontend_repo}/openspec/changes/{frontendSubTicket}/`
   - `{backend_repo}/openspec/changes/{backendSubTicket}/`
   - `{context_repo}/openspec/changes/{contextSubTicket}/` (and Step 9 change if separate)
   - `{test_repo}/openspec/changes/{testSubTicket}/`
5. **`openspec-bulk-archive-change`** — When supported, bulk archive via `/openflow archive {parentTicket}`.
6. **OpenFlow state** — After human approval: set `ticketStatus: Done`, `completedAt`; clear `activeTicket` per workspace policy.

---

## OUTPUT — Artifacts and paths

| Artifact | Path |
|----------|------|
| Updated living functional context | `{context_repo}/functional-context/**` or project living spec paths |
| Synced main specs | `{context_repo}/openspec/specs/**` (per project layout) |
| Archived changes | `openspec/changes/archive/` (or tool-default archive location per repo) |
| Final audit | `openflow/changes/{parentTicket}/audit.md` |
| State | `openflow/state.json` — ticket **Done** |

---

## HUMAN GATE

Close the ticket when the **human** confirms:

1. Living functional context sections reviewed and accurate.
2. Archive completed (or CLI `/openflow archive` accepted).
3. Tracker ticket may move to Done (optional MCP update via `../tracker/tracker-bridge.md`) — human decides.

On approval: `humanGate.step10: approved`, `ticketStatus: Done`, workflow complete for `{parentTicket}`.

---

## OpenSpec skills — fire order

| Order | Skill | Phase |
|------:|-------|--------|
| 1 | `openspec-sync-specs` | MAIN WORK — merge deltas into living docs |
| 2 | `openspec-update-change` | MAIN WORK — section updates / coherence |
| 3 | `openspec-archive-change` | ARCHIVE — per repo |
| 4 | `openspec-bulk-archive-change` | ARCHIVE — optional bulk via CLI |

No automated DoD checklist. Human review is the verification.

---

## Audit log entry template

```markdown
## Step 10 — Functional Context & Closeout
**Timestamp**: {ISO-8601-UTC}
**Action**: Synced specs, updated functional context, archived changes
**OpenSpec**: sync-specs, update-change, archive-change, bulk-archive={yes|no}
**Functional context updated**: {paths or section list}
**Human verification**: {approved at {timestamp} | pending}
**Archived changes**: frontend={id}, backend={id}, context={id}, test={id}
**OpenFlow state**: ticket marked Done at {timestamp}
**Decision**: {e.g. deferred doc section to follow-up ticket}
```

---

## Recovery pointers

| Situation | Rule | OpenSpec |
|-----------|------|----------|
| Reopen after Done | `../common/workflow-changes.md` | New change cycle; do not un-archive without confirm |
| Partial archive failure | `../common/error-handling.md` | Retry `openspec-archive-change` per failed repo |

---

## Constant reminder

Every flow includes a **context repo** (required). `openspec-sync-specs` always writes back to it in Step 10 — this is the system of record for functional behavior after delivery.
