# Stage: plan

**Goal.** Produce the implementation document set for **one role** before any code
is written. This is the contract the implement stage executes and the integrate
stage reconciles against.

**Produces.** In the role's repo, under `{artifacts_dir}/{sub_ticket}/`:

| File | Contains |
|---|---|
| `proposal.md` | Why, what changes, what is explicitly out of scope |
| `specs/*.md` | Requirements with concrete scenarios (behaviour, not code) |
| `design.md` | Technical approach, structure, contracts consumed or exposed |
| `tasks.md` | Ordered checkbox tasks, each traceable to a spec |

Templates: `../../templates/artifacts/`.

---

## ON ENTRY

1. `openflow next --json` — read `role`, `sub_ticket`, `repos`, `artifacts`,
   `rule_packs`, `stale`.
2. Read `openflow/changes/{ticket}/context.md` and the artifacts of every
   `depends_on` stage. A backend plan must read the frontend plan's contract
   assumptions, and vice versa.
3. Load the **project rule packs for this role**. They define the stack, the
   patterns, the folder layout, the testing expectations. Treat them as binding.
4. Load engine rules from the manifest — typically `../common/depth-levels.md`
   and the design-question checklists under `../construction/`.
5. If the artifacts already exist and were written elsewhere, verify them against
   the checklist below and use `openflow adopt {stage}` instead of rewriting.

---

## MAIN WORK

1. **Restate the slice.** One paragraph: what this role delivers for this work
   item, and what it does not.
2. **Work the design questions.** Use the project rule pack first; fall back to
   `../construction/functional-design.md` (behaviour) and, for service-side work,
   `../construction/nfr-requirements.md`, `../construction/nfr-design.md`,
   `../construction/infrastructure-design.md`.
3. **Write specs as scenarios.** Each requirement gets at least one
   `WHEN … THEN …` scenario. Scenarios are how the verify step judges
   correctness, so vague specs make verification meaningless.
4. **Write the design.** Include the cross-role contract in an explicit,
   quotable form (endpoint shapes, event names, props, error cases). This section
   is what the other role reads — write it for them, not for yourself.
5. **Write tasks.** Ordered, small, each mapped to a spec, each independently
   checkable. No `TBD` on anything blocking.
6. **Cross-check.** Every task traces to a spec; the design contradicts neither
   `context.md` nor the upstream plan; the rule pack's constraints are satisfied.
7. **Questions.** Unresolved product decisions are asked in chat, then recorded
   in `questions.md` — not guessed into the design.

---

## OUTPUT

All four artifact kinds exist in the role's repo under
`{artifacts_dir}/{sub_ticket}/` and are internally consistent.

Nothing is written outside that directory in this stage.

---

## GATE

Present artifact paths, the cross-role contract section verbatim, and any open
questions. Then:

```bash
openflow approve
```

Approval fingerprints these artifacts. If they change later, every downstream
stage is automatically marked stale — that is the mechanism that catches
"the API changed after the frontend was planned".
