# default / frontend-build — teq-frontend-v5

Implement the approved frontend plan. Follow `openflow-rule-details/stages/implement.md`.
Canonical: `teq-frontend-v5/AGENTS.md`.

## Do

- `<script setup lang="ts">`. `interface Props` then `defineProps<Props>()`.
- PrimeVue globally (`src/plugins/primevue-components.ts`) — never import
  `primevue/x` in a `.vue` file. No class-styled native `<button>`.
- Theme: FerdiaPreset / `--p-*` + Tailwind. No hardcoded hex. Use `surface-*` /
  `primary-*`, not `stone-*` / `bg-white` (use `bg-surface-0`).
- HTTP only through `apiClient`. `api/` → Vue Query → view. Never call `api/`
  from a view; never `onMounted` fetch.
- Forms: vee-validate + raw yup (`useForm({ validationSchema })`). PrimeVue
  inputs only via `@shared/components/form/*`. One FormView, mode from
  `route.meta.mode`. 400s → `extractApiError` → `setErrors`.
- Lists: `useListState` + `ListToolbar` / `ListFilterBar` / `ListDataTable`.
  Search debounce 350ms. `perPage` not `pageSize`. Omit empty URL/API params.
- Dates: only `@shared/utils/datetime.ts`. Classify instant vs wall-clock vs
  date-only before converting. New APIs are UTC (`…Z`).
- i18n: `t('…')` only. Keys alphabetically; no `_one` / `_other` suffix on keys.
- File upload: `uploadFileDirect` in `api/`, folder = backend `dest_folder`.
- Gate create/delete with `v-if` + `hasAny`; edit with `:disabled`.

## Do not

- `any`, modules importing modules, Pinia as a server cache, Keen bracket params,
  default “all selected” filter chips, sending sort on first list load,
  machine-translating locales, wrapping PrimeVue just to narrow props.
