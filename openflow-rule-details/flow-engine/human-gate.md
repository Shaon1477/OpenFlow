# Human Gate Protocol

**Purpose**: Ensure a human explicitly approves step outputs before OpenFlow advances. Gated steps are quality checkpoints — the AI prepares, verifies, and presents; the human decides.

**When to run**: End of every step where `human_gate: true` in flow YAML (default for all 10 steps in `v5-workflow`). Additional verification steps apply before approval on implementation steps.

**Related**: `step-executor.md`, `common/workflow-changes.md`, OpenSpec `openspec-verify-change`.

---

## Core Rules

1. **Never auto-advance** past a gated step after producing artifacts.
2. **Wait** for explicit `/openflow approve` (or CLI `openflow approve`) before updating `current_step`.
3. **Record** approval timestamp in `audit.md` and `state.json`.
4. If the user rejects or requests changes, stay on the same step — use `recovery.md` or revise in place.
5. Use `common/question-format-guide.md` for structured questions in `questions.md`; gate conversation may summarize, but decisions on ambiguity belong in files.

---

## Approval Command

```
/openflow approve
```

Optional comment:

```
/openflow approve LGTM — proceed to backend doc
```

On approve:

1. Validate gate checklist for current step (below).
2. Set `step_status[current]` → `completed`.
3. Increment `current_step` to next active step per `flow-loader.md`.
4. Append to `audit.md`: `**Human gate**: approved at {ISO timestamp}`.
5. Briefly state next step and ON ENTRY actions — do not execute Step N+1 MAIN WORK unless user asks to continue in the same session.

---

## Block Command

```
/openflow block "waiting on API schema from platform team"
```

On block:

1. Set `openflow/state.json` → `"blocked": { "reason": "...", "at_step": N, "since": "ISO" }`.
2. Log in `audit.md` under `## Blocker`.
3. Stop all MAIN WORK until user clears blocker (`/openflow approve` after resolution, or explicit "unblock" message documented in audit).

Do not advance `current_step` while blocked.

---

## Pre-Approval Verification (Implementation Steps)

For **Steps 3, 6, 7, 8**, run **`openspec-verify-change`** before showing the gate UI:

| Dimension | Question |
|-----------|----------|
| Completeness | All `tasks.md` checkboxes done? |
| Correctness | Implementation matches `specs/` and acceptance criteria? |
| Coherence | Aligns with `design.md` and cross-repo contracts? |

If verification fails: fix or ask user; gate stays open. Report failures in the gate summary.

Step 7 additionally reference `construction/build-and-test.md` for integration smoke results.

Step 8 gate: all configured environments passing (local → dev → test per project).

---

## What to Show at Each Gate

Present a consistent markdown summary in chat (and optionally `openflow/changes/{ticket}/gate-summary.md`):

### All gated steps (minimum)

- **Step**: N — {title}
- **Parent ticket**: {id} + tracker browse URL
- **Artifacts produced** (paths, clickable relative to workspace)
- **Open questions**: none | link to `questions.md`
- **Blocked**: no | reason
- **Action**: `/openflow approve` or `/openflow block "reason"`

### Step 1 — Read Ticket

- Link to `context.md`
- Sub-ticket table (frontend, backend, context, test) with IDs and titles
- Extension opt-ins (security, testing, resiliency)
- Branch verification per repo
- Confirm: "Sub-tickets and context accurate?"

### Steps 2, 4, 5 — Implementation / test docs

- OpenSpec change path: `proposal.md`, `specs/`, `design.md`, `tasks.md`
- Depth level used (minimal / standard / comprehensive)
- Skill used: propose | new-change | ff-change

### Steps 3, 6, 7 — Implementation

- Feature branch name per repo
- `tasks.md` completion count
- `openspec-verify-change` three-line result
- Security/resiliency extensions applied (yes/no)

### Step 8 — Test scripts

- Test repo change path
- Environments run and pass/fail matrix
- Known flakes or skipped suites

### Step 9 — Jira context doc

- Path to `{context_repo}/jira-context/{parent}-context.md`
- Summary bullets for reviewer

### Step 10 — Functional context / closure

- Sections updated in living functional context
- Archive plan for sub-ticket changes
- Human confirms ready — OpenFlow does not enforce a DoD checklist
- Final: parent ticket ready for Done in tracker (human moves status)

---

## Rejection / Change Requests

If user says "not approved" or requests edits without `/openflow block`:

1. Capture feedback in `audit.md`.
2. Remain on same `current_step`; set `step_status` → `in_progress`.
3. Apply minimal fix:
   - Doc issues → `openspec-update-change`
   - Impl incomplete → continue `openspec-apply-change` / `openspec-continue-change`
4. Re-present gate when ready.

---

## Non-Gated Steps

If a custom flow sets `human_gate: false`:

- Log `**Human gate**: skipped (flow config)` in `audit.md`.
- Still recommend user acknowledgment for production flows.

---

## State Fields (Gate)

```json
{
  "current_step": 2,
  "step_status": { "2": "awaiting_approval" },
  "blocked": null,
  "last_gate": {
    "step": 2,
    "presented_at": "2026-07-25T02:22:00Z",
    "approved_at": null
  }
}
```

Update `last_gate.approved_at` on `/openflow approve`.
