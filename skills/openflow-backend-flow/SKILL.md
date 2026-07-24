---
name: openflow-backend-flow
description: Start backend-only delivery (skips frontend). Use for API/backend-only tickets, or when the user says /backend-flow.
allowed-tools: Bash(openflow:*)
license: MIT
compatibility: Requires openflow CLI and openflow.yml (run openflow init once per project).
metadata:
  author: openflow
  version: "1.0"
  flow: backend-flow
---

Start **backend-flow** for a ticket that is backend-only (frontend steps are skipped).

**Input:** Ticket id (e.g. `PROD-5103`). Optional title.

**Once per project (already done):** `openflow init` — do NOT re-init to pick a flow.

**Steps**

1. Confirm `openflow.yml` exists; `repos.backend` and `repos.context` are set.
2. Start (or resume):
   ```bash
   openflow start <TICKET> --flow backend-flow --title "<optional title>"
   ```
3. Load `openflow-rules/core.md` and `built-in-flows/backend-flow.yml`.
4. Execute **current step** (skips optional FE steps automatically).
5. Stop at human gate → user runs `/openflow-approve`.

Same project config as always. Only the **skill** chooses backend-flow for this ticket.
