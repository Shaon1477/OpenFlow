# Linear adapter notes

OpenFlow reads `tracker.provider: linear` from `openflow.yml` and normalizes via `openflow-rule-details/tracker/ticket-schema.md`.

## Config

```yaml
tracker:
  provider: linear
  linear:
    team_key: ENG
    # Auth via Linear MCP / LINEAR_API_KEY — never commit tokens
```

## Field mapping

| OpenFlow | Linear |
|---|---|
| `id` | `identifier` (e.g. ENG-123) |
| `title` | `title` |
| `description` | `description` |
| `type` | infer from labels / project (story/bug/task) |
| `status` | `state.name` |
| `parent` | `parent.id` / project |
| `subtasks` | `children` issues |
| `labels` | `labels[].name` |
| `acceptance_criteria` | checklist in description |
| `design_links` | URLs in description / attachments |

## MCP

Use Linear MCP or GraphQL API. Same bridge pipeline as Jira: fetch → parent → children → normalize.
