# V5 User Execution Flow — How OpenFlow Runs Your Delivery

This is the **exact** mapping of your V5 workflow to OpenFlow.
CLI owns **state**. The AI (Cursor / Claude / etc.) owns **work**, guided by `openflow-rules/core.md` + `built-in-flows/v5-workflow.yml`.

---

## Setup (once per workspace)

```bash
# Orchestration workspace (sibling to your 4 repos)
cd my-delivery-workspace
openflow init --name "TEQ V5" --flow v5-workflow
```

Edit `openflow.yml`:

```yaml
project:
  flow: v5-workflow          # your 10-step flow

repos:
  frontend: ../teq-frontend-v5
  backend:  ../teq-platform
  context:  ../teq-context-docs   # always required
  test:     ../teq-test

tracker:
  provider: jira             # or linear | github — MCP tool configured in your AI
```

Point the AI at `openflow-rules/core.md` (Cursor rule / CLAUDE.md / AGENTS.md).

**You create feature branches manually** in each repo before approving Step 1.

---

## Your ticket shape → OpenFlow state

```
PROD-5100: Employee Module          ← parent (what you pass to start)
  ├── PROD-5101: Context            ← sub_tickets.context
  ├── PROD-5102: Frontend           ← sub_tickets.frontend
  ├── PROD-5103: Backend            ← sub_tickets.backend
  └── PROD-5104: Test Script & Automation  ← sub_tickets.test
```

```bash
openflow start PROD-5100 --title "Employee Module"
```

Creates:

```
openflow/
  state.json                          ← current_step: 1
  changes/PROD-5100/
    context.md                        ← filled in Step 1
    audit.md                          ← every action logged
```

---

## Step-by-step: what you do vs what OpenFlow/AI does

### Step 1 — Receive the Jira Ticket

**Your words:** Review ticket + designs + epic + related tickets.

| Who | Action |
|-----|--------|
| You | `openflow start PROD-5100` (or `/openflow start PROD-5100` in chat) |
| You | Create branches manually in frontend / backend / context / test |
| AI | Calls Jira MCP → reads PROD-5100 + linked epic/designs |
| AI | Resolves subtasks (5101–5104) via MCP, **or asks you** if MCP can't see them |
| AI | Writes `openflow/changes/PROD-5100/context.md` |
| AI | Opt-in prompts: security / testing / resiliency |
| You | Review context → `/openflow approve` or `openflow approve` |

**Gate:** Confirm sub-ticket map + branches exist before Step 2.

---

### Step 2 — Create Frontend Implementation Documentation

**Your words:** Impl doc in Frontend repo from PROD-5102 + project context.

| Who | Action |
|-----|--------|
| AI | Loads `steps/step-02-frontend-doc.md` |
| AI | Runs **openspec-propose** (or ff/new-change) in `teq-frontend-v5` |
| AI | Creates OpenSpec change for **PROD-5102**: proposal → specs → design → tasks |
| You | Review doc in frontend repo → approve |

**Output lives in:** `teq-frontend-v5/openspec/changes/PROD-5102/` (not only in OpenFlow folder).

---

### Step 3 — Implement the Frontend

**Your words:** Implement from frontend impl documentation.

| Who | Action |
|-----|--------|
| AI | **aidlc code-generation**: Part 1 numbered plan → you approve plan |
| AI | **openspec-apply-change** on PROD-5102 tasks |
| AI | **openspec-verify-change** (Completeness / Correctness / Coherence) |
| You | Review code → `/openflow approve` |

---

### Step 4 — Write Test Cases (Context Repository)

**Your words:** Based on frontend impl → test cases in teq-context-docs (PROD-5101).

| Who | Action |
|-----|--------|
| AI | Uses Step 2/3 frontend artifacts as input |
| AI | **openspec-propose** in `teq-context-docs` for **PROD-5101** |
| You | Review test cases → approve |

---

### Step 5 — Create Backend Implementation Documentation

**Your words:** Backend impl doc from frontend doc + test cases + PROD-5103.

| Who | Action |
|-----|--------|
| AI | Loads frontend OpenSpec change + test cases + Jira PROD-5103 |
| AI | NFR / functional-design / infrastructure rules (aidlc) |
| AI | **openspec-propose** in `teq-platform` for **PROD-5103** |
| You | Review → approve |

---

### Step 6 — Implement the Backend

**Your words:** Implement from backend impl documentation.

| Who | Action |
|-----|--------|
| AI | Plan (aidlc) → apply-change → verify-change |
| You | Review → approve |

---

### Step 7 — Integrate Backend with Frontend

**Your words:** Wire FE to BE using both impl docs (still PROD-5102 / frontend repo).

| Who | Action |
|-----|--------|
| AI | Integration work in frontend (and API contracts as needed) |
| AI | apply-change + verify + smoke checks (build-and-test) |
| You | Review → approve |

---

### Step 8 — Write Test Scripts (Test Repository)

**Your words:** Scripts from FE doc + BE doc + test cases → PROD-5104 in teq-test.

| Who | Action |
|-----|--------|
| AI | propose + apply in `teq-test` for **PROD-5104** |
| AI | Follow build-and-test strategy; run Local → Dev → Test |
| You | Confirm all environments green → approve |

---

### Step 9 — Write Jira Context (Context Repository)

**Your words:** After tests pass, Jira context doc for **PROD-5100** in context repo.

| Who | Action |
|-----|--------|
| AI | Summarize FE + BE + test cases + scripts into jira-context doc |
| You | Review → approve |

---

### Step 10 — Update Functional Context

**Your words:** Update living functional context (8 sections). Human verifies completeness.

| Who | Action |
|-----|--------|
| AI | **openspec-sync-specs** into living context in `teq-context-docs` |
| AI | Fill / update: Objective, Scope, User Workflows, Functional Behavior, Data Model, Edge Cases, Compliance, Acceptance Criteria |
| You | Review → `/openflow approve` (human verification — no automated DoD) |
| You | `openflow archive PROD-5100` |
| AI | **openspec-archive-change** / bulk-archive in each repo |

---

## Loop you repeat every day

```
openflow status
        ↓
AI works current step (rules + OpenSpec skills)
        ↓
You review artifacts / code
        ↓
openflow approve          ← advances current_step
        ↓
… until step 10 Done → openflow archive PROD-5100
```

If something breaks mid-flow:

```
/openflow modify-step frontend -ticket PROD-5102   # restart from that step forward
/openflow retry-step 7                             # retry integration onward
/openflow block "waiting on API contract"
```

---

## One glance: your steps ↔ OpenFlow

| Your Step | OpenFlow step | Repo | Ticket | Skill / rule |
|-----------|---------------|------|--------|--------------|
| 1 Receive Jira | 1 Read Ticket | orchestration | PROD-5100 | tracker MCP + explore |
| 2 FE impl doc | 2 Frontend Doc | frontend | PROD-5102 | openspec-propose |
| 3 Implement FE | 3 Frontend Impl | frontend | PROD-5102 | apply + verify + code-gen |
| 4 Test cases | 4 Test Cases | context | PROD-5101 | openspec-propose |
| 5 BE impl doc | 5 Backend Doc | backend | PROD-5103 | propose + NFR rules |
| 6 Implement BE | 6 Backend Impl | backend | PROD-5103 | apply + verify |
| 7 Integrate | 7 Integration | frontend (+be) | PROD-5102 | apply + verify |
| 8 Test scripts | 8 Test Scripts | test | PROD-5104 | propose + apply + build-and-test |
| 9 Jira context | 9 Jira Context | context | PROD-5100 | propose + apply |
| 10 Functional context | 10 Functional Context | context | — | sync-specs + human verify + archive |

---

## What the CLI already verified

```bash
openflow init → start PROD-5100 → status → approve ×10 → archive
```

State advances correctly through all 10 V5 steps. The AI layer does the real Jira/OpenSpec/code work when `core.md` is loaded in the IDE.
