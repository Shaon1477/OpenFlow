---
name: openflow-archive
description: Close out an OpenFlow work item — run the executable Definition of Done, then archive. Use for /openflow-archive, "close this ticket", "we're done", or "wrap up PROD-1234".
allowed-tools: Bash(openflow:*)
license: MIT
compatibility: Requires the openflow CLI and a work item whose stages are complete.
metadata:
  author: openflow
  version: "2.0"
---

Closeout is a gate, not a formality. A delivery does not end until the living
documentation is actually updated.

## Steps

1. Make sure nothing is stale:
   ```bash
   openflow drift
   ```
   If anything is stale, stop and use `/openflow-revisit` first.
2. Run the Definition of Done:
   ```bash
   openflow check
   ```
   Report each failing check in plain language and what would fix it.
3. Archive only when it passes:
   ```bash
   openflow archive <TICKET>
   ```
4. Tell the user what remains manual: moving the work item to Done in their
   tracker, opening or merging pull requests.

## Rules

- **Do not use `--force`** unless the user explicitly asks after seeing the failing
  checks. It is recorded in the audit trail as a forced close.
- Never archive to "clean up state" while work is unfinished — say what is left.
- If the failing check is the context-documentation one, that is the whole point of
  the gate: run the `sync-context` stage instead of overriding it.
