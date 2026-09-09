# Stage: integrate

**Goal.** Make two or more roles actually work together against the real
contract, and reconcile anything that moved while they were built separately.

**Produces.** Wiring code in the consuming repo(s), a reconciliation note, and a
smoke-test result.

---

## ON ENTRY

1. `openflow next --json`. Pay attention to `stale`: if an upstream stage changed
   after it was approved, this stage exists precisely to absorb that change.
2. Load, side by side:
   - the provider role's `design.md` + `specs/` (e.g. the service contract)
   - the consumer role's `design.md` + `specs/` (e.g. what the UI assumed)
3. Load the project rule packs for **both** roles involved.
4. Load engine rules from the manifest (typically `../construction/build-and-test.md`
   and any enabled resiliency extension).

---

## MAIN WORK

### 1. Contract diff — always first

Compare what the provider actually shipped against what the consumer assumed:

| Check | Look for |
|---|---|
| Shape | Field names, types, nullability, casing, envelope |
| Semantics | Status codes, error bodies, pagination, ordering, units |
| Auth | Token placement, scopes, expiry behaviour |
| Behaviour | Empty states, partial failures, retries, idempotency |

Write the differences into
`openflow/changes/{ticket}/integration-reconciliation.md`. For each difference,
pick one and record why:

- **Consumer adapts** — update the consuming code and its plan artifacts.
- **Provider corrects** — the provider deviated from the agreed contract; revisit
  the provider's stage rather than papering over it in the consumer.

This is the step that replaces a developer remembering to say "the API changed,
please update the frontend". The manifest already told you it changed.

### 2. Wire it up

Implement against the live contract, not the mock. Follow the consuming role's
rule pack for data fetching, error surfaces and loading states.

### 3. Resiliency

If the resiliency extension is enabled, apply timeouts, retries with backoff,
circuit breaking and explicit fallbacks at the boundary. Otherwise still handle
failure paths visibly — never swallow errors.

### 4. Smoke test

Run the end-to-end happy path plus at least one failure path per integrated
surface. Record commands and results.

---

## OUTPUT

- Integration code committed in the consuming repo(s)
- `integration-reconciliation.md` listing every contract difference and its resolution
- Updated plan artifacts wherever a contract decision changed them
- Smoke-test evidence in the gate summary

---

## GATE

Present: contract differences and resolutions, smoke results, remaining risk.

```bash
openflow approve
```
