---
name: openflow-approve
description: Pass the current OpenFlow human gate and advance to the next stage. Use for /openflow-approve, "approved", "LGTM continue the flow", or "looks good, next step".
allowed-tools: Bash(openflow:*)
license: MIT
compatibility: Requires the openflow CLI and an active work item.
metadata:
  author: openflow
  version: "2.0"
---

Only the human approves. This skill records that approval.

## Steps

1. Confirm the user is approving the stage that is actually current:
   ```bash
   openflow next
   ```
2. Record it (fingerprints the stage's artifacts for later drift detection):
   ```bash
   openflow approve [-m "<their comment>"]
   ```
   Re-baselining one specific stage (typically a stale one):
   ```bash
   openflow approve --step <stage-key>
   ```
3. Report the new current stage. If the CLI says all stages are complete:
   ```bash
   openflow check
   ```
4. Ask whether to continue with `/openflow-run`. Do not auto-run the next stage.

## Rules

- If the user asks to approve while a stage is unfinished, say what is missing
  instead of approving.
- If approval output still lists stale stages, surface that — the delivery is not
  actually clean.
- Blocked work items refuse approval. Clear the blocker first:
  ```bash
  openflow block --clear
  ```
