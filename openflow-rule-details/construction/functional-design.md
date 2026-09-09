# Functional design questions

**Applies to** `plan` stages. Answer these **before** writing `design.md`, in the
project's own vocabulary. The project rule pack for the role decides *how*
something is built; this file makes sure you know *what* must be built.

Anything you cannot answer from the work item, the code, or the rule pack is asked
in chat, then recorded in `questions.md`. A guessed business rule is the most
expensive kind of mistake.

---

## 1. Behaviour

- What can the user (or calling system) do that they could not do before?
- What is the exact trigger for each behaviour?
- What is the observable result — data, UI state, side effect, notification?
- What must **not** change? Name the existing behaviour being preserved.

## 2. Domain and data

- Which entities are involved, and which one owns each field?
- Which fields are required, optional, derived, or immutable after creation?
- What are the valid ranges, formats and units? (Currency, timezone, precision.)
- Does anything need migration or backfill?

## 3. Business rules

- What validation applies, and where is it enforced (client, service, database)?
- What are the permission rules — who can do this, on whose behalf?
- What happens on conflict: last write wins, reject, merge, queue?
- Are there time-based rules — cutoffs, expiry, schedules, retention?

## 4. States and transitions

- What states can the entity be in, and which transitions are legal?
- Which transitions are reversible? Who may perform each?
- What happens to in-flight work when a state changes underneath it?

## 5. Failure and edges

- Empty, single, maximum and over-limit cases.
- Duplicate submissions and double-clicks — is the operation idempotent?
- Partial failure across steps — what is rolled back, what is retried?
- What does the user see for each failure, and what can they do next?

## 6. Cross-role contract

- What does this role expose to others, exactly?
- What does it consume, and what does it assume about that provider?
- What happens when the provider is slow, missing a field, or returns an error?
- Which changes here would be breaking for a consumer?

## 7. Non-functional expectations

- Expected volume and growth; acceptable latency.
- Data sensitivity — what is personal, what must be redacted from logs.
- Auditability — what must be recorded, and for how long.

---

## Output

Answers land in `design.md` (approach, structure, contract detail, data and state)
and in `specs/*.md` as requirements with scenarios. Unresolved items are asked in
chat and recorded in `questions.md` — never resolved silently in your head.
