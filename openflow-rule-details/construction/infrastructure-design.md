# Infrastructure design

**Applies to** `plan` stages when the work needs a resource the project does not
already run.

**Default answer is "reuse what exists."** Read the repo's deployment
configuration and the project rule pack first. Introducing a new dependency is a
decision that needs a reason, an owner and a cost.

---

## 1. Map needs to resources

| Need | Existing resource in this project? | Decision |
|---|---|---|
| Persistence | | |
| Caching | | |
| Async work / queue | | |
| Scheduled work | | |
| File or blob storage | | |
| Search | | |
| Secrets | | |
| Outbound network access | | |

Fill the middle column by inspecting the project, not by assuming a stack.

## 2. For anything new, record

- Why the existing resources cannot serve this.
- The concrete service or component chosen, and its version or tier.
- Configuration that matters: sizing, retention, backup, region, limits.
- How it is provisioned — infrastructure-as-code in this repo, platform team
  request, or manual step (and who does it).
- Cost implication, at least in order of magnitude.
- Failure behaviour when it is unavailable, and the fallback.
- Who operates it after this delivery.

## 3. Environments

- Which environments need this (local, dev, test, production) and how local
  development works without the real thing.
- Configuration and secret names per environment; never actual secret values.
- Migration or provisioning order relative to deploying the code.

## 4. Deployment and rollback

- Deployment sequence when both schema and code change.
- Whether the change is backwards compatible during rollout.
- Rollback plan, including anything that cannot be rolled back (data migrations,
  published events) — say so explicitly.

---

## Output

`design.md` → an infrastructure section with the mapping table, the decisions for
anything new, environment configuration names, and the deployment/rollback
sequence. Operational steps a human must perform go into the handoff document as
well, so they are not lost in a design file.
