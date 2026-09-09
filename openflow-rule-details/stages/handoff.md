# Stage: handoff

**Goal.** Produce the one document a reviewer, QA engineer or stakeholder can read
to understand what shipped, without reading the diff.

**Produces.** A handoff document in the context repo (commonly
`{artifacts_dir}/{sub_ticket}/handoff.md`, or the path the flow declares).

---

## ON ENTRY

1. `openflow next --json` — read `role`, `repos`, `artifacts`.
2. Gather every prior artifact: `context.md`, each role's plan and tasks, the
   integration reconciliation note, the test run matrix, the audit trail.
3. Load the project rule pack for the context role if one exists — teams usually
   have a required shape for this document (and for what gets pasted back into the
   tracker).

---

## MAIN WORK

Write for someone who was not in the room:

1. **What changed and why** — in product language, two paragraphs at most.
2. **Scope delivered** — per role and repo, with branch names.
3. **Contract changes** — anything another team consumes: endpoints, events,
   props, schemas, flags. Include before/after.
4. **How it was verified** — test cases, automation results, environments.
5. **Decisions and trade-offs** — what was chosen, what was rejected, why. Pull
   these from the audit trail; do not re-derive them.
6. **Deferred and known gaps** — with the reason and, if known, the follow-up item.
7. **Operational notes** — migrations, feature flags, config, rollout or rollback
   steps, anything on-call should know.
8. **Links** — work item, sub-items, plan artifacts, pull requests.

Copy nothing that is untrue: if a task was cut, say it was cut. This document is
the input to the living documentation update, so an inaccuracy here becomes an
inaccuracy in the team's permanent context.

---

## GATE

Present the document path plus the contract-change and known-gaps sections
inline — those two are what reviewers argue with.

```bash
openflow approve
```
