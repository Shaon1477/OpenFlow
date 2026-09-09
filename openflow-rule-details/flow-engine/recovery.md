# Recovery, drift and staleness

**Purpose.** Keep artifacts and code honest when something changes after approval.
This is the mechanism that replaces "someone remembers to update the docs".

---

## How drift works

1. Approving a stage records a **fingerprint** — a content hash of that stage's
   artifacts.
2. `openflow drift` recomputes fingerprints and compares.
3. A stage whose own artifacts changed is **modified**.
4. Every completed stage that `depends_on` a modified stage becomes **stale**, with
   the upstream stage recorded as the cause.
5. Stale stages surface in `openflow next` and `openflow status`, and the `no_drift`
   check fails, so a work item cannot be archived while stale.

```bash
openflow drift          # human readable
openflow drift --json   # for agents
```

Run it after any hand edit, after re-fetching a changed work item, and before
closeout.

---

## The case this exists for

The backend's contract changes after the frontend was planned against it.

```
backend-plan artifacts edited
        ↓ (depends_on chain)
backend-build → stale
integrate     → stale
test-automation → stale
handoff, sync-context → stale
```

The next `openflow next` reports it. The agent re-checks the integration seam
because the flow said so — the developer never has to announce "I changed the API,
now update the frontend".

---

## Resolving stale work

For each stale stage, in flow order:

1. Read what changed upstream: the modified artifacts, and their diff if available.
2. Decide the direction and say it out loud:
   - **Adapt downstream** — the upstream change is correct; update this stage.
   - **Correct upstream** — the change was a mistake; revisit that stage instead.
3. Update artifacts and code in place.
4. Re-baseline:
   ```bash
   openflow approve --step <key> -m "revisited: <reason>"
   ```
5. Re-run `openflow drift`. Exit condition is a clean report, not "it compiles".

Never clear staleness without doing the re-check.

---

## Other recovery situations

| Situation | Action |
|---|---|
| Session interrupted mid-stage | Read what exists, report done/partial, continue from the first incomplete item |
| Artifact deleted or corrupted | Regenerate that stage's artifact after confirming the loss, then re-approve |
| State says complete, artifacts missing | Report both; revisit the stage rather than fabricating artifacts |
| Artifacts exist, state says pending | Verify, then `openflow adopt <stage>` |
| Work item changed | Update `context.md`, run `openflow drift`, revisit stale stages |
| Wrong sub-item id | Move the artifact folder, `openflow start … --sub role=NEW`, then `openflow drift` |
| Blocked externally | `openflow block "reason"`, then `openflow block --clear` |

---

## Rules

1. **Confirm destructive actions.** List what will be lost before deleting or
   regenerating anything.
2. **Never hand-edit `openflow/state.json`.** Use the CLI; it keeps fingerprints and
   the audit trail coherent.
3. **Never bypass the Definition of Done** to finish. If `openflow check` fails on
   context documentation, run the `sync-context` stage — that is the failure the
   check was written to catch.
