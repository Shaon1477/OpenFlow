---
name: openflow-v5-workflow
description: Start the full V5 multi-repo delivery (frontend + backend + context + test). Use when the user has a parent ticket with FE/BE/context/test subtasks, or says /v5-workflow.
allowed-tools: Bash(openflow:*)
license: MIT
compatibility: Requires openflow CLI and openflow.yml (run openflow init once per project).
metadata:
  author: openflow
  version: "1.0"
  flow: v5-workflow
---

Start **v5-workflow** for a parent ticket (full 10-step FE+BE+context+test delivery).

**Input:** Parent ticket id (e.g. `PROD-5100`). Optional title.

**Once per project (already done):** `openflow init` — do NOT re-init to pick a flow.

**Steps**

1. Confirm `openflow.yml` exists and `repos.context` is set.
2. Start (or resume) the ticket on this flow:
   ```bash
   openflow start <TICKET> --flow v5-workflow --title "<optional title>"
   ```
3. Load `openflow-rules/core.md` and `built-in-flows/v5-workflow.yml`.
4. Execute **current step** via `openflow-rule-details/steps/step-NN-*.md`.
5. Stop at human gate. Tell user to run `/openflow-approve` (or `openflow approve`) when ready.
6. For day-to-day progress: `/openflow-status`.

**Do not** re-run `openflow init`. Flow choice is this skill, not init.
