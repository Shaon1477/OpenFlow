# OpenFlow

Combo product: **aidlc engineering rules** + **OpenSpec skills/artifacts** + **OpenFlow multi-repo flow orchestration**.

Reference checkouts of `aidlc---` / `OpenSpec` are optional — ingredients are **vendored** under this repo. See [VENDOR.md](VENDOR.md).

## Install (engine)

```bash
cd OpenFlow
npm install && npm run build && npm link
# Peer: OpenSpec CLI for propose/apply/verify (skills call `openspec`)
```

## Once per project

```bash
openflow init
# edit openflow.yml — repos + tracker
```

Installs into the project:

- `openflow.yml`
- `.cursor/skills/openflow-*` **and** `.cursor/skills/openspec-*`
- `.cursor/rules/openflow.mdc`

## Day to day

| Skill | Use |
|-------|-----|
| `/openflow-v5-workflow PROD-5100` | Full FE+BE+context+test |
| `/openflow-backend-flow PROD-5103` | Backend-only |
| `/openflow-frontend-flow …` / `/openflow-mobile-flow …` | Subset flows |
| `/openflow-approve` / `/openflow-status` / `/openflow-archive` | Gates & closeout |
| `/openspec-propose`, `/openspec-apply-change`, … | Used by steps (also available directly) |

## Layout

```
skills/                 openflow-* flow skills
openspec-skills/        vendored OpenSpec skills
openspec-schema/        spec-driven templates
openflow-rule-details/  aidlc rules + OpenFlow steps/tracker/flow-engine
openflow-rules/core.md  master orchestration
built-in-flows/         v5 | backend | frontend | mobile
```
