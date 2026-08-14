---
name: openflow-rules
description: Inspect or author the project's own engineering rules that OpenFlow stages must follow per role. Use for /openflow-rules, "which rules is the flow using", "make the flow follow our frontend conventions", or "add backend rules".
allowed-tools: Bash(openflow:*)
license: MIT
compatibility: Requires the openflow CLI and an openflow.yml.
metadata:
  author: openflow
  version: "2.0"
---

OpenFlow maintains the *flow*. Each team supplies the *craft*. This skill wires the
two together.

## 1. Show what is resolved today

```bash
openflow rules            # all roles
openflow rules --role frontend
```

Each entry shows its origin: `config` (declared in `openflow.yml`) or `convention`
(discovered by filename).

## 2. If a role has no rules

Offer the two options plainly.

**Convention (nothing to configure).** Create one of:

```
.openflow/rules/<role>.md
.openflow/rules/<role>/*.md
<repo>/<role>.md
<repo>/AGENTS.md
<repo>/CLAUDE.md
```

**Explicit (any path, any name).** In `openflow.yml`:

```yaml
rules:
  packs:
    frontend:
      - .openflow/rules/frontend.md
      - ../web/docs/conventions/
      - skill:my-design-system
    backend:
      - ../api/AGENTS.md
```

Directories are expanded to their markdown files. `skill:<name>` means "run that
agent skill during the stage" — that is how a team plugs its own skill into a
generic flow.

## 3. Authoring a rule pack

Write what an agent needs in order to produce code a reviewer would accept:

- Stack and versions; what is forbidden
- Folder and file layout, naming
- Patterns to follow, with a short real example from the repo
- State/data-fetching approach, error handling, logging
- Styling or API-shape conventions
- Testing: framework, where tests live, what must be covered
- Commands: install, run, lint, test, build
- Review expectations and common rejections

Keep it prescriptive and short enough to be read every stage. Do not restate
process (gates, artifacts) — OpenFlow owns that.

## 4. Verify

```bash
openflow rules --role <role>
openflow next            # confirms the pack loads for the current stage
```

Report anything listed as "configured but missing on disk" — that is a typo, not a
silent fallback.
