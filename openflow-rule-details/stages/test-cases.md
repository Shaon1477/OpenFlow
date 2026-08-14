# Stage: test-cases

**Goal.** Write the human-readable test cases that define "working" for this work
item, before the code that must satisfy them is finished.

**Produces.** Test case documents in the context repo under
`{artifacts_dir}/{sub_ticket}/`.

---

## ON ENTRY

1. `openflow next --json` — read `role` (usually the context role), `repos`,
   `artifacts`.
2. Read `context.md` and every upstream plan's `specs/`. Spec scenarios are the
   seed; test cases are their concrete, data-filled form.
3. Load the project rule pack for the test/QA role if one exists — it defines the
   team's case format, priority labels and traceability expectations.
4. Load engine rules from the manifest, typically
   `../common/overconfidence-prevention.md` (ask about edge cases rather than
   inventing them).

---

## MAIN WORK

1. **Cover every acceptance criterion.** Each criterion needs at least one case;
   unmapped criteria are a gap, not an omission you get to make silently.
2. **Write cases, not intentions.** Each case has: id, title, preconditions,
   steps with concrete data, expected result, priority, and the spec or criterion
   it traces to.
3. **Go past the happy path**: boundary values, empty and maximum states,
   permissions, concurrency, network failure, and every error the plans mention.
4. **Ask about the unknowable.** Business rules that decide an expected result and
   are not written anywhere go into `questions.md` — a guessed expected result is
   worse than no test case.
5. **Keep them automatable.** The test-automation stage will implement these;
   avoid steps only a human can judge unless the case is deliberately manual.

---

## OUTPUT

- Test case document(s) in the context repo, one file per capability or surface
- A short coverage table: acceptance criterion → case ids
- Explicit list of anything deliberately not covered, with the reason

---

## GATE

Present: case count, coverage table, gaps, open questions.

```bash
openflow approve
```
