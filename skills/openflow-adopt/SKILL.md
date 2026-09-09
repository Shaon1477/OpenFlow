---
name: openflow-adopt
description: Register work produced outside OpenFlow (implementation docs from another agent, existing specs, already-written code) as a completed stage. Use for /openflow-adopt, "I already wrote the docs", "we did this part already", or "skip planning, it exists".
allowed-tools: Bash(openflow:*)
license: MIT
compatibility: Requires the openflow CLI and an active work item.
metadata:
  author: openflow
  version: "2.0"
---

Teams arrive mid-process. Adopting existing work is supported so nobody has to
regenerate documents they already have — and so drift detection still covers them.

## 0. Prefer project folders over `--path`

If `openflow.md` already points at the docs (`jira-tasks='…'`), adopt with just the stage.

```bash
openflow adopt analyze --note "analyzed from Jira context"
```

A directory is scanned for filenames containing the ticket id (`PROD-5890`,
`prod-5890-jira-tasks.md`, …). `--path` is only for a one-off location.

## 1. Find where the stage expects artifacts

```bash
openflow next --json
```

Read `step.artifacts`. If the existing documents live elsewhere and `incoming` is
not set, you will pass `--path`.

## 2. Verify before adopting — this is the important part

Check the existing artifacts against the stage protocol
(`openflow-rule-details/stages/<kind>.md`) and the project rule packs:

- Does a plan have requirements with scenarios, a design, and ordered tasks?
- Is the cross-role contract explicit enough for the next stage to consume?
- Do they describe *this* work item, at the current state of the code?

Report the gaps. If something material is missing, offer to complete it in place
rather than adopting a half-plan and pretending the stage is done.

## 3. Adopt

```bash
openflow adopt <stage-key> [--path <file-or-dir>...] --note "<where it came from>"
```

Add `--no-advance` to record the stage without moving the cursor.

## 4. Confirm

```bash
openflow status
```

The stage shows `[adopted]`. Its content is fingerprinted, so if those documents
change later, dependent stages go stale exactly as if OpenFlow had written them.

## Rules

- Never adopt a stage whose artifacts you have not read.
- Never adopt to get past a gate that the work has not actually met; say what is
  missing instead.
- If the existing docs contradict the work item, resolve that first — adopting a
  contradiction poisons every downstream stage.
