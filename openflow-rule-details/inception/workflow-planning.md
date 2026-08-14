# Delivery planning

**Applies to** the `analyze` stage, after requirements are understood.

Produce the part of `context.md` that says *how this delivery will run*: what it
touches, in what order, at what risk, and which optional stages apply. The flow
itself is not negotiable here — stages come from the flow YAML. What you decide is
scope, sequence and depth.

---

## 1. Impact assessment

Answer per involved repo, and record the answer:

| Area | Affected? | Notes |
|---|---|---|
| User-facing behaviour | | |
| API or event contracts | | |
| Data model / migrations | | |
| Infrastructure or configuration | | |
| Documentation only | | |

Anything marked as a contract change is a drift-sensitive seam: name it explicitly,
because the integrate stage will diff against it later.

## 2. Cross-repo sequencing

For multi-repo work, decide and record:

- **Order**: which role must go first, and why (usually the provider of a new
  contract, unless the consumer is defining it).
- **What can proceed in parallel**: work with no shared contract.
- **Coordination points**: the exact artifacts both sides will read.
- **Compatibility**: whether the change can ship in two deploys without breaking
  the other side.

If the flow's stage order contradicts the sequencing this work needs, say so at the
gate and propose either a different flow or an `optional` stage — do not silently
work out of order.

## 3. Optional stages

For each stage the flow marks `optional: true`, recommend execute or skip with a
one-line rationale. Bias toward executing anything that produces documentation or
tests; the cost of skipping those is paid later by someone else.

Never recommend skipping a `sync-context` stage.

## 4. Risk

| Level | Meaning |
|---|---|
| Low | Isolated, easy rollback, well understood |
| Medium | Several components, moderate rollback, some unknowns |
| High | System-wide impact, complex rollback, significant unknowns |
| Critical | Production-critical, hard to roll back, high uncertainty |

Record the level plus the two or three specific things that could go wrong. High and
Critical work justifies comprehensive depth (`../common/depth-levels.md`) and
explicit rollback planning in the plan stage.

## 5. Depth

Choose `minimal`, `standard` or `comprehensive` for this work item and say why.
Depth changes how much is written inside each artifact — never which artifacts
exist.

---

## Output

These sections inside `openflow/changes/{ticket}/context.md`:

- Scope matrix per repo
- Cross-role contracts touched, and the sequencing decision
- Optional stages: execute or skip, with rationale
- Risk level and the specific risks
- Selected depth and rationale

Then present them at the analyze gate. State tracking is the CLI's job — never write
progress into a markdown file by hand.
