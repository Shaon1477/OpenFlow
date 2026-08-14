# Terminology

Shared vocabulary. Use these words consistently in artifacts and at gates.

| Term | Meaning |
|---|---|
| **Work item** | The unit of delivery from the tracker (or a file, or the developer's request). Has an id. |
| **Sub-item** | The per-role id under a work item. Artifacts file under it. May equal the work item id. |
| **Flow** | The ordered set of stages for a delivery. YAML in `built-in-flows/` or `.openflow/flows/`. |
| **Stage** | One step of a flow. Has a key, a kind, and usually a role. |
| **Stage kind** | The protocol a stage follows: `analyze`, `plan`, `implement`, `test-cases`, `integrate`, `test-automation`, `handoff`, `sync-context`, `custom`. |
| **Role** | A named participant with a repo: `frontend`, `backend`, `context`, `test`, or anything the project invents. |
| **Rule pack** | The project's own engineering rules for a role. Supplied by the team, not by OpenFlow. |
| **Engine rules** | OpenFlow's process and discipline files under `openflow-rule-details/`. |
| **Artifacts** | Files a stage owns: `context.md`, `proposal.md`, `specs/`, `design.md`, `tasks.md`, handoff, living docs. |
| **Gate** | The stop where a human approves before the flow advances. |
| **Fingerprint** | Content hash of a stage's artifacts, recorded at approval. |
| **Drift** | Artifacts changed after approval. |
| **Stale** | A completed stage invalidated because something upstream drifted. |
| **Adopt** | Register artifacts written outside OpenFlow as a completed stage. |
| **Definition of Done** | The executable checks that must pass before archiving. |
| **Living documentation** | The permanent docs in the context repo, updated by `sync-context`. |
| **Depth** | How much analysis and documentation a work item warrants: minimal, standard, comprehensive. |

## Distinctions worth keeping straight

- **Plan vs implement** — planning produces documents; implementing produces code.
  A stage never does both.
- **Specs vs tasks** — specs describe behaviour and are durable; tasks describe work
  and are transient.
- **Handoff vs living documentation** — the handoff describes *this delivery*; living
  documentation describes *the system as it now is*.
- **Blocked vs stale** — blocked means waiting on a human or another team; stale
  means something changed underneath approved work.
- **Engine rules vs rule packs** — engine rules govern process, rule packs govern
  craft. When they conflict, process comes from the engine, craft from the pack.
