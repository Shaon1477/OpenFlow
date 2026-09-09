# Stage executor

**Purpose.** Run exactly one stage, end to end, and stop. This is the loop every
session follows.

---

## The loop

```
openflow next --json        →  ON ENTRY   (load protocol + rules + rule packs)
                            →  MAIN WORK  (follow the stage protocol)
                            →  OUTPUT     (write only declared artifacts)
                            →  audit      (record decisions worth keeping)
                            →  GATE       (stop; human runs openflow approve)
```

Never merge two stages into one turn. Never advance the cursor yourself — only
`openflow approve` does that.

---

## Phase 0 — Bootstrap

1. `openflow next --json`.
2. If `blocker` is set: stop and report it. No work while blocked.
3. If `stale` is non-empty: handle staleness first (`../common/workflow-changes.md`).
4. Load `step.detail_file` — the stage protocol under `../stages/`.

## Phase 1 — ON ENTRY

Load, in this order:

1. The stage protocol.
2. `engine_rules` from the manifest (process and discipline).
3. **Every file in `rule_packs`** — the project's own engineering rules for the
   role. If a role has none, say so once and continue with engine defaults.
4. The artifacts of every `depends_on` stage.

Then state, in one or two lines: the stage, its role and sub-item, the repos in
scope, and which rule packs you loaded. That sentence is how the developer catches
a misconfiguration early.

## Phase 2 — MAIN WORK

- Follow the stage protocol's steps in order.
- Obey the rule packs for craft decisions; obey the protocol for process decisions.
- Implementation stages additionally follow `../construction/code-generation.md`:
  numbered plan, human read, then execute.
- Blocking questions are asked in chat (see `../common/question-format-guide.md`).
  Wait for answers, then record them in `openflow/changes/{ticket}/questions.md`.

## Phase 3 — OUTPUT

- Write only to paths in `step.artifacts` and repos in `step.repos`.
- Validate content before writing (`../common/content-validation.md`).
- Product code goes in the repo's real source tree, never in an artifacts folder.

## Phase 4 — Audit

The CLI records gates, drift and adoption automatically. Add a short human note for
anything a future reader would otherwise have to reverse-engineer: a rejected
alternative, a constraint discovered late, a deliberate deferral.

## Phase 5 — GATE

If `human_gate` is true (the default), present:

- Stage and role
- Artifacts produced, as paths
- Key decisions, in one line each
- Verification result when `verify` is true (completeness / correctness / coherence)
- Open questions and risks
- The next action: `openflow approve`

If `human_gate` is false, say what was produced and continue to the next stage in a
new turn.

---

## Hard rules

1. One stage per turn.
2. No code before the plan artifacts exist and their gate passed.
3. No self-approval, no cursor edits, no hand-editing `openflow/state.json`.
4. No writing outside the declared repos and artifact paths.
5. No inventing requirements to avoid asking a question.
6. If artifacts already exist and were authored elsewhere, verify and
   `openflow adopt` instead of regenerating.
