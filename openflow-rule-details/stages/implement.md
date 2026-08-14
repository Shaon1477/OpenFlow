# Stage: implement

**Goal.** Execute the approved plan for one role, on a feature branch, without
inventing scope.

**Produces.** Code in the role's repo, `tasks.md` checked off, verification result.

---

## ON ENTRY

1. `openflow next --json` — read `role`, `sub_ticket`, `repos`, `verify`, `stale`.
2. Read the plan artifacts for this role: `proposal.md`, `specs/`, `design.md`,
   `tasks.md`. If they do not exist, the plan stage was skipped — stop and say so.
3. Load the **project rule packs for this role**. This is where the team's real
   engineering standards live: language and framework conventions, folder layout,
   state management, styling, logging, error handling, test placement. Follow them
   over any generic advice in the engine rules.
4. Load engine rules from the manifest, notably
   `../construction/code-generation.md` (plan-then-execute discipline) and any
   enabled extension rules (security, resiliency, and so on).
5. Confirm the feature branch is checked out in the role's repo.

---

## MAIN WORK

### Part 1 — Numbered plan, then stop

Write a numbered execution plan mapped to `tasks.md`, listing per item: files to
touch, the approach, and the risk. Save to
`openflow/changes/{ticket}/{role}-implementation-plan.md` and let the developer
review it. Do not write product code before that mini-review.

### Part 2 — Execute

1. Work `tasks.md` in order. Tick each box (`- [ ]` → `- [x]`) as it truly
   completes, not when it is started.
2. Commit in logical groups; reference the sub-item id in the message.
3. Run the repo's own lint, build and test commands (the rule pack should name
   them; otherwise infer from the repo's scripts) and fix what you broke.
4. Honour every enabled extension as blocking, not advisory.
5. Do not edit the plan artifacts to match the code. If the design turns out to
   be wrong, stop, say so, and revisit the plan stage — that path keeps the docs
   truthful instead of silently drifting.

---

## VERIFY (when the manifest sets `verify: true`)

Before presenting the gate, check three dimensions and report each explicitly:

| Dimension | Question |
|---|---|
| Completeness | Is every `tasks.md` box genuinely done? |
| Correctness | Does behaviour match each spec scenario and the acceptance criteria? |
| Coherence | Does the code match `design.md` and the cross-role contract? |

Any failure keeps the gate closed. Report it rather than quietly patching the
spec.

---

## OUTPUT

- Code committed on the feature branch in the role's repo
- `tasks.md` accurately reflecting completion
- Verification result in the gate summary and audit trail

---

## GATE

Present: branch, commit summary, task count, verification result, extensions
applied. Then:

```bash
openflow approve
```

If you changed anything by hand after approval, run `openflow drift` so the
dependent stages get flagged.
