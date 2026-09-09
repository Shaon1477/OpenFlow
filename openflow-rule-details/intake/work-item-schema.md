# Work item schema

Every source normalizes into this shape before `context.md` is written. Only `id`
and `title` are required; anything unknown is omitted, never invented.

```yaml
id: PROD-5100                # as the source spells it
title: "Employee shift assignment"
description: |               # markdown; strip provider-specific markup
  ...
type: story                  # story | task | bug | epic | subtask | unknown
status: "In Progress"        # source's own wording
parent: PROD-5000            # optional
children:                    # optional
  - { id: PROD-5102, title: "…", role: frontend }
acceptance_criteria:         # list; extract from description if not a field
  - "Manager can assign a shift to an employee"
labels: [shift, scheduling]
links:                       # design files, docs, related items
  - { kind: design, url: "https://…" }
  - { kind: doc, url: "https://…" }
assignee: "name or handle"
source:
  provider: jira             # jira | linear | github | mcp | file | manual | none
  url: "https://…"           # when the source has one
  fetched_at: "2026-08-14T00:00:00Z"
```

## Normalization rules

1. **Preserve the source's id format.** Do not reformat `#412` into `GH-412`.
2. **Markup to markdown.** Convert rich formats (ADF, HTML) to readable markdown;
   keep code blocks and tables intact.
3. **Acceptance criteria are extracted, not authored.** If the source has no
   criteria field, pull the checklist or bullets from the description. If there are
   none at all, say so and ask — do not write criteria yourself and present them as
   the source's.
4. **Roles on children are inferred, then confirmed.** See `sub-items.md`.
5. **Keep raw payloads out of committed files.** Summarize in `context.md`.
6. **Record provenance.** `source.provider` and `fetched_at` make later staleness
   arguments possible.
