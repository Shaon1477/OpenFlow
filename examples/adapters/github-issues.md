# GitHub Issues adapter notes

OpenFlow reads `tracker.provider: github` from `openflow.yml` and normalizes via `openflow-rule-details/tracker/ticket-schema.md`.

## Config

```yaml
tracker:
  provider: github
  github:
    owner: acme
    repo: product
    # Auth via gh CLI / GITHUB_TOKEN — never commit tokens
```

## Field mapping

| OpenFlow | GitHub Issues |
|---|---|
| `id` | `#{number}` or `OWNER/REPO#N` |
| `title` | `title` |
| `description` | `body` |
| `type` | labels (`bug`, `enhancement`) or issue types |
| `status` | `open` / `closed` (+ project status if used) |
| `parent` | tracked-by / parent issue / epic label |
| `subtasks` | tasklist items / sub-issues |
| `labels` | `labels[].name` |
| `acceptance_criteria` | checklist in body |
| `design_links` | URLs in body |

## MCP / CLI

Prefer GitHub MCP or `gh issue view N --json …`. Normalize into the shared OpenFlow ticket schema before writing `context.md`.
