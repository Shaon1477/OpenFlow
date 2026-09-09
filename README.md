# OpenFlow

Governed delivery for Cursor / Claude. The agent writes code. You approve each stage.

Requires Node.js 20+.

## Install

Node.js 20+. Anyone installs from GitHub (not npm):

```bash
npm install -g github:Shaon1477/OpenFlow
openflow --help
```

Update: run the same command again. Uninstall: `npm uninstall -g openflow-engine`.

## Use (one ticket)

In **their product workspace** (parent of frontend / backend / docs), once:

```bash
openflow init
```

Edit `openflow.md` paths:

```
workflow='default'
frontend='../web'
backend='../api'
context='../context-docs'
test='../e2e'
jira-tasks='jira-tasks'
```

Optional: put the Jira write-up in `jira-tasks/` with `PROD-5589` in the filename.

Reload the Cursor window so `/openflow-start-default` shows up.

**Each ticket** (in chat — you do not need `/openflow-run`)

```text
/openflow-start-default prod-5589-short-title
```

The agent does **analyze**, then stops. Review. Then:

```text
/openflow-approve
```

That records the gate and does the **next** stage. Repeat until the flow is done, then:

```text
/openflow-archive
```

If it needs a product decision, it asks **in chat** (multiple choice + Other), waits, then continues that same stage.

Resume later: `/openflow-start-default prod-5589`  
Frontend-only change on an existing ticket: `/openflow-cr-frontend-default prod-5589`

**`--force`:** run `openflow init --force` only when you need new slash skills copied (e.g. after upgrading the package). It overwrites `openflow.md` and skills. It does **not** overwrite `.openflow/workflow-rules/` you already edited.

## Commands

| Command | What it does |
|---|---|
| `openflow init` | Create `openflow.md`, copy skills and workflow-rules (`--force`) |
| `openflow flows` | List flows |
| `openflow dirs` | Show repos and folders from `openflow.md` |
| `openflow start <id>` | Start or resume (`prod-5589-title`; `--flow`, `--sub role=id`) |
| `openflow cr <role> <id>` | Change request (`frontend` + ticket + `-m`) |
| `openflow next [id]` | Current stage (`--json` for the agent) |
| `openflow approve [id]` | Pass the gate and advance (`--step`, `-m`) |
| `openflow status [id]` | Progress, blockers, stale |
| `openflow rules` | Resolved craft rules (`--role`, `--json`) |
| `openflow drift [id]` | Detect edits after approval (`--json`) |
| `openflow check [id]` | Definition of Done (`--json`) |
| `openflow adopt <step>` | Mark a stage done from existing docs (`--path`, `--note`) |
| `openflow block ["reason"]` | Block or `--clear` |
| `openflow archive <id>` | Close out (DoD must pass; `--force` records a skip) |

Same loop from the shell:

```bash
openflow start prod-5589-short-title
openflow next
openflow approve -m "ok"
openflow status
openflow check
openflow archive PROD-5589
```

## Chat commands

| You type | What happens |
|---|---|
| `/openflow-start-default …` | Start and do analyze |
| `/openflow-approve` | You accept; agent does the next stage |
| `/openflow-cr-frontend-default …` | Jump to that role’s plan and work it |
| `/openflow-status` | Where the ticket is |
| `/openflow-archive` | Close after DoD passes |
| `/openflow-run` | Continue the **current** stage if you paused |

Build stages also load `systematic-debugging`, `verification-before-completion`, and `openflow-code-review`. Those do not approve for you.

## Default flow

`workflow='default'` in `openflow.md`:

analyze → frontend-plan → frontend-build → test-cases → backend-plan → backend-build → integrate → test-automation → handoff → sync-context

Edit how a stage is done in `.openflow/workflow-rules/default/<step>.md`.  
Own pipeline: add `.openflow/flows/v6.yml`, set `workflow='v6'`, `openflow init --force`.
