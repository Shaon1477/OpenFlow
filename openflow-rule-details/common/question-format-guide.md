# Question Format Guide

Ask blocking questions **in the chat**. Wait for the user's reply. Then write the
Q&A into `openflow/changes/{ticket}/questions.md` so later stages and a new
session can still see the decisions.

The file is a record. The conversation is how you ask.

---

## When to ask

If an answer would change behaviour, scope, contract, or acceptance criteria, and
it is not already in the work item, the code, or the project rule packs — ask.
Do not guess. Do not finish the stage with open blocking questions.

---

## How to ask (in chat)

Prefer a short batch (about 3–5 questions). If you need more, ask another round
after the first answers land.

Every question should be multiple-choice with a real "Other":

```text
Question 1 — Who can reassign a shift?

A) Team lead only
B) Any manager in the same org
C) The assigned nurse as well
X) Other (please describe)
```

Rules:

- Options must be meaningful and mutually exclusive. Do not invent filler choices.
- Always include **Other** as the last option.
- One topic per question.
- After the batch, stop. Wait for the user to answer in chat.

If the user answers in free text ("managers only"), accept that. Map it to the
closest option or treat it as Other. Do not make them retype a letter unless the
answer is actually ambiguous.

---

## After they answer

1. Confirm you understood each answer, in one line if needed.
2. Append the questions and answers to `openflow/changes/{ticket}/questions.md`
   under a `## {stage-key}` heading. Use `[Answer]:` so later sessions can parse it.
3. If an answer contradicts an earlier one, ask a follow-up **in chat** before
   proceeding.
4. Only then continue the current stage.

Example record:

```markdown
## analyze

## Question 1
Who can reassign a shift?

A) Team lead only
B) Any manager in the same org
C) The assigned nurse as well
X) Other (please describe)

[Answer]: B
```

---

## What not to do

- Do not write a question file and tell the user to go edit `[Answer]:` tags.
  That is the fallback only if they ask to answer in the file.
- Do not dump 20 questions in one message.
- Do not proceed on an empty or "I'll decide later" for a blocking item.
- Do not invent a business rule to avoid asking.

---

## Fallback

If the user prefers the file: write `questions.md` with empty `[Answer]:` lines
and wait until they say they are done. Chat is the default.
