# Intake examples

`intake.provider` decides where a work item comes from. The CLI reads `file`
itself; everything else is executed by your agent with whatever MCP or CLI you
already have. Protocol: `openflow-rule-details/intake/`.

---

## Jira

```yaml
intake:
  provider: jira
  site: https://acme.atlassian.net
  project_key: PROD
  instructions: "Fetch the issue, its epic, and its subtasks; acceptance criteria are in the AC custom field"
```

Field mapping the agent applies: `key` → id, `fields.summary` → title,
`fields.description` (ADF → markdown) → description, `fields.issuetype.name` → type,
`fields.parent.key` → parent, `fields.subtasks[]` → children.

## GitHub Issues

```yaml
intake:
  provider: github
  owner: acme
  repo: product
  instructions: "gh issue view <n> --json title,body,labels,url; follow task-list links for sub-items"
```

Sub-items are usually task-list checkboxes referencing other issues; map them to
roles by label (`area:frontend`, `area:api`).

## Linear

```yaml
intake:
  provider: linear
  team_id: TEAM_123
  instructions: "Fetch issue by identifier, plus its project and sub-issues"
```

## Any MCP server

```yaml
intake:
  provider: mcp
  server: acme-worktracker
  instructions: "Call workitem.get with { id }, then workitem.children"
```

## A file in the repo (no tooling at all)

```yaml
intake:
  provider: file
  path: tickets/{ticket}.md
```

`openflow start PROD-5100` reads `tickets/PROD-5100.md` and appends it to
`context.md` verbatim. Useful for offline work, or when planning docs arrive by
email.

## No system

```yaml
intake:
  provider: manual   # ask the developer
  # or
  provider: none     # the developer's prompt is the work item
```

Both are supported deliberately: missing tracker access is a reason to ask, never a
reason to invent requirements.

---

## Notes

- Auth lives in the MCP server or the environment. Never in `openflow.yml`.
- If the configured provider is unreachable, degrade to asking the developer and say
  so at the gate.
- Extra keys under `intake` are preserved and passed through to the agent, so any
  provider-specific configuration is fair game.
