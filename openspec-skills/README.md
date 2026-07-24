# OpenSpec skills × OpenFlow steps

OpenFlow orchestrates the workflow; the AI runs OpenSpec skills at the steps below. See [PLAN.md](../implementation%20docs/PLAN.md) §1 for the full ingredient map.

| OpenSpec skill | Purpose | OpenFlow step(s) | CLI / notes |
| --- | --- | --- | --- |
| `openspec-explore` | Explore ticket, ambiguities, codebase — not implementation | **1** Read Ticket | Pre-work before `context.md` |
| `openspec-propose` | `proposal → specs → design → tasks` in one flow | **2** Frontend doc, **4** Test cases, **5** Backend doc, **8** Test scripts (propose), **9** Jira context (propose) | Alternative: `new-change` / `ff-change` |
| `openspec-new-change` | Step-by-step artifacts with approval each | **2**, **5** | When user prefers incremental artifacts |
| `openspec-ff-change` | Fast-forward all planning artifacts | **2**, **5** | When user wants speed |
| `openspec-apply-change` | Implement from `tasks.md` | **3** Frontend impl, **6** Backend impl, **7** Integration, **8** Test scripts (write), **9** Jira context (write) | Commits on feature branch |
| `openspec-continue-change` | Resume incomplete tasks | Any impl step after interrupt | Also `/openflow retry-step` |
| `openspec-verify-change` | Completeness, correctness, coherence | **Before approve** on **3**, **6**, **7**, **8** | Human gate; then `openflow approve` |
| `openspec-update-change` | Revise planning when requirements shift | `/openflow modify-step` | Mid-flow doc fixes |
| `openspec-sync-specs` | Merge change deltas into living specs | **10** Functional context | Writes to **context** repo |
| `openspec-archive-change` | Archive one repo’s change | **10** (per sub-ticket) | `/openflow archive` |
| `openspec-bulk-archive-change` | Archive all sub-ticket changes | **10** (final) | End of parent ticket |
| `openspec-onboard` | Guided first cycle | `/openflow onboard` (planned) | New team members |

## Step → skill quick reference

1. **Read Ticket** — `openspec-explore`
2. **Frontend Implementation Doc** — `openspec-propose` \| `openspec-new-change` \| `openspec-ff-change`
3. **Implement Frontend** — `openspec-apply-change` → `openspec-verify-change`
4. **Write Test Cases** — `openspec-propose`
5. **Backend Implementation Doc** — `openspec-propose` \| `openspec-new-change` \| `openspec-ff-change`
6. **Implement Backend** — `openspec-apply-change` → `openspec-verify-change`
7. **Integration** — `openspec-apply-change` → `openspec-verify-change`
8. **Write Test Scripts** — `openspec-propose` + `openspec-apply-change` → verify before approve
9. **Write Jira Context** — `openspec-propose` + `openspec-apply-change`
10. **Update Functional Context** — `openspec-sync-specs`, `openspec-update-change`, `openspec-archive-change`, `openspec-bulk-archive-change`

Skill sources live under the OpenSpec installation (e.g. `OpenSpec/skills/`). OpenFlow rules in `openflow-rules/core.md` tell the AI when to invoke each skill.
