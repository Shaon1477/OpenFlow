# Stage: analyze

**Goal.** Turn a work item into a `context.md` that every later stage can trust:
what is being built, why, in which repos, with which sub-items, and what is still
unknown.

**Produces.** `openflow/changes/{ticket}/context.md` (plus `questions.md` when
anything is ambiguous).

---

## ON ENTRY

1. Run `openflow next --json`. Note `intake`, `repos`, `rule_packs`, `artifacts`.
2. Load engine rules listed in the manifest, at minimum:
   - `../common/session-continuity.md` — resuming, not restarting
   - `../common/overconfidence-prevention.md` — ask instead of guessing
   - `../common/question-format-guide.md` — questions live in files
   - `../common/depth-levels.md` — pick analysis depth
3. Load the project rule packs for every role in the flow. They tell you what
   this team considers a complete requirement (their definition, not ours).
4. Present opt-in extensions from `openflow.yml` → `extensions` if any are
   declared and not yet chosen; record answers.

---

## MAIN WORK

### 1. Resolve the work item

Follow `../intake/work-item-sources.md`. The manifest's `intake.mode` decides:

| mode | What you do |
|---|---|
| `local` | The CLI already read the item; it is appended to `context.md`. Verify it. |
| `agent` | Fetch it yourself using the listed instructions (MCP, CLI, or ask the developer). |

Normalize into the shape in `../intake/work-item-schema.md`. Never assume a
field exists because one tracker has it.

### 2. Resolve sub-items per role

Follow `../intake/sub-items.md`. A flow declares roles (`frontend`, `backend`,
`context`, `test`, or whatever the project invented). For each role in the flow,
find the sub-item id, or confirm with the developer that the parent id is used
for that role. Record with:

```bash
openflow start {ticket} --sub frontend=PROD-5102 --sub backend=PROD-5103
```

### 3. Understand the codebase before planning

Read the actual code in each involved repo: existing patterns, the modules this
touches, the contracts between roles. Note what already exists so later stages
extend rather than reinvent. This is exploration only — no implementation.

### 4. Scope and impact

Record which of these the work item touches, per repo: UI, API contract, data
model, infrastructure, documentation only. Flag cross-role contracts explicitly
— those become the drift-sensitive seams later.

### 5. Branches

For each repo in the manifest, confirm the branch (pattern is in `openflow.yml`
→ `branching.pattern`) and that the tree is clean. Report per repo; do not create
branches silently unless the project rules say to.

### 6. Ambiguity

Anything that would change the result and is not answered by the work item, the
code, or the project rules is asked **in chat**. Wait for the answer, then record
it in `questions.md`. Do not finish this stage with open blocking questions.

---

## OUTPUT

`openflow/changes/{ticket}/context.md` must contain:

- Work item summary (normalized) and source link or origin
- Sub-item map per role, and repo per role
- Acceptance criteria as a checkable list
- Scope matrix (UI / API / data / infra / docs) per repo
- Cross-role contracts this change affects
- Known constraints from the project rule packs (e.g. "must use the design system")
- Assumptions, decisions, and open questions
- Branch status per repo

---

## GATE

Present: context path, sub-item map, scope, open questions, branch status.

Advance only when the developer confirms the scope and sub-items are right:

```bash
openflow approve
```
