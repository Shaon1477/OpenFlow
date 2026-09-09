---
name: openflow-approve
description: Pass the current OpenFlow human gate, advance, and immediately do the next stage. Use for /openflow-approve, "approved", "LGTM", or "looks good, continue".
allowed-tools: Bash(openflow:*)
license: MIT
compatibility: Requires the openflow CLI and an active work item.
metadata:
  author: openflow
  version: "2.0"
---

Only the human approves. After you record it, **do the next stage in this same turn**. Do not wait for `/openflow-run`.

## Steps

1. Confirm the current stage: `openflow next`
2. Record approval:
   ```bash
   openflow approve [-m "<their comment>"]
   ```
   Re-baseline a stale stage: `openflow approve --step <stage-key>`
3. If the CLI says all stages are complete: `openflow check`, then offer `/openflow-archive`. Stop.
4. Otherwise immediately execute the new current stage:
   - `openflow next --json`
   - load protocol + rule packs
   - ask in chat if anything is missing
   - do that one stage
   - stop at the gate and wait for `/openflow-approve` again

## Rules

- If the stage is unfinished, say what is missing instead of approving.
- If approval output still lists stale stages, surface that.
- Blocked tickets refuse approval: `openflow block --clear` first.
- Never self-approve the stage you just started.
