# Flow loader

**Purpose.** Resolve which flow is active and what its stages are. The CLI does
this; this file explains the contract so an agent can reason about it.

---

## Resolution order

```
--flow <id>                       (per work item, wins)
  → openflow.yml → project.flow   (project default)

for a given id:
  .openflow/flows/<id>.yml        (project flow, wins)
  openflow/flows/<id>.yml
  built-in-flows/<id>.yml         (shipped)
```

```bash
openflow flows          # ids and where each resolves from
```

A project flow with the same id as a built-in **replaces** it. That is the intended
way to change a flow: copy a built-in, edit it, keep the id.

---

## Flow shape

```yaml
id: delivery-flow
name: Full Delivery
roles: [frontend, backend, context, test]

steps:
  - key: backend-plan            # stable id used by state, gates, CLI
    name: Backend implementation doc
    kind: plan                   # stage protocol (see ../stages/README.md)
    role: backend                # drives rule packs and sub-item lookup
    repos: [backend]             # the only repos this stage may write to
    depends_on: [analyze, frontend-plan]
    human_gate: true
    verify: false
    optional: false
    rules:                       # engine rule files, relative to rule-details root
      - construction/functional-design.md
    rule_packs: [backend]        # defaults to [role]
    artifacts:                   # defaults from kind + role
      - "{repo}/{artifacts_dir}/{sub_ticket}"
    skills: [openflow-run]
```

### Validation

- `key` is unique and slug-like; `depends_on` must reference existing keys.
- `kind` must be a known stage kind, or `custom` with a `detail_file`.
- Any number of stages, in any order, repeating kinds and roles freely.
- Unknown extra fields are preserved, so projects can annotate their flows.

### Path tokens

| Token | Expands to |
|---|---|
| `{ticket}` | The work item id |
| `{sub_ticket}` | The sub-item id for this stage's role (falls back to the work item id) |
| `{role}` | The stage's role |
| `{repo}` | The path of the stage's own role repo |
| `{repo:<role>}` | The path of any configured role's repo |
| `{artifacts_dir}` | `openflow.yml` → `artifacts.dir` |
| `{slug}` | Slugified work item title (branch patterns) |

---

## What the loader guarantees

1. **Only the current stage is offered.** Ordering comes from the steps array;
   `optional: true` stages are stepped over when advancing.
2. **Repo bindings are resolved** from `openflow.yml` → `repos`. A stage cannot
   write outside its declared roles.
3. **Rule packs are resolved per role** — configured paths first, then filename
   conventions. See `../../src/lib/rules.ts` behaviour documented in
   `../stages/README.md`.
4. **Extension rules are filtered** by what the work item opted into, so disabled
   extensions are never loaded.
5. **Artifacts are known before work starts**, which is what makes fingerprinting
   and drift detection possible.

---

## Writing a project flow

```bash
mkdir -p .openflow/flows
cp "$(npm root -g)/openflow/built-in-flows/delivery-flow.yml" .openflow/flows/delivery-flow.yml
# edit: rename roles, drop stages, add stages, change gates
openflow flows
```

Compose your own pipeline by reusing stage kinds — for example
`analyze → plan(data) → implement(data) → test-automation → sync-context` for a
data-engineering team, with `roles: [data, context, test]`.
