# Code generation discipline

**Applies to** every `implement` and `integrate` stage.

**Rule.** Code is written in two parts: a reviewable plan, then execution. Never
produce product code straight from a prompt.

---

## Part 1 — Plan, then stop

Write `openflow/changes/{ticket}/{role}-implementation-plan.md`:

```markdown
# Implementation plan — {sub-item} ({role})

## Target
- Repo: {absolute path from `openflow next`}
- Branch: {feature branch}
- Source of truth: {artifacts_dir}/{sub-item}/{tasks.md, design.md, specs/}

## Steps
- [ ] 1.1 {task from tasks.md}
      Files: {exact paths — existing files named, new files marked NEW}
      Approach: {pattern being followed, and where it already exists in this repo}
      Risk: {what could break}

## Out of scope
- {things deliberately not touched}

## Commands to run
- install / lint / test / build (from the project rule pack, or the repo's scripts)
```

Requirements for the plan:

1. Every item maps to a task in `tasks.md`. No invented scope.
2. Paths are real paths in the target repo, resolved from `openflow next` — never a
   guess, never a documentation folder.
3. The approach names the existing pattern being reused. If nothing comparable
   exists, say so and justify the new pattern against the project rule pack.
4. Anything ambiguous goes to `questions.md` instead of into the plan as a guess.

**Then stop and let the human read it.** This mini-review is inside the stage; it
is not the stage's gate.

---

## Part 2 — Execute

1. Follow the approved plan in order.
2. Tick `tasks.md` boxes only when an item is genuinely complete.
3. Product code goes in the repo's real source tree. Artifacts (`proposal.md`,
   `specs/`, `design.md`, `tasks.md`) are documentation and never hold code that
   the application loads.
4. Commit in logical groups, referencing the sub-item id.
5. Run the project's lint, test and build commands. Fix what you broke before
   presenting the gate.
6. Enabled extensions (security, resiliency, testing) are **blocking**, not advice.

---

## When the plan turns out to be wrong

Stop. Do not improvise a different design and backfill the documents.

1. State what the plan got wrong and what you propose instead.
2. Revisit the `plan` stage so `design.md` and `tasks.md` change first.
3. Resume implementation from the corrected plan.

Recording deviations in `tasks.md` → *Deviations* is required when the change is
small enough not to warrant a full revisit; anything that changes a cross-role
contract always warrants the revisit.

---

## Definition of complete for this stage

- Plan approved before code was written
- Every task ticked or explicitly deferred with a reason
- Repo's own checks pass
- No undocumented deviation from `design.md`
