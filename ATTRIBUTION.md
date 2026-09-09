# Attribution

OpenFlow is standalone. It has no runtime dependency on any other workflow
framework, and no other repository needs to be checked out beside it.

## Prior art that influenced the design

Two open-source projects shaped the thinking, and some engineering-discipline ideas
in `openflow-rule-details/` are descended from them:

- **AI-DLC workflow rules** (Apache-2.0) — the ideas of adaptive analysis depth,
  asking questions in files rather than chat, plan-then-execute code generation, and
  opt-in engineering extensions.
- **Spec-driven change workflows** — the idea of a change carrying a proposal,
  requirement specs with scenarios, a design, and a task list, then folding the
  delta back into living documentation.
- **[Superpowers](https://github.com/obra/superpowers)** (MIT, obra / Prime Radiant) —
  systematic debugging, verification-before-completion, and pre-gate code review.
  OpenFlow ships adapted copies under `skills/` and loads them only on
  implement/verify stages. We do **not** adopt Superpowers brainstorming, plan
  execution, or subagent-driven development — those conflict with OpenFlow gates.

## What OpenFlow does differently

- **Stages, not a fixed pipeline.** Stage kinds compose into any flow, for any
  role a project invents.
- **Project rule packs are first class.** The engine owns process; every
  engineering convention comes from files the team supplies.
- **Intake is pluggable.** Trackers, MCP servers, a markdown file, or nothing.
- **Drift is detected.** Artifacts are fingerprinted at approval, so a change
  upstream marks dependent stages stale automatically.
- **Definition of Done is executable** and gates closeout, so a delivery cannot end
  with stale documentation.

All content in this repository is OpenFlow's own text, written for this engine's
model and paths. Where an idea came from prior art it is credited above rather than
vendored by reference.

OpenFlow is released under the MIT licence; see `LICENSE`.
