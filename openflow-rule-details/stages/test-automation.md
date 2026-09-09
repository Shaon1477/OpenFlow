# Stage: test-automation

**Goal.** Turn approved test cases into automation that runs in the project's own
environments, and report honest results.

**Produces.** Test code in the test role's repo plus a run matrix.

---

## ON ENTRY

1. `openflow next --json` — read `role`, `repos`, `artifacts`.
2. Read the approved test cases and the plan artifacts of every implemented role.
3. Load the project rule pack for the test role: framework, runner, folder layout,
   fixtures, selectors, data seeding, CI entry point. This is binding — do not
   introduce a second testing style.
4. Load engine rules from the manifest, typically
   `../construction/build-and-test.md` and any enabled testing extension.

---

## MAIN WORK

1. **Plan the suite split** — which cases become unit, integration, contract or
   end-to-end tests. Do not push everything to end-to-end because it is easiest.
2. **Implement in the project's style.** Reuse existing helpers and fixtures.
   Selectors and test data follow the rule pack, not personal preference.
3. **Automate every case marked automatable**; leave the rest listed as manual
   with a reason.
4. **Run where the project runs**: local first, then each configured environment.
   Record the command and result per environment.
5. **Fix, do not hide.** A failure is either a product bug (report it, and revisit
   the implementing stage) or a test defect (fix the test). Never delete or skip a
   test to make the matrix green; if a test must be skipped, say so at the gate.
6. **Trace back.** Every automated test names the case id it implements.

---

## OUTPUT

- Test code committed in the test repo
- Run matrix: environment × suite × pass/fail/skipped
- List of product bugs found, with the stage that owns each
- List of intentionally manual cases

---

## GATE

Present the run matrix, bugs found, and anything skipped.

```bash
openflow approve
```
