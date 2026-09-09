---
name: openflow-run
description: Execute the current OpenFlow stage — load the stage protocol plus this project's own rules, do the work, stop at the gate. Use for `/openflow-run` only if the user paused and says "continue". After `/openflow-start-*` or `/openflow-approve`, you already do the stage — do not ask them to type this.
allowed-tools: Bash(openflow:*)
license: MIT
compatibility: Requires the openflow CLI, openflow.md and an active work item (`openflow start`).
metadata:
  author: openflow
  version: "2.0"
---

Execute exactly **one** stage of the active flow, then stop.

## 1. Read the manifest

```bash
openflow next --json
```

It tells you:

| Field | Use |
|---|---|
| `step.kind` | Which stage protocol to follow |
| `step.detail_file` | The protocol file (under `openflow-rule-details/stages/`) |
| `step.workflow_rule` | This team's per-step playbook (`workflow-rules/<flow>/<step>.md`) |
| `step.role`, `step.sub_ticket` | Whose artifacts these are and where they go |
| `step.repos` | The only repos you may write to |
| `engine_rules` | OpenFlow's process/discipline rules to load |
| `rule_packs` | **This project's own engineering rules for the role** |
| `skills` | Extra skills to run **this stage** (debug / verify / review). Load them. Do not treat them as permission to skip the gate. |
| `artifacts` | The exact paths this stage owns |
| `stale` | Completed work invalidated by an upstream change |
| `intake` | How to read the work item (analyze stage only) |

## 2. Load rules before working

Read `workflow_rule` first (stack, UI kit, how this team plans/builds this stage), then the stage protocol, the engine rules, and **every file in `rule_packs`**.

- Project rule packs win on *how to build* (stack, patterns, structure, tests).
- The stage protocol wins on *process* (artifacts, ordering, gates).
- If a role has no rule pack, say so once and proceed with engine defaults; suggest
  `.openflow/rules/<role>.md` so the next run is consistent.

## 3. Handle stale work first

If `stale` is non-empty, an upstream artifact changed after this stage was
approved. Re-check the affected stages, fix what the change breaks, then:

```bash
openflow approve --step <key>   # re-baseline that stage
```

## 4. Do the work

Follow the stage protocol. Write only inside `artifacts` and the listed repos.
Ask blocking questions **in the chat** (short multiple-choice batch, always
include Other). Wait for the reply. Then write the Q&A into
`openflow/changes/<ticket>/questions.md` so later stages can read it. Do not
guess business rules, and do not send the user to edit a file unless they ask.

## 5. Stop at the gate

Present: what was produced (paths), decisions, risks, open questions, and the
verification result when `verify` is true. Then tell the user to run
`/openflow-approve`.

## If the user reports a hand edit

```bash
openflow drift
```

That marks dependent stages stale so the flow re-checks them instead of relying on
someone remembering to mention it.
