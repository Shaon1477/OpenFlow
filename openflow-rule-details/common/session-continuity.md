# Session continuity

**Applies to** the start of every session, in every stage.

A new chat is not a new delivery. State lives in `openflow/state.json`, not in the
conversation.

---

## Protocol

1. **Ask the engine, not your memory:**
   ```bash
   openflow next --json
   ```
2. **Load the current stage's inputs**: `openflow/changes/{ticket}/context.md`, the
   artifacts of every `depends_on` stage, and `questions.md` if it exists.
3. **Check for stale work** in the manifest's `stale` field before doing anything
   new. Resolving stale stages comes first; see `../stages/README.md`.
4. **Tell the developer where they are** in one short block:

   ```
   Ticket PROD-5100 — flow delivery-flow
   Done:    analyze, frontend-plan
   Current: frontend-build (implement, role frontend) — awaiting your review
   Stale:   none
   Next:    finish tasks 1.3–1.5, then /openflow-approve
   ```
5. **Resume; do not restart.** Re-running a completed stage discards approved work.
   If a stage genuinely needs redoing, use the revisit path in
   `workflow-changes.md` and confirm the loss first.

---

## Rules

- Never guess the current stage from the last thing in the chat.
- Never re-fetch the work item or re-explore the codebase "to be safe" if
  `context.md` already holds it and nothing changed; say what you are reusing.
- If `openflow/state.json` does not exist, this is a first run — see
  `../inception/workspace-detection.md` and `welcome-message.md`.
- If state and disk disagree (state says a stage is complete but the artifacts are
  gone, or the reverse), stop and follow `error-handling.md`. Do not silently pick
  one.
- Partial work from an interrupted session is normal: read what exists, report what
  is missing, and continue from there rather than starting over.
