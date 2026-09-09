# OpenFlow — core rules

> **Priority.** When an OpenFlow delivery is active, this workflow overrides ad-hoc
> coding. Ask the engine what to do next; do not improvise a parallel process.

---

## Identity

OpenFlow is a **flow orchestration engine** for AI-assisted delivery.

- **OpenFlow owns the process**: which stage is next, which repo it touches, which
  rules load, when a human must approve, what counts as done.
- **The project owns the craft**: every engineering convention comes from the
  project's own rule packs, not from OpenFlow.
- **The coding agent executes**: OpenFlow writes no product code.

It does not replace the tracker, the coding assistant, or the team's standards.

---

## Session bootstrap — every conversation

```bash
openflow next --json
```

That single command returns the stage, its protocol file, the engine rules, **this
project's rule packs for the role**, the skills to run, the exact artifact paths,
any blocker, and anything that went stale. Then:

1. Load the stage protocol (`openflow-rule-details/stages/<kind>.md`).
2. Load the engine rules the manifest lists.
3. Load **every** rule pack file the manifest lists.
4. Load the artifacts of each `depends_on` stage.
5. Execute that one stage. Stop at its gate.

If there is no state yet: `openflow-rule-details/inception/workspace-detection.md`,
then `common/welcome-message.md`. If there is: `common/session-continuity.md`.

**Always loaded:** `common/session-continuity.md`,
`common/overconfidence-prevention.md`, `common/question-format-guide.md`,
`common/content-validation.md`, `common/error-handling.md`,
`flow-engine/step-executor.md`, `flow-engine/human-gate.md`,
`flow-engine/recovery.md`.

### Rule-details resolution

First path that exists wins, so a project can override any engine rule:

1. `.openflow/openflow-rule-details/`
2. `openflow/openflow-rule-details/`
3. the installed package's `openflow-rule-details/`

---

## Two kinds of rules — and which wins

| | Engine rules | Project rule packs |
|---|---|---|
| Live in | `openflow-rule-details/` | anywhere the project points to |
| Cover | Process: stages, gates, artifacts, drift, recovery | Craft: stack, patterns, layout, tests, review bar |
| Authored by | OpenFlow | The team |
| Wins on | Process questions | Engineering questions |

Rule packs are resolved per role from `openflow.yml` → `rules.packs`, or discovered
by convention:

```
.openflow/rules/<role>.md        .openflow/rules/<role>/*.md
openflow/rules/<role>.md         <repo>/<role>.md
<repo>/.openflow/rules.md        <repo>/AGENTS.md    <repo>/CLAUDE.md
```

An entry of `skill:<name>` means "run that agent skill during the stage" — how a
team plugs its own skill into a generic flow.

```bash
openflow rules              # what resolved, and from where
```

If a role has no pack: say so once, proceed with engine defaults, and suggest
`.openflow/rules/<role>.md`. Never invent a house style and present it as theirs.

---

## Stage kinds

Protocols in `openflow-rule-details/stages/`: `analyze`, `plan`, `implement`,
`test-cases`, `integrate`, `test-automation`, `handoff`, `sync-context`, `custom`.

A flow composes them in any order, for any role, any number of times. Roles are
config (`frontend`, `backend`, `mobile`, `data`, anything), never hardcoded.

---

## Work items are not assumed to be Jira

`openflow.yml` → `intake.provider`: `jira`, `linear`, `github`, `mcp`, `file`,
`manual`, `none`. The CLI reads `file` itself; everything else returns instructions
you execute with whatever MCP or CLI the project has. No tracker access is a reason
to ask the developer, never a reason to invent requirements. See
`openflow-rule-details/intake/`.

Work already done elsewhere is adopted, not redone:

```bash
openflow adopt <stage> --path <dir> --note "written by another agent"
```

---

## Config and state

| Artifact | Path | Role |
|---|---|---|
| Project config | `openflow.yml` | Flow, intake, repos, rules, extensions, Definition of Done |
| State | `openflow/state.json` | Cursor, sub-items, fingerprints, staleness, blockers |
| Work item context | `openflow/changes/{ticket}/context.md` | Normalized item and scope |
| Questions | `openflow/changes/{ticket}/questions.md` | Blocking questions with `[Answer]:` |
| Audit trail | `openflow/changes/{ticket}/audit.md` | Timestamped decisions and gates |
| Stage artifacts | `{repo}/{artifacts.dir}/{sub-item}/` | proposal, specs, design, tasks |
| Flow | `.openflow/flows/{id}.yml` or built-in | Stages, gates, dependencies |

Never hand-edit `openflow/state.json`. Use the CLI.

---

## Commands

| Command | Purpose |
|---|---|
| `openflow init` | Set up a project once |
| `openflow flows` | List available flows |
| `openflow start <id>` | Start or resume a work item (`--flow`, `--sub role=id`) |
| `openflow next` | Current stage manifest (`--json` for agents) |
| `openflow approve` | Pass the gate, fingerprint artifacts, advance (`--step`, `-m`) |
| `openflow block` | Record or clear a blocker (`--clear`) |
| `openflow status` | Stage progress, blockers, stale work |
| `openflow rules` | Resolved rule packs per role |
| `openflow drift` | Detect post-approval changes, mark dependents stale |
| `openflow check` | Executable Definition of Done |
| `openflow adopt` | Register externally authored work as a stage |
| `openflow archive` | Close out (blocked unless the Definition of Done passes) |

Skills: `/openflow-start`, `/openflow-run`, `/openflow-approve`, `/openflow-status`,
`/openflow-revisit`, `/openflow-adopt`, `/openflow-rules`, `/openflow-archive`.

---

## Non-negotiables

1. **One stage per turn.** `openflow next` decides; never jump ahead.
2. **No code before its plan is approved.** Implementation stages follow
   `construction/code-generation.md`: numbered plan → human read → execute.
3. **Never self-approve.** Only the human, via `openflow approve`.
4. **Ask instead of assuming.** Blocking questions are asked **in chat**. Wait
   for the answer, then record it in `questions.md`. Do not guess.
5. **Write only where told.** The manifest's repos and artifact paths, nothing else.
6. **Changes propagate.** After any hand edit, `openflow drift`; resolve stale
   stages before continuing.
7. **Documentation is part of done.** `sync-context` is never skipped, and
   `openflow archive` enforces it. `--force` requires an explicit human decision.
8. **Confirm destructive actions** before deleting or regenerating artifacts.

---

## What OpenFlow is not

- Not a tracker, and not tied to one
- Not the code generator — the agent is
- Not a house style — the project's rule packs are
- Not tied to one AI tool; rules and skills are portable

When unsure: run `openflow next`, load what it lists, do that stage, stop.
