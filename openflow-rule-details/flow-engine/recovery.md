# Recovery Commands and Mid-Flow Resume

**Purpose**: Map user recovery commands to aidlc rules and OpenSpec skills. Always **confirm destructive changes** per `common/workflow-changes.md` before archiving, resetting steps, or regenerating artifacts.

**Paths**: `openflow/state.json`, `openflow/changes/{ticket}/audit.md`, `openflow.yml`, per-repo `openspec/changes/{sub_ticket}/`.

---

## Command Matrix (PLAN §3)

| Situation / Command | aidlc rule | OpenSpec skill | Primary effect |
|---------------------|------------|----------------|----------------|
| `/openflow modify-step {area} -ticket {id}` | `workflow-changes.md` (restart stage) | `openspec-update-change` | Revise planning artifacts; may reset downstream steps |
| `/openflow retry-step {N}` | `workflow-changes.md` (restart current / skipped) | `openspec-continue-change` | Resume implementation from last checkpoint |
| Session interrupted mid-step | `error-handling.md` (partial completion) | `openspec-continue-change` | Resume without re-approving completed work |
| Requirements changed after Step 2+ | `workflow-changes.md` (architectural change) | `openspec-update-change` | Keep proposal/specs/design/tasks coherent |
| Artifact file corrupted / missing | `error-handling.md` (missing artifacts) | `openspec-new-change` | Regenerate change directory artifacts |

Read the linked aidlc/OpenSpec skill files in full before acting.

---

## Universal Recovery Procedure

1. **Load state**: `openflow/state.json`, `audit.md`, current flow from `flow-loader.md`.
2. **Identify** ticket: parent vs sub-ticket (`-ticket` flag).
3. **Classify** severity (`error-handling.md`): corrupted/missing artifacts = Critical; retry = Medium/High.
4. **Explain impact** to user (what will be redone, what is preserved).
5. **Confirm** if destructive (archive, reset step, delete regen).
6. **Execute** skill + state updates.
7. **Log** full decision in `audit.md` with timestamp.

---

## `/openflow modify-step {area} -ticket {id}`

**Example**: `/openflow modify-step frontend -ticket PROD-5102`

**Use when**: User found problems with an implementation doc or planning artifacts — not a simple code typo (use normal edit / apply-change for that).

### Procedure

1. **workflow-changes.md** — "Restarting current/previous stage":
   - Ask what is wrong (doc scope, AC, design).
   - Offer **Option A**: targeted `openspec-update-change` vs **Option B**: full restart (archive + redo step).
2. Map `{area}` to step and repo:

| area | Typical step | Sub-ticket key | Repo |
|------|--------------|----------------|------|
| `frontend` | 2 (doc) or 3 (impl) | frontend | frontend |
| `backend` | 5 or 6 | backend | backend |
| `context` | 4, 9, 10 | context | context |
| `test` | 8 | test | test |

3. If user targets **doc** (Steps 2, 4, 5): run **`openspec-update-change`** on `{repo}/openspec/changes/{id}/`.
4. If user targets **impl** after doc change: confirm whether to reset step 3/6/7 downstream — **destructive** → explicit confirm.
5. **Archive** old artifacts if restarting: copy to `.backup.{timestamp}` or OpenSpec archive per user choice.
6. Update `state.json`: set affected `step_status` to `in_progress`; may lower `current_step` to modified step.
7. Re-run **human gate** when step completes again.

### Audit entry

```markdown
## Recovery — modify-step
**Timestamp**: ...
**Command**: modify-step frontend -ticket PROD-5102
**Decision**: openspec-update-change (partial) | full restart
**User confirmed**: yes
**Steps reset**: 3, 7 → in_progress
```

---

## `/openflow retry-step {N}`

**Example**: `/openflow retry-step 7`

**Use when**: Step failed mid-implementation, tests flaky, or user wants to continue without redoing planning.

### Procedure

1. **workflow-changes.md** — restarting current stage without full doc regen when possible.
2. Confirm step N matches `state.json.current_step` or user intentionally jumps — warn if N < current (may orphan later work).
3. Set `step_status[N]` → `in_progress`; clear `blocked` if retrying after block.
4. Load step N detail + run **`openspec-continue-change`** on the relevant sub-ticket change(s):
   - Step 7 → frontend repo change (integration tasks).
   - Step 3 → frontend; Step 6 → backend; Step 8 → test repo.
5. Do not skip **code-generation.md** Part 1 if no plan exists for remaining work.
6. On completion → `openspec-verify-change` (if impl step) → **human gate**.

---

## Session Interrupted Mid-Step

**No command** — user returns later.

### Procedure

1. `session-continuity.md`: welcome back, show `current_step`, last `audit.md` entry.
2. `error-handling.md` — partial stage completion:
   - List artifacts present vs expected for step.
   - If `tasks.md` partially checked → **`openspec-continue-change`**.
   - If no safe checkpoint → ask retry vs modify-step.
3. Do not require re-approval for substeps already marked `completed` in state unless artifacts were rolled back.

---

## Requirements Changed After Step 2

**Trigger**: User says ticket scope/AC changed after frontend doc approved.

### Procedure

1. **workflow-changes.md** — "changing architectural decision" / restart previous stage impact analysis.
2. Warn: backend doc, impl, tests may all need updates.
3. Run **`openspec-update-change`** starting at earliest affected repo (often context + frontend proposal).
4. Re-gate Step 2 (and 5 if backend doc existed).
5. Reset `step_status` for steps > last replanned doc to `in_progress` or `pending` with confirm.

---

## Corrupted or Missing Artifact

**Symptoms**: Empty `tasks.md`, invalid YAML front matter, merge conflict markers, wrong ticket id in path.

### Procedure

1. **error-handling.md** — missing artifacts recovery:
   - Attempt restore from git: `git checkout -- path` (user confirm).
   - If unrecoverable → backup fragment to `*.corrupt.{timestamp}`.
2. Run **`openspec-new-change`** (or `openspec-ff-change` if user wants speed) to regenerate planning artifacts for that sub-ticket.
3. **Never** silently invent tasks — regenerated content must be re-approved at human gate.
4. Update `audit.md` with cause and regeneration skill used.

---

## Confirm Destructive Changes (Mandatory)

Before any action that **deletes**, **archives**, or **rolls back** `current_step`, require explicit user confirmation quoting impact:

- List steps reset
- List repos affected
- List files to archive
- Time cost estimate (qualitative)

Phrases like "yes, restart step 2" or `/openflow approve` on a recovery plan count as confirmation.

**Do not proceed** on ambiguous "ok" when archive was mentioned.

---

## OpenSpec Skill Quick Reference

| Skill | Read when |
|-------|-----------|
| `openspec-continue-change` | retry-step, session interrupt, resume apply |
| `openspec-update-change` | modify-step, requirements drift |
| `openspec-new-change` | corrupted planning artifacts regenerate |
| `openspec-verify-change` | before re-gating after recovery impl work |

Skills live under `openspec-skills/` (vendored) and `skills/openflow-*` — read `SKILL.md` before invocation.

---

## State After Recovery

Always update:

- `last_updated`
- `step_status` for touched steps
- `blocked` cleared or set with reason
- optional `recovery_log[]` snippet in state for UI/CLI

Example:

```json
"recovery_log": [
  {
    "at": "2026-07-25T03:00:00Z",
    "command": "retry-step 7",
    "skill": "openspec-continue-change"
  }
]
```

---

## When to Escalate to Human Outside OpenFlow

- Tracker parent ticket cancelled → block and document.
- Repo access lost → Critical, cannot continue.
- Conflicting sub-ticket IDs → Step 1 subtask collection again.

Log all escalations in `audit.md`.
