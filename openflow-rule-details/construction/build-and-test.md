# Build and test strategy

**Applies to** `implement`, `integrate` and `test-automation` stages.

Use the project's existing tooling. The role's rule pack names the framework,
runner, layout and commands; if it does not, infer them from the repo's scripts and
existing tests — never introduce a second testing stack.

---

## Choose the right level

| Level | Use for | Keep it |
|---|---|---|
| Unit | Business rules, pure logic, edge cases | Fast, no I/O |
| Integration | Module + real collaborator (db, cache, http) | Focused on the seam |
| Contract | The agreed shape between two roles | Derived from `design.md` |
| End-to-end | The user-visible happy path and key failures | Few, stable, meaningful |
| Performance | Only when an NFR names a number | Reproducible |
| Security | Only when the security extension is enabled | Automated where possible |

Push detail down: a rule provable in a unit test does not need an end-to-end test.

## Rules

1. **Every spec scenario is covered somewhere.** Name the requirement in or beside
   the test so traceability survives.
2. **Test observable behaviour**, not private implementation details, or the suite
   will block the next refactor.
3. **Deterministic or deleted.** Fix flakes; never retry-until-green. If a test must
   be skipped, say so at the gate with a reason.
4. **Real failure paths.** Assert error handling, not just the happy path.
5. **Data setup is explicit.** Fixtures and factories from the project's existing
   helpers; no dependence on leftover state or test ordering.
6. **A failing test is information.** Decide whether the product or the test is
   wrong, fix that one, and say which it was.

## Running

Record, per environment, the exact command and the result:

```
| Environment | Command | Result |
|---|---|---|
| local | <repo command> | pass / fail (n skipped) |
| dev | | |
| test | | |
```

Only claim an environment passed if you ran it there. Unrun is reported as unrun.

## Build

Before any gate on an implementing stage: install, lint, build and unit tests must
pass in the repos you touched. Report the commands used so a reviewer can repeat
them.

---

## Output

- Tests committed in the location the project uses
- Run matrix with commands and results per environment
- Product bugs found, each attributed to the stage that owns the fix
- Anything skipped or left manual, with the reason
