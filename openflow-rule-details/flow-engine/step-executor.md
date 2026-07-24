# Step Executor

**Purpose**: Run exactly one workflow step end-to-end: load rules, perform work, write outputs, audit, and stop at the human gate. Never skip phases or auto-advance gated steps.

**When to run**: Whenever `openflow/state.json` points at step N and the user is not blocked.

**Related**: `flow-loader.md`, `human-gate.md`, `openflow-rule-details/steps/step-NN-*.md`, PLAN §2 delegation map.

---

## Execution Phases (Strict Order)

Every step follows this pipeline:

```
ON ENTRY → MAIN WORK → OUTPUT → audit.md → HUMAN GATE (if gated)
```

Do not start MAIN WORK until ON ENTRY rules are applied. Do not advance `current_step` until human gate passes (or step has `human_gate: false`).

---

## Phase 0 — Bootstrap (Once Per Step Invocation)

1. Load `openflow.yml` and flow via `flow-loader.md`.
2. Read `openflow/state.json`:
   - `ticket.id`, `current_step`, `sub_tickets`, `extensions`, `blocked`, `flow_id`.
3. If `blocked` is non-null: stop; tell user to resolve blocker or `/openflow approve` after fix.
4. Load **step detail file** from flow manifest, e.g. `openflow-rule-details/steps/step-03-frontend-impl.md`.
5. Merge flow YAML `on_entry`, `rules`, `skills` with step detail file lists (union, flow order first).

---

## Phase 1 — ON ENTRY

Read and apply every file in `on_entry` plus step-specific entry rules:

- `inception/workspace-detection.md` — state file, brownfield/greenfield.
- `common/session-continuity.md` — resume messaging.
- `common/welcome-message.md` — first run only.
- `common/depth-levels.md` — doc/impl depth (Steps 2, 5).
- `construction/code-generation.md` — Part 1 plan before code (Steps 3, 6, 7).
- Extension opt-ins already chosen in Step 1 — load `extensions/**` only if opted in.

**Outputs of ON ENTRY** (in memory / short user message):

- Confirmed step number and title.
- List of skills that will run in MAIN WORK.
- Any blocking questions → write to `questions.md`, stop until answered.

---

## Phase 2 — MAIN WORK

1. Execute step detail instructions (PLAN §2 is authoritative for skill choice).
2. Invoke OpenSpec skills by reading their `SKILL.md` under `OpenSpec/skills/`:
   - Exploration: `openspec-explore`
   - Docs: `openspec-propose` | `openspec-new-change` | `openspec-ff-change`
   - Implementation: `openspec-apply-change`
   - Resume: `openspec-continue-change`
   - Pre-gate: `openspec-verify-change`
3. Apply aidlc rules referenced in step detail (requirements, overconfidence, security, etc.).
4. Use **repo bindings** from flow loader — write only inside the correct repo paths.
5. For implementation steps: follow **code-generation.md** Part 1 → human approval of plan → Part 2.

**During MAIN WORK**: append incremental notes to `audit.md` for significant actions (file created, skill invoked, test run).

---

## Phase 3 — OUTPUT

Write artifacts defined in step detail + PLAN §2. Typical locations:

| Artifact | Path |
|----------|------|
| Workflow context | `openflow/changes/{parent_ticket}/context.md` |
| Questions | `openflow/changes/{parent_ticket}/questions.md` |
| OpenSpec change | `{repo}/openspec/changes/{sub_ticket_id}/` |
| Jira context | `{context_repo}/jira-context/{parent}-context.md` |

Before writing any file: run `common/content-validation.md` (Mermaid, escaping).

Set step status in state — see Phase 4 — but do **not** increment `current_step` until gate cleared.

---

## Phase 4 — Update `openflow/state.json`

After OUTPUT, update (merge, do not wipe):

```json
{
  "flow_id": "v5-workflow",
  "ticket": { "id": "PROD-5100", "title": "..." },
  "current_step": 3,
  "step_status": {
    "3": "awaiting_approval"
  },
  "sub_tickets": { "frontend": "PROD-5102", "...": "..." },
  "extensions": { "security": true, "testing": false, "resiliency": true },
  "blocked": null,
  "last_updated": "2026-07-25T02:30:00Z"
}
```

**`step_status` values**:

- `in_progress` — MAIN WORK started
- `awaiting_approval` — OUTPUT done, human gate pending
- `completed` — gate passed; safe to move to next step
- `skipped` — flow declared skip with waiver

When human approves: set step N to `completed`, set `current_step` to N+1 (or next non-skipped), clear `step_status[N]` or mark completed.

---

## Phase 5 — `audit.md`

Path: `openflow/changes/{parent_ticket}/audit.md`

Use PLAN §4 format:

```markdown
## Step 3 — Implement Frontend
**Timestamp**: 2026-07-25T02:30:00Z
**Skill used**: openspec-apply-change
**Artifacts**: ../teq-frontend-v5/openspec/changes/PROD-5102/tasks.md (all tasks checked)
**Verification**: openspec-verify-change — completeness OK, correctness OK, coherence OK
**Human gate**: pending | approved at ...
```

Every step section includes ISO-8601 timestamps.

---

## Phase 6 — HUMAN GATE

If `human_gate: true` for this step → hand off to `human-gate.md`.

- Run `openspec-verify-change` when PLAN requires (Steps 3, 6, 7, 8).
- Present artifact list and verification summary.
- **Stop**. Do not load step N+1 detail file until `/openflow approve`.

If `human_gate: false`: log completion, update state to next step, optionally notify user.

---

## Step Detail File Contract

Each `openflow-rule-details/steps/step-NN-*.md` MUST define:

- Step goal and inputs (prior step artifacts).
- ON ENTRY / MAIN / OUTPUT file lists (may duplicate flow YAML for clarity).
- Expected artifacts and gate criteria.

Executor treats step detail + flow YAML + PLAN §2 as one contract; on conflict, **step detail** wins for artifacts, **flow YAML** for skip/gate flags.

---

## Interruptions

If session ends mid-step:

- Leave `step_status` as `in_progress`.
- Next session: `session-continuity.md` + `recovery.md` + `openspec-continue-change`.

---

## Prohibited Behavior

- Auto-increment `current_step` after OUTPUT without approval on gated steps.
- Execute two steps in one user turn without explicit user request.
- Ignore missing `context` repo binding.
- Skip `audit.md` entries for skill invocations or gate transitions.
