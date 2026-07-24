# V5 User Execution Flow

CLI owns **state**. Skills in Cursor / Windsurf / Claude own **which flow** and day-to-day work — same pattern as OpenSpec / aidlc.

---

## Once per project

```bash
openflow init
# edit openflow.yml → repos + tracker
```

Installs:

- `openflow.yml`
- `.cursor/skills/openflow-*` (slash skills)
- `.cursor/rules/openflow.mdc` (always-on rules)

**Do not** run `init` again to pick backend vs v5. Init is setup only.

---

## Day to day (skills — like OpenSpec)

| You type in Cursor | Meaning |
|--------------------|---------|
| `/openflow-v5-workflow PROD-5100` | Full module (FE+BE+context+test) |
| `/openflow-backend-flow PROD-5103` | Backend-only ticket |
| `/openflow-frontend-flow PROD-5102` | Frontend-only |
| `/openflow-mobile-flow APP-44` | Mobile |
| `/openflow-approve` | Next step after you reviewed |
| `/openflow-status` | Where am I? |
| `/openflow-archive PROD-5100` | Close ticket |
| `/openflow-modify-step frontend -ticket PROD-5102` | Redo from that step forward |

`openflow.yml` → `project.flow` is only a **default**. The skill’s `--flow` wins for that ticket.

---

## Example: full V5 parent ticket

```
/openflow-v5-workflow PROD-5100
```

AI: reads Jira → context.md → gate  
You: create branches → `/openflow-approve`  
… Steps 2–10 …  
You: `/openflow-approve` each gate → `/openflow-archive PROD-5100`

---

## Example: backend-only issue

Same project. **No re-init.**

```
/openflow-backend-flow PROD-5103
```

AI skips FE steps; runs backend + context (+ test if configured).  
You: `/openflow-approve` between steps.

---

## Your 10 steps ↔ skills

| Your step | When (v5-workflow) |
|-----------|--------------------|
| 1 Receive Jira | After `/openflow-v5-workflow` |
| 2 FE impl doc | After approve step 1 |
| 3 Implement FE | After approve step 2 |
| 4 Test cases | After approve step 3 |
| 5 BE impl doc | After approve step 4 |
| 6 Implement BE | After approve step 5 |
| 7 Integrate | After approve step 6 |
| 8 Test scripts | After approve step 7 |
| 9 Jira context | After approve step 8 |
| 10 Functional context | After approve step 9 → you verify → archive |

Human verifies; no automated DoD.
