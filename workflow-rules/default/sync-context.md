# default / sync-context — teq-context-docs

Update living docs, then archive. Follow `openflow-rule-details/stages/sync-context.md`.

## Where to write

| Kind | Path |
|---|---|
| v5 UI / Figma behaviour | `docs/functional/v5/<module>/` |
| Business workflow | `docs/functional/` |
| Implementation / schema | `docs/technical/` |
| Module overview | `docs/modules/<module>/` |
| Test cases | `testing/modules/` (if that tree exists) |

Do not dump SPA PrimeVue notes into Django-template docs. Keep v5 under `functional/v5/`.

## How

1. Read the approved plans + what actually shipped.
2. Patch the existing doc; add a file only when the feature is new.
3. Cross-link functional ↔ technical ↔ test IDs.
4. Then `openflow archive`.
