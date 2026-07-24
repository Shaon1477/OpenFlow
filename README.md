# OpenFlow

Flow-agnostic, multi-repo SDLC orchestration engine.

OpenFlow owns the **workflow**. [aidlc](https://github.com/awslabs/aidlc-workflows) supplies engineering discipline (session resume, code-gen gates, extensions). [OpenSpec](https://github.com/Fission-AI/OpenSpec) supplies spec artifacts (propose → apply → verify → sync → archive). Your AI coding assistant is the execution engine.

```
Ticket → context → frontend doc → frontend impl → test cases
      → backend doc → backend impl → integration → test scripts
      → jira context → functional context → Done
```

## Install

```bash
cd OpenFlow
npm install
npm run build
npm link   # optional: openflow on PATH
```

Requires Node.js 20+.

## Quick start

```bash
# In your orchestration workspace (sibling to frontend/backend/context repos)
openflow init
# edit openflow.yml — set repos.context (required), frontend, backend, test, tracker

openflow start PROD-5100
openflow status
# …AI follows openflow-rules/core.md through each step…
openflow approve    # after each human gate
openflow archive PROD-5100
```

Or in chat with your AI tool:

```
/openflow start PROD-5100
/openflow approve
/openflow status
/openflow archive PROD-5100
```

Point the AI at `openflow-rules/core.md` (Cursor: always-apply rule; Claude: CLAUDE.md include; etc.).

## Project layout

```
OpenFlow/
├── openflow-rules/core.md           ← master rules (always load)
├── openflow-rule-details/
│   ├── common/                      ← from aidlc
│   ├── inception/                   ← from aidlc (adapted)
│   ├── construction/                ← from aidlc
│   ├── extensions/                  ← security / testing / resiliency
│   ├── tracker/                     ← OpenFlow tracker bridge
│   ├── flow-engine/                 ← load / execute / gate / recover
│   └── steps/                       ← step-01 … step-10
├── openspec-skills/README.md        ← skill → step map
├── built-in-flows/                  ← v5, mobile, frontend, backend
├── templates/                       ← context, jira-context, functional-context
├── schemas/                         ← config, flow, state JSON Schema
├── src/                             ← CLI
└── bin/openflow
```

## Config (`openflow.yml`)

```yaml
project:
  name: my-product
  flow: v5-workflow          # or mobile-flow | frontend-flow | backend-flow

tracker:
  provider: jira             # jira | linear | github

repos:
  frontend: ../teq-frontend-v5
  backend: ../teq-backend
  context: ../teq-context    # REQUIRED — every flow has a context repo
  test: ../teq-test-automation

branching:
  pattern: "feature/{ticket-id}-{slug}"

extensions:
  security: false
  testing: false
  resiliency: false
```

## The one constant

Every flow has a **context** repo. Documentation, test cases, and living functional context live there. `openspec-sync-specs` writes back to it at Step 10.

## Human gates

Steps stop for review. Advance only with `/openflow approve` (or `openflow approve`). Impl steps run `openspec-verify-change` (completeness / correctness / coherence) before approval.

## Recovery

| Command | Effect |
|---|---|
| `/openflow modify-step …` | Revise step (confirm) + `openspec-update-change` |
| `/openflow retry-step N` | Resume from checkpoint + `openspec-continue-change` |
| `/openflow block "…"` | Pause with reason |

## Adapters

Tracker-agnostic ticket schema lives in `openflow-rule-details/tracker/`. Example mappings:

- [examples/adapters/jira.md](examples/adapters/jira.md)
- [examples/adapters/linear.md](examples/adapters/linear.md)
- [examples/adapters/github-issues.md](examples/adapters/github-issues.md)

## License

MIT
