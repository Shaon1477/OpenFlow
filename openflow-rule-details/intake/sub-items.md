# Sub-items per role

A flow declares roles (`openflow next --json` → `step.role`, and the flow's
`roles` list). Each role that produces artifacts needs an id to file them under.

## Resolution order

1. **Already in state** — `openflow next --json` → `step.sub_ticket`. Use it.
2. **Explicitly provided** — the developer ran:
   ```bash
   openflow start PROD-5100 --sub frontend=PROD-5102 --sub backend=PROD-5103
   ```
3. **Inferred from the source's children** — match child items to roles using, in
   order: an explicit label or component (`frontend`, `ui`, `api`, `qa`), the
   repo/component field, then the title. Always show the inferred mapping and ask
   for confirmation before relying on it.
4. **Fall back to the parent id** — a project may track one item for everything.
   Then every role's artifacts live under the parent id. This is normal; confirm it
   rather than blocking.

## Rules

- **Never guess silently.** An inferred mapping is presented at the analyze gate
  and confirmed by a human.
- **A role without an id is not a blocker** — the parent id is a valid answer.
- **Ids are recorded once** in state, then reused by every stage, so artifacts stay
  in predictable places:
  `{repo of role}/{artifacts_dir}/{sub_item id}/`.
- **Renaming later is expensive.** If an id changes mid-flow, move the artifact
  folder, update state with `openflow start … --sub role=NEW`, and run
  `openflow drift`.

## Recording

```bash
openflow start PROD-5100 --sub frontend=PROD-5102 --sub backend=PROD-5103 \
  --sub context=PROD-5101 --sub test=PROD-5104
```

Re-running `start` on an existing work item only merges the sub-item map; it never
resets progress.
