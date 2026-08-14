---
name: openflow-start
description: Start or resume an OpenFlow delivery for a work item. Use when the user says /openflow-start, "start PROD-1234", "pick up this ticket", or names a work item to deliver end to end.
allowed-tools: Bash(openflow:*)
license: MIT
compatibility: Requires the openflow CLI and an openflow.yml (run `openflow init` once per project).
metadata:
  author: openflow
  version: "2.0"
---

Begin (or resume) a governed delivery. OpenFlow owns the process; you do the
engineering.

## Steps

1. Confirm setup, and stop with a clear message if it is missing:
   ```bash
   openflow status || openflow flows
   ```
2. Start or resume the work item. Add sub-item ids per role when they are known:
   ```bash
   openflow start <TICKET> --title "<short title>" \
     [--flow <flow-id>] [--sub frontend=<ID> --sub backend=<ID>]
   ```
   Re-running `start` on an existing item resumes it and never resets progress.
3. Read the stage manifest and follow it:
   ```bash
   openflow next
   ```
4. Hand off to `/openflow-run` to execute the current stage.

## Rules

- Never skip ahead. `openflow next` decides what is allowed now.
- The flow comes from `openflow.yml` → `project.flow` unless the user passes
  `--flow`. List options with `openflow flows`.
- If the work item cannot be read (no tracker, no MCP, no file), say so and ask
  the user to paste it — do not invent requirements.
- If the user already has implementation docs written elsewhere, use
  `/openflow-adopt` rather than regenerating them.
