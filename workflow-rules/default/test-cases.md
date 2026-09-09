# default / test-cases — teq-context-docs

Human-readable cases in the context repo. Follow
`openflow-rule-details/stages/test-cases.md`.

## Where

`teq-context-docs` test library (when present): `testing/modules/<module>/`.
Also `docs/functional/` and `docs/functional/v5/` for behaviour to cover.

If `testing/` is missing in this checkout, write cases under the context repo
path from `openflow.md` (`functional-context` / `context`) and note the gap.

## How

1. Start from the module/feature (INDEX / module folder).
2. Cover list, form, permissions, empty/error, and v3-parity unless the ticket
   diverges.
3. Give stable IDs so Playwright specs can comment them.
4. Update cases when behaviour changes — do not leave stale AC.

Read frontend + backend plans so cases match the contract, not the old v3 page.
