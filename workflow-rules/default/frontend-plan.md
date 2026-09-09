# default / frontend-plan — teq-frontend-v5

Implementation docs for the Vue 3 SPA. Follow `openflow-rule-details/stages/plan.md`.
Full rules: `teq-frontend-v5/AGENTS.md`. Playbooks: `docs/playbooks/`.

If Figma MCP or screens are missing, ask in chat. Canonical list UIs: Customer,
Employee, Vehicle.

## Stack (binding)

Vue 3 + `<script setup lang="ts">` · Vite · PrimeVue 4 (Aura / **FerdiaPreset**) ·
Tailwind 4 · PrimeIcons · Pinia (client only) · TanStack Vue Query · vee-validate +
yup · vue-i18n · Axios via `apiClient` → `/papi/v4/…`. Strict TS; no `any`.

## What to decide in this plan

- Module: `src/modules/<name>/` (manifest, routes, permissions, views, api, queries).
- New module vs extend existing. Shell (`src/core/`) never imports a module; modules
  never import each other — share via `@shared/`.
- Screens: list / form / drawer. Reuse `@shared/components/list/` and `form/`.
- Routes: every `name` is a `ROUTE_ENUMS` member. `meta.permissions` +
  `meta.permissionsEnforced: true`. Nav is a real link (`RouterLink` / PrimeVue
  `:as="RouterLink"`), not `@click` → `router.push`.
- Permissions: backend keys only — `<url_name>@<METHOD>` from the v4papi view
  (e.g. `sales_customer_detail_v4@DELETE`). Never invent `sales.customers.view`.
- API: Swagger `http://127.0.0.1:8000/swagger/v4/` first. snake_case never leaves
  `api/`. Vue Query for server state; Pinia never caches server data.
- Lists: URL `page`, `perPage`, `search`, `sort`, `groupBy`; default **no**
  user-visible sort; envelope `{ items, pagination }`.
- i18n: new keys in `src/shared/locales/{en-US,no-NO,sv-SE,da-DK}.json`,
  `snake_case` segments; English only + empty stubs; no machine translate.
- V3 → V5 menu: `useV3: false` + `VERSION_MODULE_MAP` in the same change.
- Uploads: presigned S3 (`uploadFileDirect`), never `POST /common/upload/`.

## Artifacts

`proposal.md`, `specs/`, `design.md` (module tree, routes, permission keys, API
paths, list/form contracts), `tasks.md` in the frontend repo.
