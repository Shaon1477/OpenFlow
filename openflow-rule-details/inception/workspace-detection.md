# Workspace detection

**Applies to** the `analyze` stage and any first action in a workspace.

Establish what kind of workspace this is before touching anything.

---

## 1. Is OpenFlow set up?

| Check | If missing |
|---|---|
| `openflow.yml` in the workspace root | Not an OpenFlow project. Offer `openflow init`; do not scaffold silently. |
| `openflow/state.json` | First run. Show `welcome-message.md`. |
| State exists | Resume. Follow `session-continuity.md`. |

## 2. Are the configured repos real?

For each role in `openflow.yml` → `repos`:

- Does the path exist? Is it a git repository?
- Current branch, and whether the tree is clean.
- Report per role. A missing path is Critical for stages that use that role, and
  irrelevant for stages that do not.

## 3. Greenfield or brownfield, per repo

| Signal | Treat as |
|---|---|
| No source, no dependency manifest | Greenfield — patterns will be established by this work |
| Existing source and history | Brownfield — patterns already exist and must be followed |

For brownfield repos, read before planning: the dependency manifest, the scripts,
the folder layout, one or two representative modules, and the existing tests. The
role's rule pack tells you what the team expects; the code tells you what is
actually there. When they disagree, raise it rather than picking one silently.

## 4. Where artifacts will go

Resolved by the engine, not guessed:

```bash
openflow next --json      # step.artifacts, step.repos
```

Generated artifacts live per repo under `openflow.yml` → `artifacts.dir`
(default `openflow/changes/{sub-item}/`). Orchestration state and the work item
context live in the workspace under `openflow/`. Product code lives in the repo's
normal source tree — never inside an artifacts directory.

## 5. Existing work to adopt

If artifact folders already exist for this work item — written by another agent, or
by a teammate — read them, verify them against the stage protocol, and use
`openflow adopt <stage>` rather than regenerating. Regenerating over someone's work
without asking is destructive.

---

## Output

A short report: OpenFlow set up (yes/no), repos and their branch state, greenfield
or brownfield per repo, artifact locations, and any existing work worth adopting.
