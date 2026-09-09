---
name: systematic-debugging
description: During an OpenFlow implement, integrate, or test-automation stage — use when a bug, test failure, or unexpected behavior appears. Find root cause before fixing. Never skip the OpenFlow gate. Never self-approve.
license: MIT
compatibility: OpenFlow. Adapted from obra/superpowers (MIT).
metadata:
  author: openflow
  version: "2.0"
  source: https://github.com/obra/superpowers
---

# Systematic debugging (OpenFlow)

**Iron law:** no fixes without root-cause investigation first.

OpenFlow still owns the stage. This skill is *how* you debug inside the current
stage. Do not start the next stage. Do not run `openflow approve`.

## When

Test failure, unexpected behaviour, build/lint failure, integrate mismatch.
Especially when "one quick fix" looks obvious.

## Four phases (in order)

### 1. Root cause

Read the full error. Reproduce it. Check what changed (`git diff`, recent
commits). In a multi-repo TEQ slice, gather evidence at each boundary
(SPA `api/` → v4papi → teqapi → helper) before guessing which layer is wrong.

### 2. Pattern

Find a working sibling in the same repo (Vehicle/Customer list, an existing
`BaseProxyAPIView`). Diff against it. Do not "adapt" a pattern you only skimmed.

### 3. Hypothesis

One hypothesis, written down. Smallest change that could falsify it. If it
fails, new hypothesis — do not stack fixes.

### 4. Fix

One change at the source, not the symptom. Then run
`verification-before-completion` (fresh command, read the output).

If **three** fix attempts fail: stop. Say so in chat. Likely architecture, not
a typo — do not silently refactor past the approved plan.

## OpenFlow / TEQ notes

- Do not invent a Jest/TDD suite on the Vue app. Prefer a failing Playwright
  case on `test-automation`, or a backend test if that repo already has one.
- Symptom-fixing in the SPA to hide a v4papi contract bug is a process failure;
  fix the owning layer or stop and revisit the plan.
- After 3+ failed fixes, wait for the human. Do not skip the gate to "keep going".
