# Step 8 — Write Test Scripts (Automation)

## Purpose

Create automated test assets in the **test repo** from Step 4 test cases and implementation context (Steps 2, 5, 7), run them across local → dev → test environments, fix failures, and gate on all required environments passing before documentation steps (9–10).

**Step index:** `8`  
**Sub-ticket key:** `state.subTickets.test` (e.g. `PROD-5104`).

---

## Prerequisites

- Step 7 human gate passed; integrated system exercisable in target envs.
- Test repo path in `state.repos.test`.
- Step 4 `test-cases.md`, Step 2 frontend specs, Step 5 backend specs available.

**CONTEXT LOADED (mandatory):**

- Step 2: frontend change artifacts
- Step 5: backend change artifacts
- Step 4: `{context_repo}/openspec/changes/{contextSubTicket}/specs/test-cases.md`
- If `extensions.testing`: `../extensions/testing/property-based/property-based-testing.md`

---

## ON ENTRY — Rules and skills to load

| Order | Resource | Path |
|------:|----------|------|
| 1 | Session continuity | `../common/session-continuity.md` |
| 2 | Error handling | `../common/error-handling.md` |
| 3 | Content validation | `../common/content-validation.md` |
| 4 | Build and test (strategy) | `../construction/build-and-test.md` |
| 5 | Property-based testing (if `extensions.testing`) | `../extensions/testing/property-based/property-based-testing.md` |
| 6 | Security baseline (if `extensions.security` — security test slice) | `../extensions/security/baseline/security-baseline.md` |

**OpenSpec skills:**

| Skill | Path | When |
|-------|------|------|
| `openspec-propose` | `../../openspec-skills/openspec-propose/SKILL.md` | MAIN WORK (early) — create test automation change in test repo |
| `openspec-apply-change` | `../../openspec-skills/openspec-apply-change/SKILL.md` | MAIN WORK — implement scripts from `tasks.md` |
| `openspec-continue-change` | `../../openspec-skills/openspec-continue-change/SKILL.md` | ON ENTRY / retry if partial |
| `openspec-verify-change` | `../../openspec-skills/openspec-verify-change/SKILL.md` | Before human gate |

**ON ENTRY actions:**

1. Confirm `currentStep` is `8`.
2. Define test pyramid for this ticket per `build-and-test.md`:
   - Unit (frontend/backend packages as applicable)
   - Integration
   - E2E
   - Contract (API schema vs consumer)
   - Security tests (if security opted in)
   - Performance tests (if required by ticket/NFR)
3. If property-based testing opted in, add generators/invariants per extension doc.

---

## MAIN WORK

1. **Propose automation change** — `openspec-propose` in `{test_repo}/openspec/changes/{testSubTicket}/` with proposal, specs (automation scope), design (frameworks, env config), and `tasks.md`.
2. **Map cases** — Each Step 4 case id maps to at least one automated test or explicit waiver in audit.
3. **Apply change** — `openspec-apply-change` writes scripts/fixtures/CI config per `tasks.md`.
4. **Execute environments** — Run suite in order:
   - **Local** — developer machine / docker compose
   - **Dev** — shared dev environment
   - **Test** — pre-prod or QA  
   Log results per env in audit; fix code or tests; re-run until pass or user accepts waiver (only for non-blocking env with documented risk).
5. **Property-based** (if opted in) — Add and run property tests per extension.
6. **Verify** — `openspec-verify-change` on test change (tasks complete, matches spec).
7. **State** — `artifacts.testAutomationChange`, `humanGate.step8: pending`.

---

## OUTPUT — Artifacts and paths

| Artifact | Path |
|----------|------|
| Test automation change | `{test_repo}/openspec/changes/{testSubTicket}/` |
| Scripts & config | Per `tasks.md` (e.g. `e2e/`, `tests/`, CI workflow files) |
| Audit (env results) | `openflow/changes/{parentTicket}/audit.md` |
| State | `openflow/state.json` |

---

## HUMAN GATE

Advance to Step 9 only when **all** are true:

1. **All required environments passing** — local, dev, and test (unless flow config documents a reduced matrix; any skip must be in audit with approval).
2. `openspec-verify-change` passes on test repo change.
3. User confirms automation covers agreed case set from Step 4.
4. No critical open failures; flaky tests triaged or quarantined with ticket follow-up noted.

On approval: `humanGate.step8: approved`, `currentStep: 9`.

---

## OpenSpec skills — fire order

| Order | Skill | Phase |
|------:|-------|--------|
| 1 | `openspec-continue-change` | ON ENTRY (conditional) |
| 2 | `openspec-propose` | MAIN WORK — create change |
| 3 | `openspec-apply-change` | MAIN WORK — write scripts |
| 4 | `openspec-verify-change` | HUMAN GATE |

---

## Audit log entry template

```markdown
## Step 8 — Test Scripts
**Timestamp**: {ISO-8601-UTC}
**Action**: Test automation {completed|in progress}
**Sub-ticket**: {testSubTicket}
**Skill used**: openspec-propose + openspec-apply-change
**Testing extension**: property-based={YES|NO}; security tests={YES|NO}
**Environments**: local={pass|fail}, dev={pass|fail}, test={pass|fail}
**Location**: {test_repo}/openspec/changes/{testSubTicket}/
**OpenSpec verify**: {pass|fail}
**Human gate**: {pending|approved at {timestamp}}
**Decision**: {e.g. waived perf in test env}
```

---

## Recovery pointers

| Situation | Rule | OpenSpec |
|-----------|------|----------|
| `/openflow retry-step 8` | `../common/workflow-changes.md` | `openspec-continue-change` |
