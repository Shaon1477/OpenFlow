# Human gate protocol

**Purpose.** A gate is where a human decides. The agent prepares, verifies and
presents; it never approves.

---

## Core rules

1. **Never auto-advance** a gated stage.
2. **Only `openflow approve` advances** the cursor. Do not edit state by hand.
3. Approval fingerprints the stage's artifacts. That baseline is what later drift
   detection compares against, so approving unfinished work poisons the signal.
4. If the human rejects or asks for changes, stay on the stage and fix it.
5. Blocked work items cannot be approved; clear the blocker first.

---

## What to present at every gate

- **Stage**: key, name, role, sub-item
- **Artifacts**: paths, as written
- **Decisions**: one line each, with the reason
- **Verification**: for stages with `verify: true`, all three dimensions
- **Open questions**: none remaining (asked in chat and recorded in `questions.md`)
- **Risks**: what might be wrong or incomplete
- **Next action**: `openflow approve`, or `openflow block "reason"`

Keep it short enough to read. Detail belongs in the artifacts.

### Extra, by stage kind

| Kind | Also show |
|---|---|
| `analyze` | Sub-item map per role, scope matrix, branch status per repo |
| `plan` | The cross-role contract section verbatim — that is what the other role consumes |
| `implement` | Branch, commit summary, task completion count, extensions applied |
| `integrate` | Contract differences found and how each was resolved, smoke results |
| `test-cases` | Coverage table: acceptance criterion → case ids, plus gaps |
| `test-automation` | Run matrix per environment, bugs found, anything skipped |
| `handoff` | Contract changes and known gaps sections |
| `sync-context` | Which living documents changed, and `openflow check` output |

---

## Verification before approval

When the manifest sets `verify: true`, report all three and do not hide a failure:

| Dimension | Question |
|---|---|
| Completeness | Is every task genuinely done? |
| Correctness | Does behaviour match every spec scenario and acceptance criterion? |
| Coherence | Does it match `design.md` and the cross-role contract? |

A failed dimension keeps the gate closed. Say what failed and what you propose.

---

## Approving and blocking

```bash
openflow approve                      # current stage
openflow approve -m "LGTM"            # with a comment in the audit trail
openflow approve --step backend-plan  # re-baseline one stage (typically stale)

openflow block "waiting on the auth scope from platform"
openflow block --clear
```

---

## Rejection

If the human says "not approved" or requests edits:

1. Record the feedback in the audit trail.
2. Stay on the same stage.
3. Apply the smallest correct fix — edit the artifact in place; revisit an upstream
   stage only if the problem originated there.
4. Re-present the gate.

---

## Non-gated stages

A flow may set `human_gate: false`. Then: state what was produced, continue in a
new turn, and never treat the absence of a gate as permission to skip verification.
