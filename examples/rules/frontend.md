# Frontend rules (example rule pack)

Copy to `.openflow/rules/frontend.md` in your project and replace everything with
your own reality. OpenFlow reads this file at every frontend stage; it is the only
thing that makes generated code look like *your* codebase.

Keep it prescriptive, current, and short enough to be read every time.

---

## Stack

- React 19 + TypeScript, Vite, React Router 7
- TanStack Query for server state; Zustand for local UI state
- Tailwind + our `@acme/ui` component library
- **Forbidden**: new CSS-in-JS libraries, class components, `any`, direct `fetch`
  in components

## Layout

```
src/
  features/<feature>/       # one folder per feature, colocated
    components/
    hooks/
    api.ts                  # all network access for this feature
    types.ts
  components/               # shared, presentational only
  lib/                      # framework-free helpers
```

New UI belongs to a feature folder. Nothing shared until it is used twice.

## Patterns

- Data fetching: a query hook per resource in `features/<f>/api.ts`; components
  never call the client directly. Reference: `features/shifts/api.ts`.
- Server state stays in TanStack Query; do not mirror it into Zustand.
- Forms: `react-hook-form` + `zod` resolver. Validation messages come from the
  schema, not from inline strings.
- Every async surface handles three states explicitly: loading, empty, error. Use
  `<AsyncBoundary>`; never render an unhandled error path.
- Components from `@acme/ui` before anything custom. New primitives get raised in
  design review first.

## Styling

- Tailwind utilities with design tokens only — no arbitrary hex or spacing values.
- Dark mode via tokens; never a second stylesheet.
- Responsive: mobile first, our three breakpoints.

## Accessibility

- Keyboard reachable, visible focus, labelled controls.
- Semantic elements before ARIA; no `div` buttons.
- Icon-only controls need an accessible name.

## Testing

- Vitest + React Testing Library, colocated as `*.test.tsx`.
- Query by role or label, never by class or test id unless nothing else works.
- Cover: happy path, empty state, error state, and every permission branch.
- Playwright end-to-end lives in the e2e repo, not here.

## Commands

```bash
pnpm install
pnpm dev
pnpm lint          # must pass
pnpm test
pnpm build         # must pass before any gate
```

## Review bar — what gets rejected

- A component doing its own network call
- Untyped props or `any`
- A new dependency without a note in the design document
- Missing empty or error state
- Copied component instead of extending `@acme/ui`
