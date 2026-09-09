# Error handling and recovery

**Applies to** every stage.

---

## Severity

| Severity | Meaning | Response |
|---|---|---|
| Critical | Cannot proceed correctly (missing config, unreadable work item, corrupted state) | Stop. Report. Ask. |
| High | Can proceed but the result is likely wrong (missing upstream artifact, contradictory specs) | Stop the current stage; propose the fix |
| Medium | Degraded but workable (tracker unreachable, optional tool missing) | Continue with a stated fallback; log it |
| Low | Cosmetic or recoverable (formatting, retryable transient) | Fix and continue |

Never downgrade a severity to keep moving. Reporting a Critical honestly is cheaper
than a delivery built on a bad assumption.

---

## Common situations

### Config or setup

| Situation | Action |
|---|---|
| No `openflow.md` | Critical. Tell the developer to run `openflow init`. |
| A repo path in config does not exist | Critical for stages using that role; ask for the correct path. |
| Role has no rule pack | Medium. Say so once, proceed with engine defaults, suggest `.openflow/rules/{role}.md`. |
| Flow id not found | Critical. List `openflow flows`. |

### State

| Situation | Action |
|---|---|
| `openflow/state.json` missing but change folders exist | Ask before recreating; `openflow start {ticket}` re-registers the item. |
| State says complete, artifacts missing | High. Report both facts; offer to revisit that stage rather than fabricating artifacts. |
| Artifacts exist, state says pending | Verify them, then `openflow adopt {stage}` — do not regenerate over someone's work. |
| State version mismatch | Critical. The CLI explains it; do not hand-edit the file. |

### Work item

| Situation | Action |
|---|---|
| Item not found or access denied | Critical. Wrong id, wrong project, or missing auth — ask which. |
| No tracker/MCP available | Medium. Degrade to asking the developer for the item; record `provider: manual` behaviour in `context.md`. |
| Rate limited | Retry once after a short wait, then report. |
| Item changed mid-flow | Re-read it, update `context.md`, run `openflow drift`, and revisit affected stages. |

### Mid-stage interruption

1. Read what was actually produced on disk.
2. Report done / partial / not started per task.
3. Continue from the first incomplete item. Do not restart the stage.
4. If a partial artifact is inconsistent, fix that artifact before continuing.

### Tooling failures

Build, lint or test failures are engineering work, not blockers to route around:
read the output, fix the cause, and never disable a check to reach a gate.

---

## Reporting format

```markdown
**Problem**: what failed, in one sentence
**Severity**: Critical | High | Medium | Low
**Impact**: what cannot be trusted or completed
**Cause**: what you actually verified, not what you suspect
**Options**: 1) … 2) … (with the trade-off of each)
**Recommendation**: one option, and why
```

Blocking on someone else? Record it so the flow reflects reality:

```bash
openflow block "waiting on the platform team for the auth scope"
openflow block --clear
```
