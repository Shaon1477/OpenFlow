# How OpenFlow works

This is the owner’s guide. Read it once. After that, the GitHub [README](../README.md) is what users need.

If you only remember one sentence: **OpenFlow is a flow maintainer. The coding agent writes the code. The project’s own `.md` files decide how that code looks. OpenFlow decides what happens next, and whether it may advance.**

---

## 1. The problem it exists to solve

Without a flow engine, a developer and an agent do this by hand:

1. Read a ticket.
2. Write frontend docs (or skip them and jump to code).
3. Implement.
4. Repeat for backend, tests, integration.
5. Maybe update context docs. Often forget.

Three things go wrong:

| Failure | Why it happens |
|---|---|
| Docs get skipped | Nothing forces the plan stage before code |
| Output varies | Everyone prompts differently |
| Context docs rot | Updating them is optional, and nobody notices when the API changed after the UI was planned |

OpenFlow’s job is: start a work item, walk the defined flow to the end, and **refuse to close until living documentation is current**. The human can pause, edit, or block. They cannot silently skip the last mile.

---

## 2. Four layers (who owns what)

```
┌─────────────────────────────────────────────────────────┐
│  You (human)                                            │
│  approve, block, answer questions, pick the flow        │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  Coding agent (Cursor / Claude / Codex / …)             │
│  writes code and documents, one stage at a time         │
└──────────────────────────┬──────────────────────────────┘
                           │  openflow next / approve / …
┌──────────────────────────▼──────────────────────────────┐
│  OpenFlow engine                                        │
│  current stage, gates, fingerprints, drift, DoD         │
└──────────────────────────┬──────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
   openflow.yml      project rule packs    the repos
   (flow, roles,     (how to build)        (where work lands)
    intake, DoD)
```

| Layer | Owns | Does **not** own |
|---|---|---|
| Engine | Stage order, gates, state, drift, archive | Stack, folder layout, how React/Fastify is written |
| `openflow.yml` | Which flow, which repos, where tickets come from | Stage protocols |
| Rule packs | Craft: stack, patterns, tests, review bar | Process |
| Agent | Actual files and code | Advancing the cursor |

That split is the whole design. If a decision is “what is next?”, it is OpenFlow. If it is “how do we write a React query hook?”, it is the project’s `frontend.md`.

---

## 3. The runtime loop

Every session is the same four commands:

```
openflow start PROD-5100     # once per work item
        │
        ▼
   ┌─ openflow next ────────── agent reads the manifest
   │         │
   │         ▼
   │    does ONE stage
   │         │
   │         ▼
   │    stops at the gate
   │         │
   └─ openflow approve ────── fingerprints artifacts, advances
              │
              ▼
         openflow check + archive
```

`openflow next --json` is the contract with the agent. It returns:

- which stage (`key`, `kind`, `role`)
- which protocol file to follow (`stages/implement.md`, …)
- which **engine** rules to load (process)
- which **project rule packs** to load (craft)
- which repos it may write to
- exact artifact paths
- whether anything upstream went **stale**
- how to read the work item (`intake`)

The agent is not supposed to remember the pipeline. It asks the engine every time.

---

## 4. Stage kinds (the vocabulary we own)

A **flow** is an ordered list of stages. A **kind** is the protocol a stage follows. Roles (`frontend`, `backend`, `data`, anything) are config, not code.

| Kind | What it produces |
|---|---|
| `analyze` | `context.md` — normalized work item, scope, sub-items, questions |
| `plan` | `proposal.md`, `specs/`, `design.md`, `tasks.md` in that role’s repo |
| `implement` | Code on a feature branch, `tasks.md` ticked |
| `test-cases` | Human-readable cases in the context repo |
| `integrate` | Contract diff + wiring + smoke tests |
| `test-automation` | Automated suites + run matrix |
| `handoff` | Reviewer-facing summary |
| `sync-context` | Living docs updated, then archive |
| `custom` | Whatever `detail_file` you point at |

Built-in flows compose these:

- `delivery-flow` — frontend + backend + integrate + tests + context
- `frontend-flow` / `backend-flow` — one side
- `mobile-flow` — shows a non-web role

A team copies a YAML into `.openflow/flows/` and the same id **replaces** the built-in. That is how we maintain the flow without owning anyone’s stack.

`depends_on` is not just documentation. It is the graph **drift** walks: if `backend-plan` artifacts change after approval, every completed stage that depends on it (build, integrate, tests, handoff, sync) is marked stale.

---

## 5. Rule packs (how “your frontend.md” gets used)

When the current stage has `role: frontend`, the engine resolves that role’s pack:

1. `openflow.yml` → `rules.packs.frontend` (files, directories, or `skill:name`)
2. If empty and `rules.discover` is on, filename conventions:

```
.openflow/rules/frontend.md
.openflow/rules/frontend/*.md
openflow/rules/frontend.md
{repo}/.openflow/rules.md
{repo}/frontend.md
{repo}/AGENTS.md
{repo}/CLAUDE.md
```

Those files are listed in the manifest. The agent must load them **before** writing code. Precedence:

- Rule pack wins on *how to build*
- Stage protocol wins on *process* (artifacts, gates, ordering)

That is the flexibility you asked for: after `init`, point at frontend skills/rules, or drop `frontend.md` in the repo and discovery finds it. We do not bake React into the engine.

---

## 6. Intake (tickets are not assumed to be Jira)

```yaml
intake:
  provider: jira | linear | github | mcp | file | manual | none
```

| Provider | Who fetches |
|---|---|
| `file` | The CLI reads `path` (e.g. `tickets/{ticket}.md`) |
| `jira` / `linear` / `github` / `mcp` | The **agent**, using whatever MCP/CLI the project already has |
| `manual` / `none` | The developer pastes, or the prompt *is* the work item |

The engine never calls Jira. That keeps it installable without Atlassian credentials. Work already written elsewhere is `openflow adopt <stage> --path …` — verified, then fingerprinted, not regenerated.

---

## 7. Drift and Definition of Done (why context docs stop rotting)

```
approve(stage)
    → sha256(artifact files) stored on that stage

someone edits backend design.md
    → openflow drift (or the next `next` / `status`)
    → backend-plan is "modified"
    → integrate, test-automation, handoff, sync-context become "stale"

openflow check
    → every required stage completed?
    → living context files exist?
    → anything still stale?

openflow archive
    → runs the same checks
    → refuses unless they pass (or --force, which is audited)
```

This is the mechanism that replaces “hey we updated the backend, now update the frontend.” The flow notices. The integrate stage’s first job is a contract diff.

---

## 8. What lives on disk

**In this repo (the engine):**

```
src/lib/          config, flow-loader, rules, state, artifacts, drift, dod, intake, manifest
src/cli/          init, start, next, approve, status, rules, drift, check, adopt, block, archive
built-in-flows/   delivery / frontend / backend / mobile
openflow-rules/core.md
openflow-rule-details/
  stages/         protocols the agent follows
  intake/         how to read a work item
  flow-engine/    loader, executor, gates, recovery
  common/         questions, depth, session, errors
  construction/   plan-then-code, NFRs, build-and-test
  extensions/     optional security / resiliency / testing
skills/           /openflow-start, run, approve, status, revisit, adopt, rules, archive
templates/        context, proposal, spec, design, tasks, handoff, living-context
```

**In a consuming project after `openflow init`:**

```
openflow.yml                         project config
.openflow/rules/                     their craft rules
.openflow/flows/                     optional custom flows
.cursor/rules/openflow.mdc           always-on agent rules
.cursor/skills/openflow-*            slash skills
openflow/state.json                  cursor, fingerprints, stale, blockers
openflow/changes/{ticket}/           context.md, questions.md, audit.md
{each repo}/openflow/changes/{id}/   proposal, specs, design, tasks
```

Never hand-edit `state.json`. The CLI owns fingerprints and the audit trail.

---

## 9. Install the engine (you, developing OpenFlow)

Node 20+. From this folder:

```bash
cd OpenFlow
npm install
npm run build
npm link          # puts `openflow` on your PATH
npm run smoke     # end-to-end: init → approve → drift → stale → archive
```

Then in a real product workspace (the folder that should hold `openflow.yml` — often a parent of frontend/backend/context repos):

```bash
openflow init --name my-app --flow delivery-flow
# edit openflow.yml: repos, intake, rules.packs
openflow rules
openflow start PROD-5100 --title "…" --sub frontend=PROD-5102 --sub backend=PROD-5103
```

In Cursor, the loop is `/openflow-start` → `/openflow-run` → `/openflow-approve`.

To work on the engine itself: change TypeScript or rule markdown, `npm run build`, `npm run smoke`. Skills and `core.md` are copied into a project only at `init` (or re-init `--force`); bumping rules for an already-inited project means copying `openflow-rules/core.md` into `.cursor/rules/openflow.mdc` again, or telling the agent to read from this package path.

---

## 10. A ticket, walked

Assume `delivery-flow`, Jira or a file, four repos.

1. **analyze** — fetch the item, map sub-tickets, write `context.md`, ask blocking questions in `questions.md`. Gate.
2. **frontend-plan** — load `.openflow/rules/frontend.md`. Write proposal/specs/design/tasks in the web repo. Gate.
3. **frontend-build** — numbered implementation plan, then code, tick tasks, verify. Gate.
4. **test-cases** — cases in the context repo. Gate.
5. **backend-plan** — same as frontend, plus NFR/infra questions, using `AGENTS.md` from the API repo. Gate.
6. **backend-build** — implement. Gate.
7. **integrate** — diff what the API shipped vs what the UI assumed. Wire. Smoke. Gate.
8. **test-automation** — implement the cases. Gate.
9. **handoff** — one document a reviewer can read. Gate.
10. **sync-context** — merge behaviour into living docs. `openflow check`. Archive.

If at step 6 someone edits the backend `design.md`, step 7 is already stale before anyone says so.

If someone already wrote the frontend plan in another chat: `openflow adopt frontend-plan --path …` and continue at implement.

---

## 11. What we took from AI-DLC and OpenSpec

They are **reference**, not runtime. You can delete those sibling folders.

| From AI-DLC | In OpenFlow |
|---|---|
| Human gate every phase | `openflow approve` |
| Questions in chat (recorded in files) | ask in conversation, write `questions.md` |
| Adaptive depth | `depth-levels.md` |
| Plan then code | `construction/code-generation.md` |
| Opt-in extensions | `extensions/` |

| From OpenSpec | In OpenFlow |
|---|---|
| Change = proposal + specs + design + tasks | `templates/artifacts/` + plan stage |
| Specs as SHALL + scenarios | spec template |
| Tick tasks to implement | implement stage |
| Fold delta into living docs, then archive | `sync-context` + `archive` |

What is **ours**: multi-repo roles, generic stage kinds, project rule packs, pluggable intake, fingerprint/drift, executable DoD on archive.

What we still owe those genres (not in the engine yet): OpenSpec’s typed ADDED/MODIFIED/REMOVED merge, a scored verify report, and a dedicated explore-only pass. The current `sync-context` and `VERIFY` sections are the intent, not the full protocol.

---

## 12. Commands (cheat sheet)

| Command | Purpose |
|---|---|
| `openflow init` | Scaffold config, skills, Cursor rule |
| `openflow flows` | List built-in + project flows |
| `openflow start <id>` | Start or resume (`--flow`, `--sub role=id`, `--title`) |
| `openflow next` | Manifest for the current stage (`--json`) |
| `openflow approve` | Gate + fingerprint + advance (`--step`, `-m`) |
| `openflow status` | Progress, blockers, stale |
| `openflow rules` | Resolved packs per role |
| `openflow drift` | Recompute stale |
| `openflow check` | Definition of Done |
| `openflow adopt <step>` | Register external artifacts |
| `openflow block` | Pause (`--clear` to resume) |
| `openflow archive <id>` | Close out (DoD must pass) |

Skills: `/openflow-start`, `/openflow-run`, `/openflow-approve`, `/openflow-status`, `/openflow-revisit`, `/openflow-adopt`, `/openflow-rules`, `/openflow-archive`.

---

## 13. Further reading

| File | When |
|---|---|
| [README.md](../README.md) | Public install / usage (GitHub) |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Module map inside `src/lib` |
| [USER-EXECUTION-FLOW.md](USER-EXECUTION-FLOW.md) | Short day-to-day loop |
| [../openflow-rules/core.md](../openflow-rules/core.md) | What the agent is told, always |
| [../examples/](../examples/) | Sample rule packs, a custom flow, intake |
| [../ATTRIBUTION.md](../ATTRIBUTION.md) | Prior art |
