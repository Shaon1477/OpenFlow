# OpenFlow — Master Workflow Rules

> **PRIORITY:** This workflow OVERRIDES ad-hoc coding when the user starts or continues an OpenFlow delivery.  
> **Principle:** OpenFlow owns the workflow. aidlc supplies engineering discipline. OpenSpec supplies spec artifacts. The AI tool executes.

---

## Identity

OpenFlow is a **flow-agnostic, multi-repo SDLC orchestration engine**.

- It does **not** replace Jira, Linear, GitHub Issues, or the coding assistant.
- It **does** decide the next valid step, enforce human gates, load the right rules/skills, and keep `openflow/state.json` + `audit.md` coherent.
- Every flow **always** has a `context` repo (docs, test cases, functional context). Its path is configurable; its presence is not optional.

---

## Rule Details Resolution

When loading any detail file, resolve the rule-details root in this order (use the first that exists):

1. `openflow-rule-details/` (this package / workspace)
2. `.openflow/openflow-rule-details/`
3. Paths configured in `openflow.yml` under `rules.details_root` (if present)

All relative references below (e.g. `common/session-continuity.md`) are relative to that root.

**Always load at session start:**

| File | Why |
|---|---|
| `common/process-overview.md` | Lifecycle overview |
| `common/session-continuity.md` | Resume protocol |
| `common/content-validation.md` | Validate before any write |
| `common/question-format-guide.md` | Questions go in `.md` files, never only in chat |
| `common/overconfidence-prevention.md` | Ask when ambiguous |
| `common/error-handling.md` | Severity + recovery |
| `flow-engine/flow-loader.md` | Load active flow |
| `flow-engine/step-executor.md` | Execute current step |
| `flow-engine/human-gate.md` | Approval protocol |
| `flow-engine/recovery.md` | Modify / retry / resume |

---

## Config & State Contract

| Artifact | Path | Role |
|---|---|---|
| Project config | `openflow.yml` | Flow id, tracker, repo paths, extensions |
| Workflow state | `openflow/state.json` | Active ticket, current step, sub-tickets, blockers |
| Ticket context | `openflow/changes/{ticket}/context.md` | Normalized ticket + scope |
| Audit trail | `openflow/changes/{ticket}/audit.md` | ISO-timestamped actions |
| Flow definition | `built-in-flows/{flow}.yml` or project override | Step order, gates, skills, rules |

**Before every action:** read `openflow.yml` + `openflow/state.json`.  
**After every significant action:** append to `audit.md` and update `state.json`.

**Context repo constant:** `openspec-sync-specs` (Step 10) always writes living specs into the configured `context` repo.

---

## Extensions (Opt-in)

At Step 1, present opt-in prompts only (`*.opt-in.md`). Do **not** load full extension rule files until opted in.

| Extension | Opt-in | Full rules | Applied at |
|---|---|---|---|
| Security baseline | `extensions/security/baseline/security-baseline.opt-in.md` | `security-baseline.md` | Steps 3, 6, 8 |
| Property-based testing | `extensions/testing/property-based/property-based-testing.opt-in.md` | `property-based-testing.md` | Step 8 |
| Resiliency baseline | `extensions/resiliency/baseline/resiliency-baseline.opt-in.md` | `resiliency-baseline.md` | Steps 6, 7 |

Record choices in `openflow/state.json` under the ticket's `extensions` map. Disabled extensions are never loaded. Enabled extension violations are **blocking**.

---

## Slash Commands

| Command | Behavior |
|---|---|
| `/openflow init` | Project setup (or run CLI `openflow init`) |
| `/openflow start {ticket}` | Begin or resume delivery for ticket |
| `/openflow status` | Show current step, gates, blockers, progress |
| `/openflow approve` | Pass current human gate; advance to next step |
| `/openflow block "reason"` | Record blocker; pause |
| `/openflow modify-step {role\|N} -ticket {id}` | Restart/revise step (confirm destructive) — see `flow-engine/recovery.md` |
| `/openflow retry-step {N}` | Retry/resume step from checkpoint |
| `/openflow archive {ticket}` | Archive OpenSpec changes + mark ticket Done |
| `/openflow onboard` | Guided first-cycle walkthrough (`openspec-onboard`) |

CLI equivalents: `openflow init|start|approve|status|archive`.

---

## Session Bootstrap (Every Conversation)

1. Resolve rule-details root.
2. Load common + flow-engine files listed above.
3. Run `inception/workspace-detection.md`:
   - If `openflow/state.json` exists → resume (`common/session-continuity.md`).
   - Else → first-run welcome (`common/welcome-message.md`).
4. Load flow via `flow-engine/flow-loader.md`.
5. Execute **only** the current step via `flow-engine/step-executor.md` + matching `steps/step-NN-*.md`.
6. Stop at human gate unless the step is not gated.

**Never** jump ahead, skip gates, or implement code before the step's plan/doc gate is approved.

---

## Ten-Step Delegation Map

Authoritative detail lives in `steps/`. Summary:

| Step | Detail file | OpenSpec skills | Key aidlc rules |
|---|---|---|---|
| 1 Read Ticket | `steps/step-01-read-ticket.md` | `openspec-explore` | workspace-detection, session-continuity, welcome, tracker-*, requirements-analysis, overconfidence, workflow-planning, question-format, extension opt-ins |
| 2 Frontend Doc | `steps/step-02-frontend-doc.md` | propose / new-change / ff-change | depth-levels, functional-design |
| 3 Frontend Impl | `steps/step-03-frontend-impl.md` | apply-change, verify-change | code-generation; security if opted in |
| 4 Test Cases | `steps/step-04-test-cases.md` | propose | requirements-analysis, overconfidence |
| 5 Backend Doc | `steps/step-05-backend-doc.md` | propose / new-change / ff-change | depth-levels, functional-design, nfr-*, infrastructure-design |
| 6 Backend Impl | `steps/step-06-backend-impl.md` | apply-change, verify-change | code-generation; security/resiliency if opted in |
| 7 Integration | `steps/step-07-integration.md` | apply-change, verify-change | resiliency if opted in; build-and-test |
| 8 Test Scripts | `steps/step-08-test-scripts.md` | propose, apply-change | build-and-test; property-based if opted in |
| 9 Jira Context | `steps/step-09-jira-context.md` | propose, apply-change | — |
| 10 Functional Context | `steps/step-10-functional-context.md` | sync-specs, update-change, archive-change, bulk-archive-change | — |

Skill index: `openspec-skills/README.md`. Skill bodies: sibling `OpenSpec/skills/*/SKILL.md` (or installed OpenSpec skills).

---

## Step Execution Protocol

Follow `flow-engine/step-executor.md` strictly:

```
ON ENTRY → MAIN WORK → OUTPUT → audit.md → HUMAN GATE
```

1. **ON ENTRY** — load listed rules; depth/plan/extensions as required.
2. **MAIN WORK** — run OpenSpec skill(s); write artifacts to the correct repo.
3. **OUTPUT** — validate with `content-validation.md` before writing.
4. **Audit** — append ISO timestamped entry to `openflow/changes/{ticket}/audit.md`.
5. **HUMAN GATE** — present artifacts; wait for `/openflow approve` (see `human-gate.md`).

Impl steps (3, 6, 7) require `code-generation.md` Part 1 (numbered plan + approval) before Part 2 (execute).

Before `/openflow approve` on impl/test steps, run `openspec-verify-change` (Completeness / Correctness / Coherence).

---

## Tracker Integration

1. Read `tracker.provider` from `openflow.yml`.
2. Follow `tracker/tracker-bridge.md` → normalize via `tracker/ticket-schema.md`.
3. Resolve four role sub-tickets via `tracker/subtask-collection.md` (frontend, backend, context, test) — confirm with human at Step 1 gate.
4. Never hardcode a single tracker; adapters are provider-specific, schema is not.

---

## Multi-Repo Rules

- Repo paths come from `openflow.yml` → `repos.{frontend,backend,context,test,...}`.
- OpenSpec changes live **inside each target repo**: `{repo}/openspec/changes/{sub-ticket}/`.
- OpenFlow orchestration state lives in the **orchestration workspace**: `openflow/`.
- Verify feature branches exist (or create per `branching.pattern`) in all involved repos at Step 1.
- `context` repo is mandatory for every flow.

---

## Human Gates

Gated by default on all 10 v5 steps. At each gate:

1. Summarize what was produced (paths).
2. Call out risks / open questions.
3. Wait for `/openflow approve` or `/openflow block "…"`.
4. On approve: update `state.json` `current_step`, log audit, load next step detail.

Do **not** auto-advance.

---

## Recovery

See `flow-engine/recovery.md` and PLAN §3.

| Situation | aidlc | OpenSpec |
|---|---|---|
| Modify step / bad impl doc | `common/workflow-changes.md` | `openspec-update-change` |
| Retry / resume mid-step | `workflow-changes.md` / `error-handling.md` | `openspec-continue-change` |
| Requirements changed | `workflow-changes.md` | `openspec-update-change` |
| Corrupted artifact | `error-handling.md` | `openspec-new-change` |

**Always confirm destructive changes** before archive/reset/restart.

---

## Audit Trail Format

Every significant action → `openflow/changes/{ticket}/audit.md`:

```markdown
## [Step N] [Action]
**Timestamp**: 2026-07-25T02:00:00Z
**Action**: …
**Artifacts**: …
**Decision**: …
```

---

## Content & Questions

- Before any file write: `common/content-validation.md` + `ascii-diagram-standards.md` when diagrams are involved.
- User questions: `common/question-format-guide.md` → write `openflow/changes/{ticket}/questions.md` (or step-local questions file), not chat-only prompts.
- Terminology: `common/terminology.md` (Phase vs Stage, artifact types). Mid-flow changes: `common/workflow-changes.md`.

---

## Built-in Flows

| Flow id | File | Use when |
|---|---|---|
| `v5-workflow` | `built-in-flows/v5-workflow.yml` | Full FE+BE+context+test |
| `mobile-flow` | `built-in-flows/mobile-flow.yml` | Mobile + backend + context + test |
| `frontend-flow` | `built-in-flows/frontend-flow.yml` | Frontend-centric subset |
| `backend-flow` | `built-in-flows/backend-flow.yml` | Backend-centric subset |

Active flow = `openflow.yml` → `project.flow` (or CLI override).

---

## Human Verification (Step 10)

OpenFlow does **not** enforce a Definition of Done checklist. The human reviews functional context updates and decides when the ticket is complete. `/openflow approve` on Step 10 + `openflow archive` is the closeout signal.

---

## What OpenFlow Is NOT

- Not a replacement for the issue tracker or design tool
- Not the code generator (the AI tool is)
- Not a cloud orchestration service
- Not locked to one AI IDE — rules are portable

---

## Quick Start for the AI

```
1. User: /openflow start PROD-5100
2. Load this file + common + flow-engine
3. workspace-detection → resume or welcome
4. Execute Step 1 (steps/step-01-read-ticket.md)
5. Stop at human gate
6. On /openflow approve → advance; repeat until Step 10 + archive
```

When in doubt: load the step detail file for `current_step` and follow it. Do not invent a parallel workflow.
