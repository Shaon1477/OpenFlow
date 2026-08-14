# OpenFlow

Workflow orchestration for AI-assisted delivery.

OpenFlow is **not** another coding assistant. It sits between you and Cursor / Claude / Codex / Copilot and runs a governed delivery: which stage is next, which repo it touches, which rules to load, when a human must approve, and whether the work is actually done.

**We maintain the flow. You keep your own rules.**

```text
work item → analyze → plan → implement → integrate → test → handoff → sync context
              ↑ gate    ↑ gate   ↑ gate      ↑ gate    ↑ gate   ↑ gate      ↑ gate
```

The coding agent writes the code. Your team’s markdown (or existing `AGENTS.md`) decides *how* it is written. OpenFlow decides *what happens next*, notices when an approved artifact changed underneath you, and refuses to archive a work item whose living documentation is stale.

> [!IMPORTANT]
> Generative AI can make mistakes. Review every stage before you approve. OpenFlow never auto-advances a gated stage.

## Table of Contents

- [What you get](#what-you-get)
- [Prerequisites](#prerequisites)
- [Install the CLI](#install-the-cli)
- [Initialize a project](#initialize-a-project)
- [Platform-specific setup](#platform-specific-setup)
- [Usage](#usage)
- [The delivery workflow](#the-delivery-workflow)
- [Your rules, not ours](#your-rules-not-ours)
- [Work items (not only Jira)](#work-items-not-only-jira)
- [When something changes](#when-something-changes)
- [Custom flows](#custom-flows)
- [Extensions](#extensions)
- [Definition of Done](#definition-of-done)
- [Commands](#commands)
- [Slash skills](#slash-skills)
- [Generated files](#generated-files)
- [Tenets](#tenets)
- [Troubleshooting](#troubleshooting)
- [Version control](#version-control)
- [License](#license)

---

## What you get

| Piece | Role |
|---|---|
| `openflow` CLI | State, gates, drift, archive |
| Stage protocols | Analyze / plan / implement / … — process we own |
| Project rule packs | Your engineering conventions — craft you own |
| Agent skills | `/openflow-start`, `/openflow-run`, `/openflow-approve`, … |
| Built-in flows | Full delivery, frontend-only, backend-only, mobile |

Standalone. No other workflow CLI is required.

---

## Prerequisites

| Requirement | Notes |
|---|---|
| Node.js 20 or newer | `node -v` |
| Git | Repos listed in `openflow.yml` |
| A coding agent | Cursor, Claude Code, Windsurf, Codex, Copilot, or any agent that can run shell commands and read markdown |

---

## Install the CLI

From this repository (until a public npm package is published):

```bash
git clone <this-repo>
cd OpenFlow
npm install
npm run build
npm link
```

Confirm:

```bash
openflow --help
```

To unlink later: `npm unlink -g openflow`.

---

## Initialize a project

Run this in the workspace that should own the flow — typically a parent folder of your frontend, backend, and docs repos, or any one repo if you only have one.

```bash
cd your-workspace
openflow init --name my-app --flow delivery-flow
```

`init` creates:

```text
your-workspace/
├── openflow.yml                 # flow, repos, intake, rules, DoD
├── .openflow/
│   ├── rules/                   # drop frontend.md / backend.md here
│   └── flows/                   # optional custom flow YAML
├── openflow/
│   ├── changes/                 # per-ticket context, questions, audit
│   └── templates/               # copied artifact templates
├── .cursor/rules/openflow.mdc   # always-on agent rules
└── .cursor/skills/openflow-*    # slash skills
```

Then edit `openflow.yml`:

```yaml
project:
  name: my-app
  flow: delivery-flow          # delivery-flow | frontend-flow | backend-flow | mobile-flow

intake:
  provider: jira               # jira | linear | github | mcp | file | manual | none

repos:
  frontend: ../web
  backend: ../api
  context: ../context-docs
  test: ../e2e

context_role: context

rules:
  discover: true
  packs:
    frontend:
      - .openflow/rules/frontend.md
    backend:
      - ../api/AGENTS.md
```

Check what the engine sees:

```bash
openflow flows
openflow rules
```

> [!NOTE]
> Do not re-run `init` to change the flow. Pick a flow per work item with `openflow start … --flow frontend-flow`. Use `--force` only when you intend to overwrite `openflow.yml`.

---

## Platform-specific setup

`openflow init` always installs Cursor rules and skills (`.cursor/rules/openflow.mdc` and `.cursor/skills/`). If it detects Claude, Windsurf, or Codex, it also copies skills there.

### Cursor

Already done by `init`. Verify:

1. Open **Cursor Settings → Rules** and confirm `openflow` is listed and always applied.
2. In chat, type `/` and confirm `/openflow-start`, `/openflow-run`, `/openflow-approve`.

Start a delivery with `/openflow-start PROD-5100` or:

```text
Using OpenFlow, start PROD-5100
```

### Claude Code

`init` copies skills to `.claude/skills/` when `.claude/` or `CLAUDE.md` exists. If you initialized before adding Claude:

```bash
mkdir -p .claude/skills
cp -R "$(npm root -g)/openflow/skills/." .claude/skills/
```

Add this to `CLAUDE.md` (or create it):

```markdown
When an OpenFlow delivery is active, run `openflow next` and follow
openflow-rule-details plus this project's rule packs. Never skip a gate.
```

### Windsurf

Detected via `.windsurf/`. Skills land in `.windsurf/skills/`. Re-run `openflow init --force` after creating that folder, or copy `skills/` there yourself.

### GitHub Copilot

Copilot does not get a skills folder from `init`. Point it at the core rules:

```bash
mkdir -p .github
cp "$(npm root -g)/openflow/openflow-rules/core.md" .github/copilot-instructions.md
```

Or append to an existing `copilot-instructions.md`: when a delivery is active, run `openflow next` and follow the stage protocol.

### OpenAI Codex

Detected via `.codex/`. Skills go to `.codex/skills/`. You can also copy `openflow-rules/core.md` to `AGENTS.md` at the workspace root.

### Other agents

1. Put `openflow-rules/core.md` wherever the agent reads project rules.
2. Put `openflow-rule-details/` where those rules can reference it (or rely on the installed package).
3. Give the agent shell access to the `openflow` CLI.

The general rule: **the CLI is the source of truth for state; the markdown is what the agent reads.**

---

## Usage

1. Initialize once (`openflow init`) and fill in `openflow.yml`.
2. Start a work item:

   ```bash
   openflow start PROD-5100 --title "Shift assignment" \
     --sub frontend=PROD-5102 --sub backend=PROD-5103 \
     --sub context=PROD-5101 --sub test=PROD-5104
   ```

3. In the agent, run `/openflow-run` (or `openflow next` then do that stage).
4. Review the artifacts. Approve:

   ```bash
   openflow approve
   ```

   or `/openflow-approve`.
5. Repeat until `openflow status` shows every stage complete.
6. Close out:

   ```bash
   openflow check
   openflow archive PROD-5100
   ```

The developer never has to remember the next step. `openflow next` is the next step.

### Where you are

```bash
openflow status
```

```text
── PROD-5100: Shift assignment [active] — flow delivery-flow ──
  ✓ analyze            Analyze work item
  ✓ frontend-plan      Frontend implementation doc
  ▸ frontend-build     Implement frontend   ← current
  □ backend-plan       Backend implementation doc
  □ integrate          Integrate frontend and backend
  □ sync-context       Update living context
```

---

## The delivery workflow

A **flow** is an ordered list of **stages**. Each stage has a **kind** (the protocol) and usually a **role** (which repo).

| Kind | Produces |
|---|---|
| `analyze` | `context.md` — what we are building, in which repos, what is still unknown |
| `plan` | Implementation docs: `proposal.md`, `specs/`, `design.md`, `tasks.md` |
| `implement` | Code on a feature branch; `tasks.md` checked off |
| `test-cases` | Human-readable cases |
| `integrate` | Cross-role wiring against the real contract |
| `test-automation` | Automated suites and a run matrix |
| `handoff` | Reviewer / stakeholder summary |
| `sync-context` | Living documentation updated, then archive |

Built-in flows:

| Flow | Use when |
|---|---|
| `delivery-flow` | Frontend + backend + integrate + tests + context |
| `frontend-flow` | UI-only (test automation optional) |
| `backend-flow` | Service-only |
| `mobile-flow` | Client + optional backend (example of a non-web role) |

Nothing in the engine is React- or Jira-specific. Roles are names in YAML.

Each gated stage **stops**. The agent prepares; you approve. Implementation stages also **verify** (completeness, correctness, coherence) before the gate is offered.

---

## Your rules, not ours

OpenFlow does not ship a house style. Every stage loads **your** engineering rules for that role.

**Option A — configure paths** in `openflow.yml`:

```yaml
rules:
  packs:
    frontend:
      - .openflow/rules/frontend.md
      - ../web/docs/conventions/      # a directory of markdown
      - skill:our-design-system       # one of your own agent skills
    backend:
      - ../api/AGENTS.md
```

**Option B — drop a file** and let discovery find it:

```text
.openflow/rules/<role>.md
.openflow/rules/<role>/*.md
openflow/rules/<role>.md
<repo>/<role>.md
<repo>/.openflow/rules.md
<repo>/AGENTS.md
<repo>/CLAUDE.md
```

```bash
openflow rules                 # what resolved, and from where
openflow rules --role frontend
```

See [examples/rules/frontend.md](examples/rules/frontend.md) for a realistic pack (stack, layout, patterns, commands, review bar).

Rule packs win on *how to build*. Stage protocols win on *process* (artifacts, gates, order).

---

## Work items (not only Jira)

```yaml
intake:
  provider: jira | linear | github | mcp | file | manual | none
  path: tickets/{ticket}.md     # provider: file
  instructions: "…"             # extra guidance for the agent
```

| Provider | Behaviour |
|---|---|
| `file` | CLI reads the markdown itself |
| `jira` / `linear` / `github` / `mcp` | Agent fetches via MCP or CLI you already have |
| `manual` | Agent asks you to paste title, description, acceptance criteria |
| `none` | Your prompt *is* the work item |

No tracker access is a supported setup, not a hard failure. See [examples/intake/](examples/intake/).

**Already have docs** from another agent or a wiki export:

```bash
openflow adopt frontend-plan --path ../web/docs/PROD-5102/ --note "written elsewhere"
```

The stage is verified, then fingerprinted, so later drift still applies.

---

## When something changes

Approving a stage records a content hash of its artifacts.

```bash
openflow drift
```

If the backend contract was edited after approval:

```text
Changed since approval:
  backend-plan

Stale (must be re-checked):
  backend-build ← backend-plan
  integrate     ← backend-plan
```

You do **not** have to tell the agent “we updated the API.” The next `/openflow-run` sees stale work. The integrate protocol starts with a contract diff.

Re-baseline after the re-check:

```bash
openflow approve --step integrate -m "re-wired against the new contract"
```

Blocked on someone else:

```bash
openflow block "waiting on the auth scope from platform"
openflow block --clear
```

Blocked work items cannot be approved.

---

## Custom flows

```bash
openflow flows
cp examples/flows/data-flow.yml .openflow/flows/
openflow start DATA-42 --flow data-flow
```

A project file with the same id as a built-in **replaces** it. Compose stage kinds for any roles you invent (`data`, `platform`, `cli`). Schema: [schemas/flow-definition.schema.json](schemas/flow-definition.schema.json). Example: [examples/flows/data-flow.yml](examples/flows/data-flow.yml).

---

## Extensions

Optional blocking constraints under `openflow-rule-details/extensions/`:

```text
extensions/
├── security/baseline/     security-baseline.md + .opt-in.md
├── testing/property-based/
└── resiliency/baseline/
```

Enable in `openflow.yml`:

```yaml
extensions:
  security: true
  testing: false
  resiliency: true
```

During analyze, the agent presents opt-in prompts. Enabled extension rules load on later stages and are **blocking**, not advice. You can add your own category the same way: a rules file plus an optional `*.opt-in.md`.

Treat the shipped security and resiliency files as a starting point. Customize them before relying on them in production.

---

## Definition of Done

`openflow check` runs executable checks. Defaults (when `dod: []`):

- every non-optional stage completed
- living context artifacts present
- no unresolved drift

Add your own in `openflow.yml`:

```yaml
dod:
  - id: e2e
    description: End-to-end suite passes
    type: command
    run: "npm --prefix ../e2e test"
    optional: true
```

Check types: `file_exists`, `file_contains`, `tasks_complete`, `step_completed`, `no_drift`, `command`.

`openflow archive` runs the same checks and **refuses** to close a failing work item. `--force` exists and is written to the audit trail.

Moving the ticket to Done in Jira/GitHub stays a human action.

---

## Commands

| Command | Purpose |
|---|---|
| `openflow init` | Scaffold config, skills, Cursor rule (`--force`, `--flow`, `--name`) |
| `openflow flows` | List available flows |
| `openflow start <id>` | Start or resume (`--title`, `--flow`, `--sub role=id`) |
| `openflow next [id]` | Current stage manifest (`--json` for agents) |
| `openflow approve [id]` | Pass the gate (`--step`, `-m`) |
| `openflow status [id]` | Progress, blockers, stale |
| `openflow rules` | Resolved rule packs (`--role`, `--json`) |
| `openflow drift [id]` | Detect post-approval changes |
| `openflow check [id]` | Definition of Done |
| `openflow adopt <step>` | Register external artifacts (`--path`, `--note`) |
| `openflow block ["reason"]` | Record a blocker (`--clear`) |
| `openflow archive <id>` | Close out (`--force`) |

---

## Slash skills

Installed under `.cursor/skills/` (and Claude / Windsurf / Codex when detected):

| Skill | When to use it |
|---|---|
| `/openflow-start` | Begin or resume a work item |
| `/openflow-run` | Execute the current stage, then stop |
| `/openflow-approve` | Record your approval and advance |
| `/openflow-status` | Where we are, what is stale |
| `/openflow-revisit` | Redo a stage after a change |
| `/openflow-adopt` | Keep existing docs instead of regenerating |
| `/openflow-rules` | Inspect or author a role’s rule pack |
| `/openflow-archive` | Close out after DoD passes |

---

## Generated files

| Path | What it is |
|---|---|
| `openflow.yml` | Project configuration |
| `openflow/state.json` | Cursor, sub-items, fingerprints, staleness, blockers |
| `openflow/changes/{ticket}/context.md` | Normalized work item and scope |
| `openflow/changes/{ticket}/questions.md` | Blocking questions with `[Answer]:` |
| `openflow/changes/{ticket}/audit.md` | Timestamped gates and decisions |
| `{repo}/openflow/changes/{sub-item}/` | `proposal.md`, `specs/`, `design.md`, `tasks.md` |
| `openflow/archive/changes/{ticket}/` | Closed work items |

Do not hand-edit `openflow/state.json`.

---

## Tenets

- **Flow, not generator.** OpenFlow does not write product code.
- **Your craft, our process.** Engineering conventions come from your rule packs.
- **One stage per turn.** The agent never jumps ahead.
- **Human in the loop.** Gated stages wait for `openflow approve`.
- **Ask in files.** Ambiguity goes to `questions.md`, not a buried chat guess.
- **Changes propagate.** Drift marks dependents stale; archive will not ignore it.
- **Done includes docs.** `sync-context` is not optional; DoD gates archive.
- **Agnostic.** Any agent, any tracker, any stack.

---

## Troubleshooting

| Problem | What to do |
|---|---|
| `No openflow.yml` | Run `openflow init` in the workspace root |
| `Flow not found` | `openflow flows` — check id and `.openflow/flows/` |
| Skills missing in chat | Confirm `.cursor/skills/openflow-start/SKILL.md`; reload the window |
| Agent ignores the flow | Confirm `.cursor/rules/openflow.mdc` is always-on; start with “Using OpenFlow, …” |
| Tracker / MCP missing | Set `intake.provider: manual` or `file`; do not invent requirements |
| Role has no rules | `openflow rules` — add `.openflow/rules/<role>.md` or set `rules.packs` |
| Configured pack missing | Typo in the path — `openflow rules` lists “configured but missing” |
| Cannot approve | Clear blockers (`openflow block --clear`); finish the stage first |
| Archive blocked | `openflow check` — finish remaining stages, resolve stale, or update context docs |
| State version error | This CLI expects state v2. Archive or remove `openflow/state.json` and `start` again |
| `npm link` not found | `npm run build` in the OpenFlow package, then `npm link` again |

---

## Version control

**Commit:**

```gitignore
openflow.yml
.openflow/rules/
.openflow/flows/
.cursor/rules/openflow.mdc
.cursor/skills/openflow-*
```

**Usually commit** ticket artifacts while the work is in flight (`openflow/changes/`, per-repo `openflow/changes/`). **Archive** moves the workspace copy under `openflow/archive/`.

**Do not commit:**

```gitignore
# secrets — never put tokens in openflow.yml
.env
```

`openflow/state.json` is local progress. Commit it if the team shares a workspace and needs to resume the same ticket; otherwise keep it gitignored.

---

## License

MIT. See [LICENSE](LICENSE).

Prior art that influenced the design (AI-DLC methodology and spec-driven change workflows): [ATTRIBUTION.md](ATTRIBUTION.md).
