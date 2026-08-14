# OpenFlow architecture

> Module map for `src/lib`. For the owner walkthrough (problem, loop, install), see [HOW-IT-WORKS.md](HOW-IT-WORKS.md). For the public install guide, see [../README.md](../README.md).

---

## 1. The split that defines everything

| Layer | Owns | Lives in |
|---|---|---|
| **Engine (ours)** | Stage protocols, gates, state, drift, Definition of Done | this repo |
| **Project config** | Which flow, which roles, which repos, where work items come from | `openflow.yml`, `.openflow/flows/` |
| **Project rule packs** | Every engineering convention — stack, patterns, layout, tests | wherever the team points |
| **Coding agent** | Writing the actual code and documents | Cursor / Claude / Codex / … |

OpenFlow never generates product code and never dictates house style. It decides
*what happens next* and *whether it may advance*.

---

## 2. Runtime pieces

```
openflow.yml ──┐
               ├─► config      roles, intake, artifacts dir, rules, DoD
flow YAML ─────┤   flow-loader stages, kinds, roles, depends_on, gates
               ├─► rules       rule-pack resolution (config → conventions)
project files ─┘   intake      work item source resolution

state.json ──────► state       cursor, sub-items, fingerprints, staleness
                   artifacts   path expansion + content fingerprints
                   drift       modified upstream → stale downstream
                   dod         executable Definition of Done
                   manifest    everything one stage needs, as one object
```

`src/lib/` holds those modules; `src/cli/` is a thin command layer over them.

### Stage manifest

`openflow next --json` is the single interface an agent needs:

```json
{
  "ticket": "PROD-5100",
  "stale": [],
  "step": {
    "key": "frontend-build",
    "kind": "implement",
    "role": "frontend",
    "repos": { "frontend": "../web" },
    "detail_file": "stages/implement.md",
    "engine_rules": ["construction/code-generation.md"],
    "rule_packs": [{ "role": "frontend", "sources": [{ "ref": ".openflow/rules/frontend.md", "origin": "config" }] }],
    "artifacts": ["../web/openflow/changes/PROD-5102/tasks.md"],
    "human_gate": true,
    "verify": true
  }
}
```

---

## 3. Stage kinds

Protocols in `openflow-rule-details/stages/`:

| Kind | Produces |
|---|---|
| `analyze` | `context.md` — normalized item, scope, sub-items, questions |
| `plan` | `proposal.md`, `specs/`, `design.md`, `tasks.md` for one role |
| `implement` | Code on a branch, tasks ticked, verification result |
| `test-cases` | Human-readable cases in the context repo |
| `integrate` | Contract diff, wiring, smoke results |
| `test-automation` | Automated suites and a run matrix |
| `handoff` | Reviewer-facing summary |
| `sync-context` | Living documentation updated, then archive |
| `custom` | Whatever the flow's `detail_file` defines |

A flow is an ordered list of stages with `key`, `kind`, `role`, `repos`,
`depends_on`, `human_gate`, `verify`, `rules`, `rule_packs`, `artifacts`. Nothing in
the engine mentions a specific technology.

---

## 4. Rule pack resolution

```
openflow.yml → rules.packs[role]        (explicit: files, directories, skill:<name>)
      ↓ empty and rules.discover != false
conventions: .openflow/rules/{role}.md → .openflow/rules/{role}/ →
             openflow/rules/{role}.md → {repo}/.openflow/rules.md →
             {repo}/{role}.md → {repo}/AGENTS.md → {repo}/CLAUDE.md
```

Directories expand to their markdown files. Configured entries that do not exist are
reported, never silently ignored. Precedence: rule packs win on engineering, stage
protocols win on process.

---

## 5. Drift model

```
approve(stage)  → fingerprint = sha256(artifact contents)
drift()         → recompute; changed ⇒ "modified"
                → every completed stage depending on a modified stage ⇒ "stale"
                → stale surfaces in next/status and fails the no_drift check
```

Consequences: editing a backend contract after approval marks the integration and
everything after it stale, so the dependency — not the developer's memory — triggers
the re-check. Re-baseline with `openflow approve --step <key>`.

## 6. Definition of Done

Check types: `file_exists`, `file_contains`, `tasks_complete`, `step_completed`,
`no_drift`, `command`. Defaults when `dod: []`: every non-optional stage completed,
living context artifacts present, no drift. `openflow archive` runs it and refuses
to close on failure unless `--force`, which is audited.

---

## 7. Files on disk

| Path | Contents |
|---|---|
| `openflow.yml` | Project configuration |
| `openflow/state.json` | Cursor, sub-items, fingerprints, staleness, blockers |
| `openflow/changes/{ticket}/` | `context.md`, `questions.md`, `audit.md`, plans |
| `openflow/archive/changes/{ticket}/` | Archived work items |
| `{repo}/{artifacts.dir}/{sub-item}/` | `proposal.md`, `specs/`, `design.md`, `tasks.md` |
| `.openflow/rules/`, `.openflow/flows/` | Project rule packs and flows |
| `.openflow/openflow-rule-details/` | Optional override of any engine rule file |

---

## 8. Extending without forking

| Goal | Do this |
|---|---|
| Different engineering rules | Add a rule pack per role |
| Different stage order | Copy a built-in flow into `.openflow/flows/`, keep the id |
| A new role | Add it to `repos`, use it as a stage's `role` |
| A different tracker | Set `intake.provider` (+ `instructions`) |
| Stricter closeout | Add `dod` checks, including `type: command` |
| Change a stage protocol | Override the file under `.openflow/openflow-rule-details/stages/` |
| Team-specific skill inside a stage | `skill:<name>` in that role's rule pack |

---

## 9. Deliberate limits

- The CLI never calls an MCP server; the agent does, guided by intake rules. This
  keeps the engine dependency-free and tool-agnostic.
- Artifact tracking is path- and directory-based, not glob-based.
- Stages are sequential; there is no parallel fan-out.
- `openflow.yml` is not auto-migrated between major versions; the CLI tells you
  when state is from an older version.
