---
name: openflow-revisit
description: Redo or refresh an OpenFlow stage after requirements changed, a review found a problem, or an upstream change made it stale. Use for /openflow-revisit, "the API changed, fix the frontend", "redo the backend doc", or "this stage is wrong".
allowed-tools: Bash(openflow:*)
license: MIT
compatibility: Requires the openflow CLI and an active work item.
metadata:
  author: openflow
  version: "2.0"
---

Change is normal. The point of this skill is that revisiting a stage keeps every
dependent artifact honest instead of leaving docs behind.

## 1. Find out what actually moved

```bash
openflow drift
openflow next --json
```

`stale` lists completed stages invalidated by an upstream change, with the upstream
stage names.

## 2. Decide the scope, and say it out loud

| Situation | Do this |
|---|---|
| Upstream artifact changed | Revisit each stale stage in flow order |
| Plan was wrong | Revisit the plan stage, then re-check its implement stage |
| Requirements changed | Revisit `analyze` first; the new context flows downstream |
| Only code changed by hand | Update the plan artifacts to match, then re-approve |

## 3. Redo the work

1. Load the stage protocol and the project rule packs from `openflow next --json`.
2. Update artifacts **in place** — edit the affected sections rather than appending
   a second version or regenerating the folder.
3. Before destructive work (deleting or regenerating an artifact folder), state
   what will be lost and get explicit confirmation.

## 4. Re-baseline

```bash
openflow approve --step <stage-key> -m "revisited: <reason>"
```

Then re-run `openflow drift`. Repeat until nothing is stale — that is the exit
condition, not "the code works".

## Rules

- Never clear a stale marker without doing the re-check.
- Never edit specs purely to match code that drifted; decide which one is right and
  fix the other.
- Keep the reason in the audit trail with `-m`; the handoff stage reads it.
