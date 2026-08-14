# Stage: sync-context

**Goal.** Fold this delivery into the team's **living documentation** so the next
person (or agent) reads current truth, then close the work item out. This is the
stage that exists because context docs rot when updating them is optional.

**Produces.** Updated living docs in the context repo, an archived change folder,
and a passing Definition of Done.

---

## ON ENTRY

1. `openflow next --json`, then `openflow drift`. If anything is stale, resolve it
   **before** syncing — writing drifted content into living docs is exactly the
   failure this stage prevents.
2. Read the handoff document, every role's final `specs/`, and the current living
   documentation in the context repo.
3. Load the project rule pack for the context role: document structure, naming,
   ownership, where each kind of knowledge belongs.

---

## MAIN WORK

### 1. Diff delivered behaviour against documented behaviour

For each spec delivered in this work item, find where that behaviour lives in the
living documentation. Three outcomes:

| Case | Action |
|---|---|
| Behaviour is new | Add it to the owning document, in that document's existing style |
| Behaviour changed | Edit the existing section in place; do not append a second version |
| Behaviour was removed | Delete the stale section, do not leave it "for history" |

History belongs in the archive and version control, not in living docs.

### 2. Merge surgically

Add or edit the affected sections only. Do not paste whole change documents into
the living docs — that is how they become unreadable and stop being trusted.

### 3. Reconcile contradictions

If the delivered behaviour contradicts something documented elsewhere, fix that
place too, or record the conflict explicitly with an owner. A known contradiction
recorded is acceptable; a silent one is not.

### 4. Update indexes

Whatever the context repo uses to navigate — index, table of contents, capability
map, glossary — update it so new content is reachable.

### 5. Verify the docs describe reality

Re-read the changed sections against the code. This is the last checkpoint where
documentation and implementation are compared while both are fresh.

---

## OUTPUT

- Living documentation updated in the context repo and committed
- Contradictions resolved or explicitly recorded with an owner
- Indexes updated

---

## CLOSEOUT

```bash
openflow check      # executable Definition of Done
openflow approve    # last gate
openflow archive {ticket}
```

`openflow archive` refuses to close a work item whose Definition of Done fails,
which is what makes "the flow always finishes with proper context docs" a rule
rather than a habit. Overriding it requires `--force`, and that override is
recorded in the audit trail.

Moving the work item to Done in the tracker stays a human action.
