# Process overview

OpenFlow turns a work item into shipped code **and** current documentation, one
gated stage at a time.

```
work item
    │
    ▼
┌──────────┐   context.md: scope, sub-items, questions
│ analyze  │
└────┬─────┘
     │  gate
     ▼
┌──────────┐   per role: proposal, specs, design, tasks
│  plan    │◄──────────────┐
└────┬─────┘               │ revisit when a contract
     │  gate               │ or requirement changes
     ▼                     │
┌──────────┐   code on a feature branch, tasks ticked
│implement │───────────────┘
└────┬─────┘
     │  gate
     ▼
┌──────────┐   contract diff, wiring, smoke tests
│integrate │
└────┬─────┘
     │  gate
     ▼
┌──────────┐   test cases → automation → run matrix
│  test    │
└────┬─────┘
     │  gate
     ▼
┌──────────┐   handoff document for reviewers
│ handoff  │
└────┬─────┘
     │  gate
     ▼
┌──────────┐   living docs updated, Definition of Done, archive
│  sync    │
└──────────┘
```

Flows compose these kinds in any order, for any roles. A UI-only flow drops the
service stages; a mobile flow renames the client role. The engine does not care.

## What is fixed, and what is yours

| Fixed by OpenFlow | Chosen by the project |
|---|---|
| Stage protocols and their order within a flow | Which stages, which roles, which flow |
| Gates: nothing advances without a human | Whether a stage is optional |
| Artifact kinds and where they live | Every engineering convention inside them |
| Drift detection and staleness | Where work items come from |
| Definition of Done as a gate on archiving | Which checks the Definition of Done contains |

## Three properties worth knowing

1. **You cannot skip forward.** `openflow next` only ever offers the current stage.
2. **Changes propagate.** Editing an approved artifact marks every dependent stage
   stale until it is re-checked.
3. **Closeout is enforced.** `openflow archive` refuses a work item whose Definition
   of Done fails, so a delivery cannot end with stale context documentation.
