---
name: openflow-modify-step
description: Restart or revise an OpenFlow step from that point forward when something broke. Use when the user says /openflow-modify-step or wants to redo frontend/backend/context/test from a step.
allowed-tools: Bash(openflow:*)
license: MIT
compatibility: Requires openflow CLI and an active ticket.
metadata:
  author: openflow
  version: "1.0"
---

Recover mid-flow. Re-run **from the named step forward** (not only that step).

**Input:** Role or step number, and ticket if needed. Examples:
- `/openflow-modify-step frontend -ticket PROD-5102`
- `/openflow-modify-step 6`

**Steps**

1. Load `openflow-rule-details/flow-engine/recovery.md` and `common/workflow-changes.md`.
2. Confirm destructive restart with the user.
3. Reset state to that step; use `openspec-update-change` / `openspec-continue-change` as recovery.md directs.
4. Continue execution from that step; stop at next human gate.
