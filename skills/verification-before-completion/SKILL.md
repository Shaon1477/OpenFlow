---
name: verification-before-completion
description: During an OpenFlow implement, integrate, or test-automation stage — before claiming the stage is done or offering the human gate. Run the real verify commands and read the output. Never self-approve.
license: MIT
compatibility: OpenFlow. Adapted from obra/superpowers (MIT).
metadata:
  author: openflow
  version: "2.0"
  source: https://github.com/obra/superpowers
---

# Verification before completion (OpenFlow)

**Iron law:** no completion claims without fresh verification evidence in this turn.

This maps to OpenFlow `verify: true`. It does **not** replace `openflow approve`.
You verify, then the human approves.

## Before you say it is done

1. Identify the command that would prove the claim (from the workflow-rule or
   the repo's scripts — lint, typecheck, unit tests, `make test-v5-smoke`, build).
2. Run it fully, now. Not a previous run, not "should pass".
3. Read the full output and exit code.
4. If it failed: report the failure. Do not offer the gate as passing.
5. If it passed: cite the command and the result, then offer `/openflow-approve`.

## Completeness / correctness / coherence

When the stage protocol asks for verify, report each:

| Dimension | Evidence |
|---|---|
| Completeness | `tasks.md` boxes that are truly done |
| Correctness | Spec scenarios vs what you ran |
| Coherence | Code vs `design.md` and the other role's contract |

## Red flags

"Should work", "looks correct", "linter was clean so the build is fine",
trusting a subagent's "success" without a diff, offering the gate after a
partial check.

Do **not** move to the next OpenFlow stage. Verification ≠ approval.
