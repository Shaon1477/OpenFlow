# Work item sources

OpenFlow has no built-in tracker. A "work item" is whatever the project says it
is, and it is read through whatever the project already has.

`openflow.yml`:

```yaml
intake:
  provider: jira | linear | github | mcp | file | manual | none
  path: tickets/{ticket}.md      # provider: file
  server: my-tracker             # provider: mcp
  instructions: "Call workitem.get with the id"
```

`openflow next --json` returns `intake.mode`:

| mode | Meaning |
|---|---|
| `local` | The CLI read the item itself (`file` provider). It is already in `context.md`. |
| `agent` | You fetch it, following `intake.instructions`. |

---

## Provider behaviour

| Provider | How to read the item |
|---|---|
| `jira` | Discover an Atlassian/Jira MCP server, or a `jira`/`acli` CLI. Fetch the issue, then its parent/epic and subtasks. |
| `linear` | Discover a Linear MCP server or CLI. Fetch the issue, its project/parent and sub-issues. |
| `github` | GitHub MCP server, or `gh issue view <id> --json title,body,labels,url`. Follow task lists and referenced issues. |
| `mcp` | Discover the server named in `intake.server` and call the tool named in `intake.instructions`. |
| `file` | Handled by the CLI. If the file is missing, create it from what the developer tells you. |
| `manual` | Ask the developer for title, description and acceptance criteria; write them into `context.md`. |
| `none` | The developer's prompt **is** the work item. Record it verbatim in `context.md` before planning. |

Rules that hold for all of them:

1. **Config wins.** If the developer says "use Linear" but `intake.provider` is
   `jira`, follow the config and tell them to change it.
2. **Discover, do not assume.** Never hardcode a server or tool name; list what is
   available, then call it. If nothing is available, degrade to `manual` and say so.
3. **Authenticate once.** If a server needs auth, authenticate, then retry the
   original call.
4. **Degrade loudly.** A missing tracker is not a reason to invent requirements —
   it is a reason to ask the developer.

---

## Do not re-fetch what you already have

If `context.md` already holds a normalized item and the developer has not asked
for a refresh, use it. Re-fetching mid-flow silently changes the basis of approved
work; if the item genuinely changed, re-fetch and then run `openflow drift` so
dependent stages are re-checked.

---

## Security

- Never commit tokens; read them from the environment or the MCP server's own auth.
- Do not copy raw personal data into artifacts. Summarize.
- If an item is access-restricted, ask the developer for a sanitized summary rather
  than working around the restriction.
