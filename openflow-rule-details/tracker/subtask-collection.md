# Subtask Collection (Four Role Tickets)

**Purpose**: Resolve the four OpenFlow role sub-tickets tied to a parent epic/story: **frontend**, **backend**, **context**, **test**. These IDs drive multi-repo OpenSpec changes (`openspec/changes/{id}/`) and branch naming.

**When to run**: Step 1 (Read Ticket), after parent ticket is loaded via `tracker-bridge.md`.

**Human gate**: Do **not** advance past Step 1 until the user confirms all four IDs (or explicit waivers) — see `flow-engine/human-gate.md`.

---

## The Four Roles

| Role key | Typical repo (`openflow.yml`) | OpenFlow step focus |
|----------|-------------------------------|---------------------|
| `frontend` | `repositories.frontend` | Steps 2–3, 7 (integration) |
| `backend` | `repositories.backend` | Steps 5–6 |
| `context` | `repositories.context` (required) | Steps 4, 9, 10 |
| `test` | `repositories.test` | Step 8 |

The **parent ticket** in `state.json` is the epic or coordinating story; each role has its **own** sub-ticket ID.

---

## Resolution Strategy (In Order)

### 1. Read existing state

If `openflow/state.json` already has `sub_tickets` with four keys, show them to the user and ask: **"Still correct for this run? [Yes / Update]"**.

### 2. Auto-fetch from tracker

When `openflow.yml` `project.issue_tracker` is not `none`:

1. Load parent `OpenFlowTicket` (already fetched).
2. Inspect `subtasks` and labels for naming conventions, e.g.:
   - Labels: `frontend`, `backend`, `context`, `docs`, `test`, `qa`
   - Title prefixes: `[FE]`, `[BE]`, `[CTX]`, `[TEST]`
   - Jira issue type + component mapping in config (if present):

```yaml
tracker:
  role_mapping:
    frontend: { label: "frontend" }
    backend: { label: "backend" }
    context: { label: "context" }
    test: { label: "qa" }
```

3. For each role, call **tracker-bridge** with the matched child ID.
4. If multiple candidates: write choices to `openflow/changes/{parent}/questions.md` using `common/question-format-guide.md` — **never** only ask in chat.

### 3. Ask the human

If any role is missing after auto-fetch:

- Present a table of resolved vs missing roles.
- In `questions.md`, ask for IDs or links per missing role.
- Optionally ask: "Should OpenFlow create tracker subtasks?" **only** if `openflow.yml` allows it:

```yaml
tracker:
  auto_create_subtasks: false   # default false — NEVER create without true + explicit user confirm
```

When `auto_create_subtasks: true` and user confirms creation:

- Use tracker MCP "create issue" with parent link, title template from config.
- Log create actions in `audit.md`.
- Re-fetch normalized tickets.

### 4. Confirm before Step 1 completes

Present summary:

```markdown
## Sub-ticket confirmation (required)

| Role | ID | Title | Repo |
|------|-----|-------|------|
| frontend | PROD-5102 | ... | teq-frontend-v5 |
| backend | PROD-5103 | ... | teq-backend-v5 |
| context | PROD-5101 | ... | teq-context |
| test | PROD-5104 | ... | teq-test |

Reply `/openflow approve` when correct, or edit IDs in questions.md / state.
```

Wait for **`/openflow approve`** or corrected answers. Do not start Step 2 until approved.

---

## Partial / Single-Repo Flows

Some built-in flows (e.g. `frontend-flow.yml`) skip backend or test steps. Still collect IDs **or** record explicit waiver in `state.json`:

```json
"sub_tickets": {
  "frontend": "PROD-5102",
  "backend": null,
  "context": "PROD-5101",
  "test": null
},
"sub_ticket_waivers": {
  "backend": "frontend-only flow",
  "test": "manual QA"
}
```

Waivers require human confirmation in the Step 1 gate.

---

## Branch Verification (Same Step 1 OUTPUT)

After IDs confirmed, verify feature branches exist in each bound repo per `openflow.yml` `branching.pattern` (e.g. `feature/{ticket-id}-{slug}`). Log per repo in `audit.md`. Failures are **High** severity — resolve before Step 2.

---

## Audit Log Format

```markdown
## Step 1 — Sub-tickets resolved
**Timestamp**: 2026-07-25T02:01:00Z
**Sub-tickets resolved**: frontend=PROD-5102, backend=PROD-5103, context=PROD-5101, test=PROD-5104
**Resolution**: auto-fetch (labels) + user confirmed
**Human gate**: approved at 02:05:00Z
```

---

## Common Failures

| Problem | Handling |
|---------|----------|
| Epic has no children yet | `questions.md` + wait; do not invent IDs |
| Wrong child mapped to role | User updates mapping; re-fetch ticket |
| Duplicate ID for two roles | Critical — resolve before proceed |
| Tracker `none` | User supplies all four IDs or waivers in `questions.md` |
