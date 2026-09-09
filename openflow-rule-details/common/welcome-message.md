# First-run welcome

Shown once, when a workspace has `openflow.md` but no `openflow/state.json`.
Keep it short — the developer wants to start working.

---

```
OpenFlow — workflow orchestration for AI-assisted delivery

  Flow:    {flow name} ({n} stages)
  Repos:   {role} → {path}   (one line per configured role)
  Intake:  {provider}
  Rules:   {role}: {n} file(s)   (one line per role; "none found" if empty)

  OpenFlow decides the next valid stage and holds the gates.
  Your rule packs decide how the code is written.
  You approve every stage.

  Start:   openflow start <WORK-ITEM>
  Then:    openflow next   →  do the work  →  openflow approve
```

---

## Rules

1. Read the real values from `openflow.md` and `openflow rules`. Never show
   placeholders or an invented stack.
2. If a role has no rule pack, say so here — that is the moment the team is most
   likely to add one:
   `Rules: frontend: none found → add .openflow/rules/frontend.md`
3. If `intake.provider` needs a tool that is not available, mention the fallback
   ("no tracker access — I will ask you for the work item").
4. Show it once. On later sessions use `session-continuity.md` instead.
5. Do not list every command. Three lines of workflow are enough; the skills cover
   the rest.
