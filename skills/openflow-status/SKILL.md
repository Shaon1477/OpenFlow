---
name: openflow-status
description: Show where an OpenFlow delivery stands — stages done, current stage, blockers, and stale work. Use for /openflow-status, "where are we", "what's next", or "did anything go stale".
allowed-tools: Bash(openflow:*)
license: MIT
compatibility: Requires the openflow CLI and an initialized project.
metadata:
  author: openflow
  version: "2.0"
---

Report progress without changing anything.

## Steps

```bash
openflow status            # all work items, or pass an id
openflow drift             # recompute what upstream changes invalidated
openflow next              # the current stage manifest
openflow check             # Definition of Done, when closing out
```

## How to report

1. Lead with the current stage and whether the delivery is clean or stale.
2. List completed stages compactly; do not dump the whole table unless asked.
3. Call out blockers and stale stages explicitly, with the upstream stage that
   caused each.
4. End with the single next action: `/openflow-run`, `/openflow-approve`,
   `/openflow-revisit <stage>`, or `/openflow-archive`.

Do not run `approve`, `adopt` or `archive` from this skill.
