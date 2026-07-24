---
name: openflow-approve
description: Approve the current OpenFlow human gate and advance to the next step. Use when the user says /openflow-approve or /openflow approve after reviewing step output.
allowed-tools: Bash(openflow:*)
license: MIT
compatibility: Requires openflow CLI and an active ticket (openflow start / flow skill first).
metadata:
  author: openflow
  version: "1.0"
---

Advance past the current human gate.

**Steps**

1. Optionally run `openflow status` to confirm current step.
2. Run:
   ```bash
   openflow approve
   ```
3. Load the new step's detail file from `openflow-rule-details/steps/` and continue work for that step (or stop and wait if the user only wanted approve).

Do not skip gates. Do not re-init.
