# Stage protocols

A **stage kind** is a protocol OpenFlow owns. A flow composes stages in any order,
for any role, as many times as it likes. Nothing here is frontend- or
backend-specific: the role comes from the flow YAML, the craft rules come from
the project's own rule packs.

| Kind | File | Produces |
|---|---|---|
| `analyze` | `analyze.md` | `context.md` — normalized work item, scope, sub-items, questions |
| `plan` | `plan.md` | `proposal.md`, `specs/`, `design.md`, `tasks.md` for one role |
| `implement` | `implement.md` | Code on a feature branch, `tasks.md` checked off |
| `test-cases` | `test-cases.md` | Human-readable test cases in the context repo |
| `integrate` | `integrate.md` | Cross-role wiring, contract reconciliation |
| `test-automation` | `test-automation.md` | Automated suites and run results |
| `handoff` | `handoff.md` | Reviewer/stakeholder summary document |
| `sync-context` | `sync-context.md` | Living documentation updated, change archived |
| `custom` | flow's `detail_file` | Whatever the project defines |

## Contract every stage follows

```
ON ENTRY → MAIN WORK → OUTPUT → audit → GATE
```

1. **ON ENTRY** — run `openflow next` (or `openflow next --json`). It returns the
   stage protocol, engine rules, **project rule packs for the role**, skills,
   artifact paths, and whether anything upstream went stale.
2. **MAIN WORK** — follow this stage protocol, obeying the project rule packs. If
   a pack and this file disagree on *how* to build something, the pack wins. If
   they disagree on *process* (gates, artifacts, ordering), this file wins.
3. **OUTPUT** — write only to the paths `openflow next` listed.
4. **Audit** — the CLI appends gate/drift entries; add a short human note for
   decisions worth remembering.
5. **GATE** — stop. Wait for `openflow approve`. Never self-approve.

## Two rules that apply to every stage

- **Ask, do not assume.** Any ambiguity that changes behaviour is asked in chat.
  Wait for the answer, then record it in `openflow/changes/{ticket}/questions.md`.
  See `../common/question-format-guide.md` and `../common/overconfidence-prevention.md`.
- **Already-done work is adopted, not redone.** If the artifacts a stage would
  produce already exist (another agent, another team, a wiki export), verify them
  against this protocol and run `openflow adopt <stage>` instead of regenerating.
