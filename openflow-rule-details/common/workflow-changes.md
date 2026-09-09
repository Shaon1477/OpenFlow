# Mid-flow changes

**Applies to** any request to redo, skip, reorder or pause work after a stage has
been approved.

Change is expected. The rule is that changing one thing forces a re-check of what
depended on it, so documentation cannot silently fall behind the code.

---

## Decision tree

```
Something must change
├─ Requirements changed          → revisit `analyze`, then every stale stage
├─ Plan is wrong                 → revisit that role's `plan`, then its `implement`
├─ Code changed by hand          → `openflow drift`, then reconcile plan artifacts
├─ Contract changed by the other role → revisit `integrate` (it exists for this)
├─ Stage not needed this time    → skip it (see below)
└─ Work paused                   → `openflow block "reason"`
```

---

## Revisiting a stage

```bash
openflow drift                                  # what is actually stale
openflow next --json                            # protocol + rule packs
# redo the work, editing artifacts in place
openflow approve --step <key> -m "revisited: <reason>"
openflow drift                                  # repeat until clean
```

Rules:

1. **Edit in place.** Update the affected sections; do not append a second version
   or regenerate a folder wholesale.
2. **Confirm destructive actions.** Before deleting or regenerating artifacts, list
   exactly what will be lost and get an explicit yes.
3. **Downstream follows.** Never clear a stale marker without doing the re-check —
   that is the one action that reintroduces stale documentation.
4. **Record why.** The reason goes in the audit trail via `-m`; the handoff stage
   reads it.

---

## Skipping a stage

Only when it genuinely does not apply (no backend change in a UI-only item).

- Prefer a flow that omits it, or mark it `optional: true` in a project flow.
- State plainly what will not exist as a result, and what depends on it.
- Never skip a `sync-context` stage to finish faster. That is the stage the whole
  process exists to protect.

---

## Changing depth or extensions mid-flow

- Depth (`depth-levels.md`) may increase at any time; decreasing it after artifacts
  exist means deleting detail — confirm first.
- Enabling an extension applies from now on. Say whether already-approved stages
  need re-checking against it; if the extension is security or resiliency, they
  usually do.

---

## Pausing and resuming

```bash
openflow block "waiting on design review"
openflow block --clear
```

Blocked work items refuse approval, so a pause cannot be quietly stepped over. On
resume, follow `session-continuity.md`.
