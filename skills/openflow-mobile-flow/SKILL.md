---
name: openflow-mobile-flow
description: Start mobile delivery flow. Use for mobile app tickets, or when the user says /mobile-flow.
allowed-tools: Bash(openflow:*)
license: MIT
compatibility: Requires openflow CLI and openflow.yml with repos.mobile (run openflow init once per project).
metadata:
  author: openflow
  version: "1.0"
  flow: mobile-flow
---

Start **mobile-flow** for a mobile ticket.

**Input:** Ticket id. Optional title.

**Steps**

1. Confirm `openflow.yml` has `repos.mobile` and `repos.context`.
2. Start (or resume):
   ```bash
   openflow start <TICKET> --flow mobile-flow --title "<optional title>"
   ```
3. Load `openflow-rules/core.md` and `built-in-flows/mobile-flow.yml`.
4. Execute current step; stop at human gate → `/openflow-approve`.

Do **not** re-run `openflow init`.
