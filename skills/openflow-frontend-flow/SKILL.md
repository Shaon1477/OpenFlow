---
name: openflow-frontend-flow
description: Start frontend-centric delivery (skips backend impl). Use for UI-only tickets, or when the user says /frontend-flow.
allowed-tools: Bash(openflow:*)
license: MIT
compatibility: Requires openflow CLI and openflow.yml (run openflow init once per project).
metadata:
  author: openflow
  version: "1.0"
  flow: frontend-flow
---

Start **frontend-flow** for a UI-only / frontend-centric ticket.

**Input:** Ticket id (e.g. `PROD-5102`). Optional title.

**Steps**

1. Confirm `openflow.yml` exists; `repos.frontend` and `repos.context` are set.
2. Start (or resume):
   ```bash
   openflow start <TICKET> --flow frontend-flow --title "<optional title>"
   ```
3. Load `openflow-rules/core.md` and `built-in-flows/frontend-flow.yml`.
4. Execute current step; stop at human gate → `/openflow-approve`.

Do **not** re-run `openflow init`.
