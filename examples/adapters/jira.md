# Jira adapter notes

OpenFlow reads `tracker.provider: jira` from `openflow.yml` and normalizes via `openflow-rule-details/tracker/ticket-schema.md`.

## Config

```yaml
tracker:
  provider: jira
  jira:
    base_url: https://company.atlassian.net
    project_key: PROD
    # Auth via Atlassian MCP / env — never commit tokens
```

## Field mapping

| OpenFlow | Jira |
|---|---|
| `id` | `key` (e.g. PROD-5100) |
| `title` | `fields.summary` |
| `description` | `fields.description` (ADF → markdown) |
| `type` | `fields.issuetype.name` |
| `status` | `fields.status.name` |
| `parent` | `fields.parent.key` or Epic link |
| `subtasks` | `fields.subtasks[]` + linked issues |
| `labels` | `fields.labels` |
| `acceptance_criteria` | custom field or description section |
| `design_links` | Figma URLs in description / remotelinks |

## MCP

Prefer the project's Atlassian/Jira MCP. Bridge steps: fetch issue → fetch parent/epic → list subtasks → normalize → write `context.md`.
