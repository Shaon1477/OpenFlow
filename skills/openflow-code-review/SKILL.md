---
name: openflow-code-review
description: During an OpenFlow implement or integrate stage — after the code for this stage is written, before offering the human gate. Review against the approved plan and workflow-rules. Never self-approve. Never start the next stage.
license: MIT
compatibility: OpenFlow. Adapted from obra/superpowers requesting-code-review (MIT).
metadata:
  author: openflow
  version: "2.0"
  source: https://github.com/obra/superpowers
---

# Code review before the gate (OpenFlow)

Review the work product of **this stage only**, against the approved plan
(`proposal.md`, `specs/`, `design.md`, `tasks.md`) and the step's
`workflow_rule`.

If the harness can dispatch a reviewer subagent, do that with a short brief
(what changed, which plan, git range). Otherwise do the same checklist yourself.
Do not dump the whole chat into the reviewer — give the diff and the plan.

## Checklist

- Diff stays inside the manifest's repos and the plan's file list.
- Matches TEQ / workflow-rules (PrimeVue, v4papi, permissions, i18n, list envelope).
- No `any`, no modules importing modules, no Pinia server cache, no contract
  papered over in the other layer.
- Tests/lint from `verification-before-completion` actually ran.

## Severity

| Severity | Action |
|---|---|
| Critical | Fix before offering the gate |
| Important | Fix before offering the gate |
| Minor | Note in the gate summary; do not block |

If the design is wrong, **stop** — do not rewrite the plan to match the code.
Say the plan stage needs a revisit.

## Never

- Skip because "it's small"
- Treat this review as `openflow approve`
- Continue into the next flow stage
- Use Superpowers `executing-plans` / `subagent-driven-development` to run
  the rest of the ticket
