# User execution flow

What a developer actually does, start to finish. Longer install and platform setup: [../README.md](../README.md). Design: [HOW-IT-WORKS.md](HOW-IT-WORKS.md).

---

## Once per project

```bash
openflow init
```

Then edit `openflow.yml`:

```yaml
project:
  flow: delivery-flow
intake:
  provider: jira          # or github | linear | mcp | file | manual | none
repos:
  frontend: ../web
  backend: ../api
  context: ../context-docs
  test: ../e2e
rules:
  packs:
    frontend: [.openflow/rules/frontend.md]
    backend:  [../api/AGENTS.md]
```

Check what the engine sees:

```bash
openflow flows
openflow rules
```

Do not re-run `init` to change flow — flow is chosen per work item.

---

## Per work item

```bash
openflow start PROD-5100 --title "Shift assignment" \
  --sub frontend=PROD-5102 --sub backend=PROD-5103 --sub context=PROD-5101 --sub test=PROD-5104
```

Then the loop, once per stage:

```bash
openflow next        # or /openflow-run in your IDE
# agent works this stage only, then stops at the gate
openflow approve     # you approve
```

In Cursor / Claude / Windsurf the same loop is `/openflow-start` → `/openflow-run` →
`/openflow-approve`.

### Where you are, at any time

```bash
openflow status
```

```
── PROD-5100: Shift assignment [active] — flow delivery-flow ──
  ✓ analyze            Analyze work item
  ✓ frontend-plan      Frontend implementation doc
  ▸ frontend-build     Implement frontend   ← current
  □ test-cases         Write test cases
  □ backend-plan       Backend implementation doc
  ...
```

---

## When something changes

### You edited code or a document by hand

```bash
openflow drift
```

Dependent stages are marked stale. `/openflow-revisit` walks them, then:

```bash
openflow approve --step integrate -m "re-checked after contract change"
```

### The backend contract changed after the frontend was planned

Nothing to announce. The next `openflow next` reports the integration stage as
stale, with the upstream stage named, and the integrate protocol starts with a
contract diff.

### Requirements changed

Revisit `analyze`; everything downstream goes stale and gets re-checked in order.

### You are blocked

```bash
openflow block "waiting on the auth scope from platform"
openflow block --clear
```

Blocked work items cannot be approved.

---

## Work that already exists

Docs written by another agent, or specs already in the repo:

```bash
openflow adopt frontend-plan --path ../web/docs/PROD-5102/ --note "written elsewhere"
```

The agent verifies them against the stage protocol first, and they are fingerprinted
so drift detection still applies.

---

## Closing out

```bash
openflow check
openflow archive PROD-5100
```

`check` runs the Definition of Done: every stage approved, living context docs
present, nothing stale, plus any project checks. `archive` refuses to close a work
item that fails. `--force` exists and is recorded in the audit trail.

Moving the work item to Done in your tracker stays your action.

---

## Rules the flow enforces on the agent

1. One stage per turn; no jumping ahead.
2. No code before its plan is approved.
3. It never approves itself.
4. Ambiguity is asked in chat; answers are recorded in `questions.md`.
5. It writes only inside the stage's declared repos and artifact paths.
6. `sync-context` cannot be skipped to finish faster.
