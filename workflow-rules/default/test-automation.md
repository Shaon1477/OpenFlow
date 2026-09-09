# default / test-automation — teq-test

Automate the approved cases. Follow `openflow-rule-details/stages/implement.md`
and `stages/test-automation.md`. Canonical: `teq-test/README.md`,
`teq-test/tests-v5/README.md`.

## v5 (this flow)

Playwright + TypeScript in **`tests-v5/`**, not the v3 Django `tests/` tree.

- Page objects under `tests-v5/page-objects/`
- Specs under `tests-v5/tests/{smoke,e2e}/<module>/`
- Config: `tests-v5/configs/playwright.v5.config.ts`
- Auth: backend session cookie on `.ferdia.app` (see `global-setup.ts`)
- Env: `TEQ_V5_FRONTEND_URL`, `TEQ_V5_BACKEND_URL`

```bash
make test-v5-smoke
make test-v5-e2e
# headed: make test-v5-smoke HEADED=1
```

## Rules

- Page Object Model. Comment the context-docs test-case ID on the spec.
- Tags: `@smoke` / `@e2e`. Smoke stays short (critical path).
- PrimeVue dialogs, not v3 full-page forms.
- `npm run lint` / `type-check` before done.

On failures: `systematic-debugging`. Before the gate: `verification-before-completion`.
Do not add new coverage in the v3 `tests/` folder for v5 SPA work.
