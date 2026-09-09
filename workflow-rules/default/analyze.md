# default / analyze — TEQ

Turn the work item into `openflow/changes/{ticket}/context.md`. Follow
`openflow-rule-details/stages/analyze.md`. Ask in chat if anything is missing.

## Sources (in this order)

1. `jira-tasks/` (or the incoming folder in `openflow.md`) — ticket text, AC, Figma links.
2. **teq-context-docs** — business truth:
   - `docs/functional/` — workflows, UI behaviour
   - `docs/functional/v5/` — Figma-driven v5 screens
   - `docs/modules/` — module scope
   - `docs/technical/` — how it is implemented today
3. Existing code: `teq-frontend-v5` (SPA), `teq-platform` (Django / v4papi / teqapi).

Do not invent requirements. If Figma, Jira, or context docs are missing, ask in chat.

## Architecture reminder

The v5 SPA talks **only** to **v4papi** under `teqfrontend` (`/papi/v4/…`).
v4papi forwards to teqapi / teqscheduler / teqcompanysettings. Never expose an
upstream service to the frontend.

## Write in context.md

- Slice, in-scope / out-of-scope
- Repos: frontend-v5, platform (v4), test, context-docs
- Which module (`sales`, `planning`, `hr`, `settings`, …)
- Figma / screens, permission keys if known, list vs form vs both
- Open questions
