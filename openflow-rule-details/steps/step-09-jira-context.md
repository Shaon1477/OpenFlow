# Step 9 — Write Jira Context Doc

## Purpose

Consolidate delivery context for the parent tracker ticket into a single human-readable document in the **context repo**, suitable for pasting or syncing to Jira (or other tracker): what was built, how to verify, links to changes, and decisions across Steps 2, 4, 5, and 8.

**Step index:** `9`  
**Output is tracker-facing documentation, not application code.**

---

## Prerequisites

- Step 8 human gate passed.
- All four sub-ticket changes exist in their repos (or documented archive state).
- Template available: `../../templates/jira-context.md` (if present).

**CONTEXT LOADED (mandatory):**

- Step 2: frontend OpenSpec change (proposal, specs summary, design highlights)
- Step 4: `test-cases.md`
- Step 5: backend OpenSpec change
- Step 8: test automation change summary and env pass status

---

## ON ENTRY — Rules and skills to load

| Order | Resource | Path |
|------:|----------|------|
| 1 | Session continuity | `../common/session-continuity.md` |
| 2 | Error handling | `../common/error-handling.md` |
| 3 | Content validation | `../common/content-validation.md` |
| 4 | Terminology | `../common/terminology.md` |

**OpenSpec skills:**

| Skill | Path | When |
|-------|------|------|
| `openspec-propose` | `../../openspec-skills/openspec-propose/SKILL.md` | MAIN WORK (early) — scaffold Jira context change in context repo |
| `openspec-apply-change` | `../../openspec-skills/openspec-apply-change/SKILL.md` | MAIN WORK — write/fill the context document per `tasks.md` |

**ON ENTRY actions:**

1. Confirm `currentStep` is `9`.
2. Gather artifact paths from `openflow/state.json` and audit history.
3. Identify parent ticket id for filename: `{parentTicket}-context.md`.

---

## MAIN WORK

1. **Propose context change** — In `{context_repo}`, run `openspec-propose` to create a change dedicated to Jira context (separate from Step 4 test-cases change unless flow merges them — prefer distinct change id e.g. `{parentTicket}-jira-context` or use context sub-ticket with new change folder per team convention).
2. **Structure document** — Use `jira-context.md` template sections typically including:
   - Summary and business outcome
   - Scope delivered / not delivered
   - Sub-ticket map and repo links
   - How to test (manual + automated, env URLs)
   - API/UI notes for support
   - Rollout / feature flags / migrations
   - Known limitations and follow-ups
3. **Apply change** — `openspec-apply-change` executes `tasks.md` to produce final markdown.
4. **Publish path** — Write canonical file:
   - `{context_repo}/jira-context/{parentTicket}-context.md`  
   (Also keep OpenSpec change artifacts under `openspec/changes/` if skill workflow requires.)
5. **Optional tracker sync** — Load `../tracker/tracker-bridge.md` to post comment or update description field if MCP supports it; log action in audit.
6. **Validate & gate** — Content validation; `humanGate.step9: pending`.

---

## OUTPUT — Artifacts and paths

| Artifact | Path |
|----------|------|
| Jira context (canonical) | `{context_repo}/jira-context/{parentTicket}-context.md` |
| OpenSpec change (working) | `{context_repo}/openspec/changes/{changeId}/` |
| Audit | `openflow/changes/{parentTicket}/audit.md` |
| State | `openflow/state.json` → `artifacts.jiraContext` |

---

## HUMAN GATE

Advance to Step 10 only when **all** are true:

1. User reviewed `{parentTicket}-context.md` for accuracy and completeness.
2. Verification steps match Step 4 cases and Step 8 automation reality.
3. Links to PRs/branches/commits are correct (or explicitly “pending merge”).
4. Support/PM-readable language; no internal-only jargon without glossary.

On approval: `humanGate.step9: approved`, `currentStep: 10`.

---

## OpenSpec skills — fire order

| Order | Skill | Phase |
|------:|-------|--------|
| 1 | `openspec-propose` | MAIN WORK — create planning change |
| 2 | `openspec-apply-change` | MAIN WORK — author document |

No `verify-change` in PLAN for Step 9; human review is the gate.

---

## Audit log entry template

```markdown
## Step 9 — Jira Context Doc
**Timestamp**: {ISO-8601-UTC}
**Action**: Published Jira context document
**OpenSpec**: openspec-propose + openspec-apply-change
**Artifact**: {context_repo}/jira-context/{parentTicket}-context.md
**Tracker sync**: {posted comment|skipped|manual}
**Human gate**: {pending|approved at {timestamp}}
**Decision**: {e.g. rollout note for prod}
```

---

## Recovery pointers

| Situation | Rule | OpenSpec |
|-----------|------|----------|
| Doc out of date after late fix | `../common/workflow-changes.md` | `openspec-update-change` + re-apply |
