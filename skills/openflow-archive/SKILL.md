---
name: openflow-archive
description: Archive a completed OpenFlow ticket after Step 10. Use when the user says /openflow-archive or delivery is done.
allowed-tools: Bash(openflow:*)
license: MIT
compatibility: Requires openflow CLI.
metadata:
  author: openflow
  version: "1.0"
---

Archive a finished ticket.

**Input:** Parent ticket id (e.g. `PROD-5100`).

**Steps**

1. Confirm human approved Step 10 (or user explicitly wants archive).
2. Run:
   ```bash
   openflow archive <TICKET>
   ```
3. In each involved repo, run OpenSpec archive skills (`openspec-archive-change` / bulk) as described in `steps/step-10-functional-context.md`.
