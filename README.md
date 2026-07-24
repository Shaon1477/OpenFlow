# OpenFlow

Flow-agnostic, multi-repo SDLC orchestration engine.

OpenFlow owns the **workflow**. [aidlc](https://github.com/awslabs/aidlc-workflows) supplies engineering discipline. [OpenSpec](https://github.com/Fission-AI/OpenSpec) supplies spec artifacts. Your AI tool (Cursor / Windsurf / Claude) executes via **skills** — same idea as OpenSpec slash skills.

## Install (engine)

```bash
cd OpenFlow
npm install && npm run build && npm link
```

## Once per project

```bash
cd my-workspace
openflow init
# edit openflow.yml — repos + tracker (context repo required)
```

Installs `openflow.yml`, `.cursor/skills/openflow-*`, and `.cursor/rules/openflow.mdc`.

**Do not re-init to change flow.** Init is setup only.

## Day to day (skills)

| Skill | Use when |
|-------|----------|
| `/openflow-v5-workflow PROD-5100` | Full FE+BE+context+test |
| `/openflow-backend-flow PROD-5103` | Backend-only |
| `/openflow-frontend-flow PROD-5102` | Frontend-only |
| `/openflow-mobile-flow APP-44` | Mobile |
| `/openflow-approve` | Advance after you reviewed |
| `/openflow-status` | Progress |
| `/openflow-archive PROD-5100` | Done |
| `/openflow-modify-step …` | Redo from a step forward |

CLI still works under the hood (`openflow start --flow …`, `approve`, `status`, `archive`).

See [implementation docs/USER-EXECUTION-FLOW.md](implementation%20docs/USER-EXECUTION-FLOW.md).

## Project layout

```
OpenFlow/
├── skills/                          ← Cursor/Windsurf slash skills
├── openflow-rules/core.md
├── openflow-rule-details/           ← steps, tracker, flow-engine, aidlc ports
├── built-in-flows/                  ← v5, backend, frontend, mobile
├── openspec-skills/README.md        ← which OpenSpec skill fires at which step
└── src/                             ← thin CLI for state
```
