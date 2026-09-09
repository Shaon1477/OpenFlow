---
name: openflow-start
description: Start or resume an OpenFlow delivery for a work item. Use when the user says /openflow-start, "start PROD-1234", "pick up this ticket", or names a work item to deliver end to end. Begins the current stage immediately.
allowed-tools: Bash(openflow:*)
license: MIT
compatibility: Requires the openflow CLI and openflow.md (run `openflow init` once per project).
metadata:
  author: openflow
  version: "2.0"
---

Start the ticket **and do the current stage in this same turn**. Do not wait for `/openflow-run`.

## Steps

1. Confirm setup (`openflow status` / `openflow flows`). Stop if `openflow.md` is missing.
2. Start or resume:
   ```bash
   openflow start <TICKET-OR-SLUG> [--flow <id>]
   ```
   Example: `openflow start prod-5790-trip-accept --flow default`
3. `openflow next --json`
4. Load the protocol + rule packs. Ask in chat if anything is missing.
5. Do this one stage. Stop at the gate. Tell the user to `/openflow-approve`.

Never self-approve. Never skip ahead. Never ask the user to type `/openflow-run` after start.
