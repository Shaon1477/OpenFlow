# OpenFlow — Implementation Plan (v4 — Complete Ingredient Map)

> **What it is:** A flow-agnostic, multi-repo SDLC orchestration engine.  
> **Key principle:** OpenFlow owns the workflow. aidlc and OpenSpec are its proven ingredients — used in full, not reinvented.

---

## 0. The Three-Repo Relationship

```
┌─────────────────────────────────────────────────────────────┐
│                        OpenFlow                             │
│   (owns: the 10-step workflow, flows config, MCP bridge,   │
│    tracker integration, multi-repo orchestration)           │
│                                                             │
│   Uses aidlc for:              Uses OpenSpec for:           │
│   ┌───────────────────┐        ┌────────────────────────┐   │
│   │ • Session resume  │        │ • propose (impl docs)  │   │
│   │ • Code gen rules  │        │ • apply-change (impl)  │   │
│   │ • Build & test    │        │ • verify-change (gate) │   │
│   │ • Error handling  │        │ • update-change (fix)  │   │
│   │ • Overconfidence  │        │ • sync-specs (context) │   │
│   │ • Depth levels    │        │ • archive-change       │   │
│   │ • Security ext    │        │ • explore (pre-step)   │   │
│   │ • Resiliency ext  │        │ • continue-change      │   │
│   │ • Mid-flow changes│        │ • ff-change (fast)     │   │
│   │ • Audit trail     │        └────────────────────────┘   │
│   │ • Terminology     │                                      │
│   └───────────────────┘                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Complete Ingredient Inventory

### From `aidlc---workflow-driven` — Every file we take

#### `aws-aidlc-rule-details/common/` — ALL 11 files, used throughout the full flow

| File | What it gives OpenFlow | Used where |
|---|---|---|
| `session-continuity.md` | "Welcome back" protocol — resume from last step, load all prior artifacts, show exact next action | Every session start |
| `content-validation.md` | Validate Mermaid diagrams, ASCII art, escape special chars before writing any file | Before writing any doc/artifact |
| `depth-levels.md` | Adaptive depth: minimal / standard / comprehensive based on ticket complexity | Step 1 analysis, Step 2 & 5 doc creation |
| `overconfidence-prevention.md` | Never assume — default to asking when ANY ambiguity exists. Better to over-ask than under-ask | Step 1, Step 2, Step 5 (requirement gathering) |
| `error-handling.md` | Error severity (Critical/High/Medium/Low), stage-specific recovery procedures, logging format for `audit.md` | Every step, especially recovery commands |
| `question-format-guide.md` | Multiple-choice questions in `.md` files with `[Answer]:` tags — NEVER ask inline in chat | Any step requiring user input |
| `terminology.md` | Phase vs Stage, artifact types, planning vs generation sub-steps | core.md vocabulary |
| `workflow-changes.md` | Mid-workflow changes: add/skip/restart/change depth/pause/resume + decision tree + "always confirm destructive changes" | `/openflow modify-step`, `/openflow retry-step` |
| `process-overview.md` | Three-phase lifecycle reference diagram | core.md bootstrap |
| `welcome-message.md` | User-facing welcome display format | First run of any flow |
| `ascii-diagram-standards.md` | How to draw compliant ASCII diagrams | Any doc creation step |

#### `aws-aidlc-rule-details/inception/`

| File | What it gives OpenFlow | Used where |
|---|---|---|
| `workspace-detection.md` | Detect existing `openflow/state.json`, distinguish brownfield/greenfield, create state file on first run | Step 1 bootstrap |
| `requirements-analysis.md` | Adaptive requirements gathering (minimal/standard/comprehensive depth), completeness analysis, how to convert vague ticket into clear requirements | Step 1 (ticket analysis), Step 2 & 5 (scoping impl docs) |
| `workflow-planning.md` | Impact analysis, transformation scope detection (does this ticket touch API? UI? DB?), cross-package impact | Step 1 (ticket breakdown confirmation) |

#### `aws-aidlc-rule-details/construction/`

| File | What it gives OpenFlow | Used where |
|---|---|---|
| `code-generation.md` | **Two-part discipline**: Part 1 = numbered plan with checkboxes → human approval → Part 2 = execute. Never generate code without a reviewed plan | Step 3 (frontend impl), Step 6 (backend impl), Step 7 (integration) |
| `build-and-test.md` | Comprehensive testing strategy: unit, integration, e2e, contract, security, performance. Build instructions template | Step 8 (test scripts) |
| `functional-design.md` | Technology-agnostic business logic design, domain models, business rules, data flow — all the questions to ask before designing | Step 2 & 5 (impl doc depth) |
| `nfr-requirements.md` | NFR analysis: performance, security, scalability, reliability — and tech stack selection | Step 5 (backend impl doc) |
| `nfr-design.md` | Incorporate NFR patterns into design, logical components | Step 5 (backend impl doc) |
| `infrastructure-design.md` | Map to actual infra services (DB, cache, queue, etc.) | Step 5 (backend impl doc) |

#### `aws-aidlc-rule-details/extensions/` — Opt-in at Step 1, applied during Steps 3/6/8

| File | What it gives OpenFlow | Opt-in timing |
|---|---|---|
| `security/baseline/security-baseline.opt-in.md` | Prompt the user to opt in | Step 1 |
| `security/baseline/security-baseline.md` | MANDATORY blocking security rules (encryption at rest/transit, access logging, app logging, IAM, secrets management, input validation, etc.) — loaded only if opted in | Steps 3, 6, 8 (each impl step) |
| `testing/property-based/property-based-testing.opt-in.md` | Prompt the user to opt in | Step 1 |
| `testing/property-based/property-based-testing.md` | Property-based testing rules — loaded only if opted in | Step 8 |
| `resiliency/baseline/resiliency-baseline.opt-in.md` | Prompt to opt in | Step 1 |
| `resiliency/baseline/resiliency-baseline.md` | Resiliency patterns (retries, circuit breakers, timeouts, fallbacks) | Steps 6, 7 |

#### `audit.md` concept (from aidlc pattern)
Every significant action logged to `openflow/changes/{ticket}/audit.md` with ISO timestamps. Format:
```markdown
## [Step N] [Action]
**Timestamp**: 2026-07-25T02:00:00Z
**Action**: Created frontend implementation doc
**Artifacts**: ../teq-frontend-v5/docs/implementation/PROD-5102-implementation.md
**Decision**: Used standard depth (ticket complexity: moderate)
```

---

### From `OpenSpec` — Every skill we take + exactly when it fires

| Skill | What it gives OpenFlow | Fires at |
|---|---|---|
| `openspec-explore` | "Thinking partner" mode — explore the ticket, understand ambiguities, map existing code, compare approaches. NOT implementation | Step 1 (pre-work before writing context.md) |
| `openspec-propose` | Creates `proposal → specs → design → tasks` for a sub-ticket in one flow. The complete impl doc pipeline | Step 2 (frontend impl doc), Step 5 (backend impl doc), Step 4 (test cases doc) |
| `openspec-new-change` | Step-by-step artifact creation with user approval at each artifact | Step 2/5 when user prefers step-by-step over fast-forward |
| `openspec-ff-change` | Fast-forward: creates ALL artifacts in one shot | Step 2/5 when user wants speed |
| `openspec-apply-change` | Implements from a change's `tasks.md`. Reads context files, executes tasks in order, marks checkboxes | Step 3 (implement frontend), Step 6 (implement backend), Step 7 (integration), Step 8 (test scripts) |
| `openspec-continue-change` | Resume implementing from where it left off — picks up from last incomplete task | Resume after interruption mid-step |
| `openspec-verify-change` | 3-dimension verification: **Completeness** (all tasks done?), **Correctness** (matches specs?), **Coherence** (consistent with design?) | Human gate BEFORE `/openflow approve` advances past Steps 3, 6, 7, 8 |
| `openspec-update-change` | Revise planning artifacts when requirements change mid-flow — keeps proposal/specs/design/tasks coherent | `/openflow modify-step` — user found a problem with the impl doc |
| `openspec-sync-specs` | Sync delta specs from a change into the main/living spec. Intelligent merge (adds scenario without copying whole file) | Step 10 (update functional context = syncing delivered change into living docs) |
| `openspec-archive-change` | Archive a completed change — moves it out of active changes | `/openflow archive {ticket}` per repo |
| `openspec-bulk-archive-change` | Archive all 4 sub-ticket changes at once | Final step of `/openflow archive {ticket}` |
| `openspec-onboard` | Guided first-cycle walkthrough — teaching experience | `/openflow onboard` (new team members) |

---

## 2. Step-by-Step Skill/Rule Delegation Map

> This is the exact reference that `core.md` and each `step-N-*.md` rule file will implement.

### Step 1 — Read Ticket

```
ON ENTRY:
  aidlc/workspace-detection.md    → check for openflow/state.json (resume if found)
  aidlc/session-continuity.md     → if resuming: show "Welcome back" with current step
  aidlc/welcome-message.md        → if first run: display welcome
  aidlc/extensions/*.opt-in.md    → present security/testing/resiliency opt-ins

MAIN WORK:
  OpenFlow/tracker-bridge.md      → call tracker MCP generically → normalize ticket
  OpenFlow/subtask-collection.md  → auto-fetch or ask for 4 sub-ticket IDs
  openspec-explore                → think through the ticket: ambiguities? design? scope?
  aidlc/requirements-analysis.md  → analyze ticket with adaptive depth
  aidlc/overconfidence-prevention → ask questions when ANY ambiguity in ticket
  aidlc/workflow-planning.md      → scope detection: does this touch UI? API? DB? All?
  aidlc/question-format-guide.md  → write questions to .md file, not inline

OUTPUT:
  openflow/changes/{ticket}/context.md
  openflow/changes/{ticket}/audit.md (created)
  openflow/state.json (created/updated)
  Branch verification in all repos

HUMAN GATE: confirm context.md + sub-ticket IDs before advancing
```

### Step 2 — Frontend Implementation Doc

```
ON ENTRY:
  aidlc/depth-levels.md           → determine doc depth based on sub-ticket complexity
  aidlc/functional-design.md      → business logic design questions to ask

MAIN WORK (choose one):
  openspec-propose                → fast: proposal+specs+design+tasks in one step
  OR openspec-new-change          → step-by-step artifact creation
  OR openspec-ff-change           → fastest: all artifacts in one shot

  Artifacts created:
    {frontend_repo}/openspec/changes/{PROD-5102}/proposal.md
    {frontend_repo}/openspec/changes/{PROD-5102}/specs/*.md
    {frontend_repo}/openspec/changes/{PROD-5102}/design.md
    {frontend_repo}/openspec/changes/{PROD-5102}/tasks.md

HUMAN GATE: review impl doc before implementation
```

### Step 3 — Implement Frontend

```
ON ENTRY:
  aidlc/code-generation.md        → Part 1: numbered plan with checkboxes
                                  → wait for human approval of plan
                                  → Part 2: execute plan
  IF security opted in:
    aidlc/security-baseline.md    → enforce blocking security rules during impl

MAIN WORK:
  openspec-apply-change           → implement from tasks.md in frontend repo
                                  → mark checkboxes as work is done
                                  → commit to feature branch

HUMAN GATE:
  openspec-verify-change          → 3-dimension check before advancing:
                                     Completeness: all tasks.md checkboxes done?
                                     Correctness: code matches specs?
                                     Coherence: consistent with design.md?
```

### Step 4 — Write Test Cases

```
MAIN WORK:
  openspec-propose                → create test-cases change in context repo
  aidlc/requirements-analysis.md → analyze what test scenarios are needed
  aidlc/overconfidence-prevention → ask about edge cases, error scenarios

  Artifacts created:
    {context_repo}/openspec/changes/{PROD-5101}/specs/test-cases.md

HUMAN GATE: review test cases before backend work starts
```

### Step 5 — Backend Implementation Doc

```
ON ENTRY:
  aidlc/depth-levels.md           → adaptive depth
  aidlc/functional-design.md      → business logic design
  aidlc/nfr-requirements.md       → NFR analysis (performance, security, scalability)
  aidlc/nfr-design.md             → NFR patterns
  aidlc/infrastructure-design.md  → map to actual infra (DB, cache, queues)

CONTEXT LOADED:
  Step 2 output (frontend impl doc) — backend must match frontend contract
  Step 4 output (test cases) — backend must satisfy all test scenarios

MAIN WORK:
  openspec-propose (or ff-change) → proposal+specs+design+tasks in backend repo
  
  Artifacts created:
    {backend_repo}/openspec/changes/{PROD-5103}/proposal.md
    {backend_repo}/openspec/changes/{PROD-5103}/specs/*.md
    {backend_repo}/openspec/changes/{PROD-5103}/design.md
    {backend_repo}/openspec/changes/{PROD-5103}/tasks.md

HUMAN GATE: review backend impl doc
```

### Step 6 — Implement Backend

```
ON ENTRY:
  aidlc/code-generation.md        → Part 1 plan → approval → Part 2 execute
  IF security opted in:
    aidlc/security-baseline.md    → blocking security rules (APIs, encryption, logging)
  IF resiliency opted in:
    aidlc/resiliency-baseline.md  → retries, circuit breakers, timeouts

MAIN WORK:
  openspec-apply-change           → implement from backend tasks.md
                                  → commit to feature branch

HUMAN GATE:
  openspec-verify-change          → completeness + correctness + coherence
```

### Step 7 — Backend ↔ Frontend Integration

```
CONTEXT LOADED:
  Step 2 output (frontend impl doc)
  Step 5 output (backend impl doc)
  IF resiliency opted in: apply resiliency-baseline.md

MAIN WORK:
  openspec-apply-change           → integration tasks in frontend repo
                                  → wire to live backend APIs

HUMAN GATE:
  openspec-verify-change          → integration completeness check
  aidlc/build-and-test.md         → integration smoke test
```

### Step 8 — Write Test Scripts (Automation)

```
CONTEXT LOADED:
  Step 2 output (frontend impl doc)
  Step 5 output (backend impl doc)
  Step 4 output (test cases)
  IF testing/property-based opted in: apply property-based-testing.md

MAIN WORK:
  openspec-propose                → create test automation change in test repo
  aidlc/build-and-test.md         → testing strategy:
                                     - unit tests
                                     - integration tests
                                     - e2e tests
                                     - contract tests
                                     - security tests (if opted in)
                                     - performance tests
  openspec-apply-change           → write scripts from tasks.md

  Run on: local → dev → test environments
  Fix issues → re-run

HUMAN GATE: all environments passing
```

### Step 9 — Write Jira Context Doc

```
CONTEXT LOADED: All Step 2, 4, 5, 8 outputs

MAIN WORK:
  openspec-propose                → create Jira context change in context repo
  openspec-apply-change           → write the context document

  Output: {context_repo}/jira-context/{parent_ticket_id}-context.md

HUMAN GATE: review context doc
```

### Step 10 — Update Functional Context

```
MAIN WORK:
  openspec-sync-specs             → sync this delivery's delta specs into the
                                    living functional context (intelligent merge)
  openspec-update-change          → update existing functional context sections

  ARCHIVE:
    openspec-archive-change       → archive per sub-ticket in each repo
    openspec-bulk-archive-change  → bulk archive all sub-ticket changes
    openflow state → ticket marked Done (after human approve)

HUMAN GATE: human reviews functional context → approve → ticket Done
  (no automated Definition of Done checklist)
```

---

## 3. Recovery Command Internals

| Command | aidlc rule | OpenSpec skill |
|---|---|---|
| `/openflow modify-step frontend -ticket PROD-5102` | `workflow-changes.md` (restart stage procedure: confirm → archive existing → reset → re-execute) | `openspec-update-change` (revise impl doc artifacts) |
| `/openflow retry-step 7` | `workflow-changes.md` (add skipped / restarting current stage) | `openspec-continue-change` (resume from last checkpoint) |
| Session interrupted mid-step | `error-handling.md` (partial stage completion recovery) | `openspec-continue-change` |
| Ticket requirements changed after Step 2 | `workflow-changes.md` (changing architectural decision) | `openspec-update-change` (keep artifacts coherent) |
| Artifact file corrupted | `error-handling.md` (missing artifacts recovery) | `openspec-new-change` (regenerate artifact) |

---

## 4. The Audit Trail (From aidlc Pattern)

Every flow maintains `openflow/changes/{ticket}/audit.md`:

```markdown
## Session Start
**Timestamp**: 2026-07-25T02:00:00Z
**Flow**: v5-workflow
**Ticket**: PROD-5100

## Step 1 — Read Ticket
**Timestamp**: 2026-07-25T02:01:00Z
**Depth selected**: standard (ticket complexity: moderate)
**Sub-tickets resolved**: frontend=PROD-5102, backend=PROD-5103, context=PROD-5101, test=PROD-5104
**Branches verified**: all 4 repos ✅
**Extensions opted in**: security=YES, testing=NO, resiliency=YES

## Step 2 — Frontend Implementation Doc
**Timestamp**: 2026-07-25T02:15:00Z
**Skill used**: openspec-propose (fast mode)
**Artifacts created**: proposal.md, specs/employee-ui.md, design.md, tasks.md
**Location**: ../teq-frontend-v5/openspec/changes/PROD-5102/
**Human gate**: approved at 02:22:00Z
```

---

## 5. Full Repository Structure (Final)

```
OpenFlow/                                ← this repo (the engine)
│
├── openflow-rules/
│   └── core.md                          ← MASTER (always loaded by AI tool)
│
├── openflow-rule-details/
│   ├── common/                          ← FROM aidlc (all 11 files, copied as-is)
│   │   ├── session-continuity.md
│   │   ├── content-validation.md
│   │   ├── depth-levels.md
│   │   ├── overconfidence-prevention.md
│   │   ├── error-handling.md
│   │   ├── question-format-guide.md
│   │   ├── terminology.md
│   │   ├── workflow-changes.md
│   │   ├── process-overview.md
│   │   ├── welcome-message.md
│   │   └── ascii-diagram-standards.md
│   │
│   ├── tracker/                         ← NEW (OpenFlow-specific)
│   │   ├── tracker-bridge.md
│   │   ├── ticket-schema.md
│   │   └── subtask-collection.md
│   │
│   ├── flow-engine/                     ← NEW (OpenFlow-specific)
│   │   ├── flow-loader.md
│   │   ├── step-executor.md
│   │   ├── human-gate.md
│   │   └── recovery.md
│   │
│   ├── inception/                       ← FROM aidlc (adapted)
│   │   ├── workspace-detection.md
│   │   ├── requirements-analysis.md
│   │   └── workflow-planning.md
│   │
│   ├── construction/                    ← FROM aidlc (copied as-is)
│   │   ├── code-generation.md
│   │   ├── build-and-test.md
│   │   ├── functional-design.md
│   │   ├── nfr-requirements.md
│   │   ├── nfr-design.md
│   │   └── infrastructure-design.md
│   │
│   └── extensions/                      ← FROM aidlc (copied as-is)
│       ├── security/baseline/
│       │   ├── security-baseline.md
│       │   └── security-baseline.opt-in.md
│       ├── testing/property-based/
│       │   ├── property-based-testing.md
│       │   └── property-based-testing.opt-in.md
│       └── resiliency/baseline/
│           ├── resiliency-baseline.md
│           └── resiliency-baseline.opt-in.md
│
├── openspec-skills/                     ← FROM OpenSpec (symlinked or referenced)
│   └── README.md                        ← documents which skills fire at which steps
│
├── built-in-flows/
│   ├── v5-workflow.yml
│   ├── mobile-flow.yml
│   ├── frontend-flow.yml
│   └── backend-flow.yml
│
├── templates/
│   ├── context.md
│   ├── jira-context.md
│   └── functional-context.md
│
├── schemas/
│   ├── openflow.config.schema.json
│   ├── flow-definition.schema.json
│   └── state.schema.json
│
├── src/                                 ← CLI (Phase 4 of build)
│   ├── cli/ ...
│   └── lib/ ...
├── bin/openflow
└── package.json
```

---

## 6. Build Order (When We Start)

### Phase 1 — Copy + adapt aidlc rules
```
1.1  Copy all 11 files from aidlc/common/       → openflow-rule-details/common/
1.2  Copy 3 files from aidlc/inception/         → openflow-rule-details/inception/ (adapt paths)
1.3  Copy 6 files from aidlc/construction/      → openflow-rule-details/construction/
1.4  Copy 6 files from aidlc/extensions/        → openflow-rule-details/extensions/
```

### Phase 2 — Write OpenFlow-specific rule files
```
2.1  tracker/tracker-bridge.md
2.2  tracker/ticket-schema.md
2.3  tracker/subtask-collection.md
2.4  flow-engine/flow-loader.md
2.5  flow-engine/step-executor.md
2.6  flow-engine/human-gate.md
2.7  flow-engine/recovery.md
```

### Phase 3 — Write step detail files (the 10-step rules)
```
3.1  steps/step-01-read-ticket.md         (uses: workspace-detection, session-continuity, explore, requirements-analysis, overconfidence)
3.2  steps/step-02-frontend-doc.md        (uses: depth-levels, functional-design, propose/new-change/ff-change)
3.3  steps/step-03-frontend-impl.md       (uses: code-generation, apply-change, security, verify-change)
3.4  steps/step-04-test-cases.md          (uses: propose, requirements-analysis, overconfidence)
3.5  steps/step-05-backend-doc.md         (uses: functional-design, nfr-requirements, nfr-design, infra-design, propose)
3.6  steps/step-06-backend-impl.md        (uses: code-generation, apply-change, security, resiliency, verify-change)
3.7  steps/step-07-integration.md         (uses: apply-change, resiliency, build-and-test, verify-change)
3.8  steps/step-08-test-scripts.md        (uses: propose, apply-change, build-and-test, property-based-testing)
3.9  steps/step-09-jira-context.md        (uses: propose, apply-change)
3.10 steps/step-10-functional-context.md  (uses: sync-specs, update-change, archive-change, bulk-archive; human verifies)
```

### Phase 4 — Master rule file
```
4.1  openflow-rules/core.md   ← written last, references all 2.x + 3.x files
```

### Phase 5 — Flow definitions + config
```
5.1  built-in-flows/v5-workflow.yml
5.2  built-in-flows/mobile-flow.yml
5.3  built-in-flows/frontend-flow.yml
5.4  built-in-flows/backend-flow.yml
5.5  openflow.yml (example)
5.6  schemas/*.json
```

### Phase 6 — Templates
```
6.1  templates/context.md
6.2  templates/jira-context.md
6.3  templates/functional-context.md (8 sections)
```

### Phase 7 — CLI
```
7.1  src/lib/config.ts + state.ts + flow-loader.ts
7.2  src/cli/init.ts + start.ts + approve.ts + status.ts + archive.ts
7.3  bin/openflow + package.json
```

### Phase 8 — Polish
```
8.1  README.md
8.2  GitHub Actions
8.3  Adapter examples (Linear, GitHub Issues)
```

---

## 7. The One Constant

> Every flow — regardless of what repos it touches — always has a `context` repo.  
> The context repo is where documentation, test cases, and functional context live.  
> Its path is user-configurable. Its presence is not optional.  
> `openspec-sync-specs` always writes back to it at Step 10.

---

*Living document. Update as decisions are finalized.*
