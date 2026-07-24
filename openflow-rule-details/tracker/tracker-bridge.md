# Issue Tracker Bridge (Generic MCP)

**Purpose**: Fetch work items from the team's issue tracker through MCP (or equivalent tools), without hardcoding Jira, Linear, or GitHub. All tracker access goes through this bridge and returns an **OpenFlow Ticket** per `ticket-schema.md`.

**When to run**: Step 1 (Read Ticket), any command that needs fresh tracker state (`/openflow status`, recovery when ticket changed), and subtask collection.

**Never**: Import Jira-specific JQL in step rules, assume field names, or skip reading project config.

---

## Prerequisites

1. Load **`openflow.yml`** from the workspace root (or path in `OPENFLOW_CONFIG`).
2. Read `project.issue_tracker` (or equivalent): `jira` | `linear` | `github` | `none`.
3. If `none`: stop bridge; use ticket ID and content supplied by the user only; still shape data as `OpenFlowTicket` with manual fields.
4. Discover MCP namespaces dynamically (e.g. Atlassian, Linear plugin, GitHub) — do not assume a fixed server name; use tool discovery before calling.

---

## Configuration Keys (from `openflow.yml`)

```yaml
project:
  name: "Example"
  issue_tracker: jira          # jira | linear | github | none

tracker:
  jira:
    base_url: "https://company.atlassian.net"
    project_key: "PROD"
    # auth via env: JIRA_EMAIL, JIRA_API_TOKEN
  linear:
    team_id: "..."
    # auth via LINEAR_API_KEY
  github:
    owner: "org"
    repo: "product"              # default repo for issues
    # auth via gh CLI or GITHUB_TOKEN
```

Adapter selection is **only** from this file. If the user says "use Linear" but config says `jira`, follow config and tell the user to update `openflow.yml`.

---

## Bridge Pipeline (Always This Order)

```
resolve adapter → fetch ticket → fetch epic/parent → normalize → return OpenFlowTicket
```

### Step 1 — Resolve adapter

| `issue_tracker` | Adapter behavior |
|-----------------|------------------|
| `jira` | Use Atlassian MCP tools (issue get, JQL search, parent/epic) with `tracker.jira.*` |
| `linear` | Use Linear MCP tools (issue by id, relations) with `tracker.linear.*` |
| `github` | Use GitHub MCP / `gh issue view` with `tracker.github.*` |
| `none` | `ManualAdapter`: build ticket from user paste + `state.json` |

Record in `audit.md`:

```markdown
**Tracker bridge**: adapter=jira, ticket=PROD-5100
```

### Step 2 — Fetch ticket

- Input: parent ticket ID from user command, `openflow/state.json`, or Step 1 prompt.
- Call the provider's "get issue" capability with the normalized ID format for that provider.
- On **404 / permission denied**: severity **Critical** — see `common/error-handling.md`; ask user to fix ID, token, or project key.
- On **rate limit**: retry once after brief wait; then ask user to retry later.

### Step 3 — Fetch epic / parent

- If fetched item `type` is `subtask` or `story` with a parent: fetch parent for epic context.
- If fetched item is `epic`: keep as root; children loaded in subtask collection (not all epics list every child in one call).
- Attach `parent` on the **child** ticket when the workflow started from a subtask; attach epic summary to `context.md` when root is epic.

### Step 4 — Normalize

Map provider response to `OpenFlowTicket` using `ticket-schema.md` tables.

Rules:

- Strip HTML/ADF to readable markdown where possible.
- Extract URLs for Figma, Confluence, Miro from description and link fields → `design_links`.
- Parse acceptance criteria into `acceptance_criteria[]`; if only prose in description, copy bullets into criteria array.
- Set `_provider` to `jira` | `linear` | `github`; omit `_raw` from files committed to git (memory/session only).

### Step 5 — Return

Return the object to the caller (Step 1 rule). Caller writes snapshot to `context.md` and updates `state.json`.

---

## Generic MCP Invocation Pattern

1. **Discover** tools: list MCP namespaces matching `jira|atlassian|linear|github`.
2. **Authenticate** if namespace status is `needsAuth` (once per session).
3. **Prefer** structured "get issue" tools over scraping the web UI.
4. **Search** when ID unknown: JQL (`project = PROD AND key = ...`), Linear filter, `gh issue list`.
5. **Log** each external call in `openflow/changes/{ticket}/audit.md` (tool name, issue id, success/fail).

Example decision tree:

```
issue_tracker from openflow.yml
  ├─ jira     → Atlassian: get issue + optional JQL for children
  ├─ linear   → Linear: get issue + list children/parent
  ├─ github   → GitHub: issue view + linked issues if available
  └─ none     → Ask user to paste title, description, AC into questions.md
```

---

## Multi-Ticket Fetches (Subtasks)

The bridge exposes single-ticket fetch; **role sub-ticket resolution** (frontend, backend, context, test) is implemented in `subtask-collection.md`, which may call the bridge repeatedly with four IDs.

---

## Error Handling

| Situation | Action |
|-----------|--------|
| Wrong provider configured | Explain mismatch; offer to update `openflow.yml` |
| MCP unavailable | Fall back to manual paste; gate Step 1 until ticket text confirmed |
| Partial data | Fill required fields with defaults; flag gaps in `questions.md` |
| Ticket updated mid-flow | Re-fetch on user request; merge into `context.md` via recovery (`openspec-update-change`) |

---

## Security

- Never commit API tokens.
- Do not log full issue JSON containing PII into public artifacts; summarize in `context.md`.
- Respect tracker permissions; if issue is restricted, ask user to paste sanitized summary.
