# OpenFlow Canonical Ticket Schema

**Purpose**: Define the normalized ticket object every tracker adapter must produce. Downstream steps (`context.md`, subtask collection, audit) MUST use this shape — never raw Jira/Linear/GitHub field names in workflow artifacts.

**Related**: `tracker-bridge.md` (how tickets are fetched), `subtask-collection.md` (role sub-tickets), `openflow/state.json` (persists IDs and URLs).

---

## TypeScript-Style Reference (Normative Fields)

```typescript
interface OpenFlowTicket {
  /** Provider-native key, e.g. PROD-5100, LIN-42, org/repo#123 */
  id: string;

  /** Human-readable title / summary */
  title: string;

  /** Plain-text or markdown body; links preserved */
  description: string;

  /** Normalized work item category */
  type: "epic" | "story" | "task" | "bug" | "subtask" | "unknown";

  /** Normalized lifecycle state */
  status: "open" | "in_progress" | "blocked" | "done" | "cancelled" | "unknown";

  /** Parent epic/story if applicable */
  parent?: OpenFlowTicketRef;

  /** Direct children (stories under epic, subtasks under story) */
  subtasks: OpenFlowTicketRef[];

  /** Free-form tags (components, teams, custom fields flattened) */
  labels: string[];

  /** Deep links for humans */
  urls: {
    browse: string;       // primary ticket URL
    api?: string;         // optional REST URL for debugging
  };

  /** Structured acceptance criteria when available */
  acceptance_criteria: AcceptanceCriterion[];

  /** Figma, Confluence, design doc links extracted from description or custom fields */
  design_links: DesignLink[];

  /** Raw provider payload — for debugging only; do not cite in user-facing docs */
  _provider?: string;
  _raw?: Record<string, unknown>;
}

interface OpenFlowTicketRef {
  id: string;
  title: string;
  type?: OpenFlowTicket["type"];
  status?: OpenFlowTicket["status"];
  urls?: { browse: string };
}

interface AcceptanceCriterion {
  id?: string;
  text: string;
  done?: boolean;
}

interface DesignLink {
  label: string;
  url: string;
  kind?: "figma" | "confluence" | "other";
}
```

---

## Required vs Optional

| Field | Required | Notes |
|-------|----------|-------|
| `id` | Yes | Must match `openflow.yml` / user input parent ticket |
| `title` | Yes | |
| `description` | Yes | Empty string if provider has no body |
| `type` | Yes | Use `unknown` only when mapping fails |
| `status` | Yes | Map provider states via table below |
| `subtasks` | Yes | Empty array if none |
| `labels` | Yes | Empty array if none |
| `urls.browse` | Yes | Construct from `openflow.yml` base URL if needed |
| `acceptance_criteria` | Yes | Empty array if not structured in tracker |
| `design_links` | Yes | Parse from description + custom fields |
| `parent` | No | Set when fetching a subtask or child story |

---

## Status Normalization

Map provider-specific statuses into OpenFlow enums. When ambiguous, prefer `in_progress` over `open` if work has started; log the original status in `audit.md`.

| OpenFlow `status` | Typical Jira | Typical Linear | Typical GitHub Issues |
|-------------------|--------------|----------------|------------------------|
| `open` | To Do, Backlog, Open | Todo, Backlog | open (no assignee) |
| `in_progress` | In Progress, In Review | In Progress, In Review | open (assigned) |
| `blocked` | Blocked | Blocked | blocked label / custom |
| `done` | Done, Closed, Resolved | Done, Completed, Canceled (won't do) | closed |
| `cancelled` | Won't Do, Cancelled | Canceled | closed (not planned) |
| `unknown` | Custom workflow only | Custom | — |

---

## Type Normalization

| OpenFlow `type` | Jira | Linear | GitHub Issues |
|-----------------|------|--------|---------------|
| `epic` | Epic | Project milestone / parent issue with children | — (use label `epic`) |
| `story` | Story, User Story | Issue (default) | Issue |
| `task` | Task | Issue (subtype Task) | Issue + label |
| `bug` | Bug | Issue (Bug) | Issue + label `bug` |
| `subtask` | Sub-task | Sub-issue | — (use linked PR/issue refs) |
| `unknown` | Custom issue types | Custom | — |

---

## Field Mapping Notes

### Jira

| OpenFlow field | Jira source |
|----------------|-------------|
| `id` | `key` (e.g. `PROD-5100`) |
| `title` | `fields.summary` |
| `description` | `fields.description` (ADF → markdown or plain text) |
| `type` | `fields.issuetype.name` |
| `status` | `fields.status.name` |
| `parent` | `fields.parent` or Epic Link custom field |
| `subtasks` | `fields.subtasks[]` or JQL `parent = KEY` |
| `labels` | `fields.labels` + `fields.components[].name` |
| `urls.browse` | `{base_url}/browse/{key}` from `openflow.yml` |
| `acceptance_criteria` | Custom field (e.g. Acceptance Criteria) or checklist in description |
| `design_links` | Remote links, description URLs, custom Figma field |

### Linear

| OpenFlow field | Linear source |
|----------------|---------------|
| `id` | `identifier` (e.g. `ENG-123`) |
| `title` | `title` |
| `description` | `description` (markdown) |
| `type` | `type` / parent-child relationship |
| `status` | `state.name` |
| `parent` | `parent` relation |
| `subtasks` | child issues via relation |
| `labels` | `labels[].name` |
| `urls.browse` | `url` from API |
| `acceptance_criteria` | Description sections or project templates |
| `design_links` | Links in description, Figma attachments |

### GitHub Issues

| OpenFlow field | GitHub source |
|----------------|---------------|
| `id` | `{owner}/{repo}#{number}` or `#123` with repo from config |
| `title` | `title` |
| `description` | `body` |
| `type` | Labels (`bug`, `enhancement`) + task lists in body |
| `status` | `state` + `state_reason` |
| `parent` | Issue forms / sub-issue links / tracked in body |
| `subtasks` | Task list checkboxes, linked issues, sub-issues (when API supports) |
| `labels` | `labels[].name` |
| `urls.browse` | `html_url` |
| `acceptance_criteria` | Task lists, "Acceptance criteria" heading in body |
| `design_links` | URLs in body matching figma.com, etc. |

---

## Persistence in OpenFlow State

After normalization, write a summary (not full `_raw`) to `openflow/state.json`:

```json
{
  "ticket": {
    "id": "PROD-5100",
    "title": "...",
    "status": "in_progress",
    "urls": { "browse": "https://..." }
  },
  "sub_tickets": {
    "frontend": "PROD-5102",
    "backend": "PROD-5103",
    "context": "PROD-5101",
    "test": "PROD-5104"
  }
}
```

Full ticket JSON may be embedded in `openflow/changes/{ticket}/context.md` under a `## Tracker Snapshot` section for offline resume.

---

## Validation Checklist (Before Leaving Step 1)

1. `id` and `title` are non-empty.
2. `urls.browse` resolves (user can click).
3. If parent ticket is an epic, `subtasks` or configured role children are discoverable OR gaps are documented in `questions.md`.
4. `acceptance_criteria` either populated or explicitly marked "not in tracker — captured in context.md".
5. Never write API tokens or `_raw` secrets into committed files.
