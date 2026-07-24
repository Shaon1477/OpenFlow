# Flow Loader

**Purpose**: Load the active workflow definition (steps, gates, repo bindings, skill/rule references), validate it, and expose a resolved execution plan to `step-executor.md` and `openflow/state.json`.

**When to run**: Session start, after `openflow init`, when user switches flow, before executing any step.

---

## Config Sources (Precedence)

1. **`openflow.yml`** (workspace root) — names the flow and repos.
2. **Flow YAML** — resolved by:
   - `openflow.flow` or `workflow.flow_id` in `openflow.yml`, OR
   - CLI flag / user override for this session.
3. **Project override** — `{workspace}/openflow/flows/{name}.yml` if present (wins over built-in).
4. **Built-in** — `OpenFlow/built-in-flows/{name}.yml` (engine package path).

Resolution order: **project override → built-in → error**.

Example `openflow.yml`:

```yaml
openflow:
  flow: v5-workflow
  engine_path: ../OpenFlow    # optional: local clone of engine repo

repositories:
  frontend: "../teq-frontend-v5"
  backend: "../teq-backend-v5"
  context: "../teq-context"   # required — see PLAN §7
  test: "../teq-test"

project:
  issue_tracker: jira
```

---

## Load Procedure

### 1. Read `openflow.yml`

- Validate against `schemas/openflow.config.schema.json` when schema is available.
- Fail **Critical** if `repositories.context` is missing.
- Record absolute paths for each repo in memory for step bindings.

### 2. Resolve flow file path

```
flow_id = openflow.yml → openflow.flow (default: v5-workflow)
candidates = [
  {workspace}/openflow/flows/{flow_id}.yml,
  {engine}/built-in-flows/{flow_id}.yml
]
```

### 3. Parse flow YAML

Expected structure (conceptual; exact keys validated by schema):

```yaml
id: v5-workflow
version: 1
name: "V5 Multi-Repo SDLC"
description: "10-step default"

repos:
  frontend: { binding: repositories.frontend }
  backend: { binding: repositories.backend }
  context: { binding: repositories.context }
  test: { binding: repositories.test }

steps:
  - id: 1
    key: read-ticket
    title: "Read Ticket"
    detail: openflow-rule-details/steps/step-01-read-ticket.md
    human_gate: true
    on_entry:
      - openflow-rule-details/inception/workspace-detection.md
      - openflow-rule-details/common/session-continuity.md
    skills: []
    rules:
      - openflow-rule-details/tracker/tracker-bridge.md
      - openflow-rule-details/tracker/subtask-collection.md
  # ... steps 2–10
```

### 4. Validate against schema

- Run JSON Schema validation: `schemas/flow-definition.schema.json`.
- On validation errors: report line/key, do not execute; suggest fix or fallback flow.

### 5. Resolve step order

- Steps MUST be ordered by `id` or explicit `order` field.
- Build `step_index[]` for navigation (current, next, previous).
- Honor `skip_when` / `optional` flags if defined (e.g. backend-only flow skips frontend steps).

### 6. Resolve gates

For each step, set `human_gate: true | false` from flow YAML.

- Gated steps require `/openflow approve` — see `human-gate.md`.
- Steps 3, 6, 7, 8 also require `openspec-verify-change` before approve (per PLAN §2).

### 7. Resolve repo bindings

- Replace `repositories.*` placeholders with paths from `openflow.yml`.
- Verify directories exist; warn **High** if missing clone.

### 8. Resolve skill and rule refs

Paths are relative to **OpenFlow engine root** unless prefixed with `openflow-rule-details/` (already engine-relative).

- **Rules**: markdown files AI must read before/during step.
- **Skills**: OpenSpec skill names (`openspec-propose`, `openspec-apply-change`, …) — load from `OpenSpec/skills/` per engine README.

Produce resolved manifest for current step:

```json
{
  "flow_id": "v5-workflow",
  "step": 1,
  "detail_file": "openflow-rule-details/steps/step-01-read-ticket.md",
  "on_entry": ["..."],
  "main_rules": ["..."],
  "skills": ["openspec-explore"],
  "human_gate": true,
  "repos": { "frontend": "/abs/path/..." }
}
```

Store `flow_id` and `flow_version` in `openflow/state.json`.

---

## Built-in Flow Catalog

| File | Use when |
|------|----------|
| `v5-workflow.yml` | Full 10-step multi-repo (default) |
| `mobile-flow.yml` | Mobile client + API + context |
| `frontend-flow.yml` | UI-only changes |
| `backend-flow.yml` | API-only changes |

User may add custom flows under `openflow/flows/` without modifying the engine.

---

## Session Integration

On load success, append to `openflow/changes/{ticket}/audit.md`:

```markdown
## Flow loaded
**Timestamp**: ...
**Flow**: v5-workflow (version 1)
**Override**: none | openflow/flows/custom.yml
**Steps**: 10 (active: 1)
```

On load failure, do not mutate `state.json.current_step` except to record `blocked` reason.

---

## CLI Alignment (Future)

`openflow start --flow v5-workflow` and `openflow status` use the same loader (`src/lib/flow-loader.ts`). AI agents follow this document when CLI is not invoked.
