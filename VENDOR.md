# Vendored ingredients (OpenFlow owns these)

OpenFlow is a **combo product**. Reference repos (`aidlc---workflow-driven`, `OpenSpec`) may be deleted — everything needed lives here.

| Source | Where it lives in OpenFlow |
|--------|----------------------------|
| aidlc `aws-aidlc-rule-details/**` | `openflow-rule-details/common`, `construction`, `extensions`, `inception`, `operations` |
| aidlc `core-workflow.md` | `openflow-rule-details/aidlc-source/core-workflow.md` (reference) |
| OpenSpec `skills/openspec-*` | `openspec-skills/openspec-*` |
| OpenSpec `schemas/spec-driven` | `openspec-schema/spec-driven/` |
| OpenFlow orchestration | `openflow-rules/`, `built-in-flows/`, `skills/openflow-*`, `openflow-rule-details/steps|tracker|flow-engine` |

## Layout (combo)

```
OpenFlow/
├── skills/openflow-*              ← flow entry skills (/v5-workflow, /backend-flow, …)
├── openspec-skills/openspec-*     ← vendored OpenSpec skills (propose/apply/verify/…)
├── openspec-schema/spec-driven/   ← proposal/specs/design/tasks templates + schema
├── openflow-rule-details/
│   ├── common|construction|…     ← vendored aidlc rules
│   ├── steps/                     ← OpenFlow 10-step orchestration
│   ├── tracker/                   ← MCP tracker bridge
│   └── flow-engine/               ← load / execute / gate / recover
└── openflow-rules/core.md         ← master: wires aidlc + OpenSpec + flows
```

## Runtime note

Vendored OpenSpec skills still call the `openspec` CLI where their SKILL.md says so. Install OpenSpec CLI as a peer (`npm i -g @fission-ai/openspec` or project local) — you do **not** need the OpenSpec git repo checked out next to OpenFlow.
