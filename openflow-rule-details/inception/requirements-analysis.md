# Requirements analysis

**Applies to** the `analyze` stage. **Assume the role** of a product owner who will
be held to what is written.

Output goes into `openflow/changes/{ticket}/context.md`; blocking gaps go into
`questions.md`. Depth adapts to complexity — see `../common/depth-levels.md`.

---

## 1. Ground yourself in the existing system

For brownfield work, before analyzing:

- Read the living documentation in the context repo for the areas involved
- Read the relevant modules and existing tests in each role's repo
- Read each role's rule pack for the patterns the team expects

Requirements written without reading the code describe an imaginary system.

## 2. Classify the request

| Dimension | Options |
|---|---|
| Clarity | clear · vague · incomplete |
| Type | new feature · bug fix · refactor · upgrade · migration · enhancement |
| Scope | single file · single component · multiple components · system-wide · cross-system |
| Complexity | trivial · simple · moderate · complex |

Record all four in `context.md`. They justify the depth you pick next.

## 3. Choose depth

| Depth | When |
|---|---|
| `minimal` | Clear, small, low risk — document the understanding and move |
| `standard` | Normal work needing clarification and both functional and non-functional requirements |
| `comprehensive` | Complex, high risk, multiple stakeholders, traceability required |

State the depth and the reason.

## 4. Completeness analysis

Evaluate every area below, and raise a question for anything unclear:

- **Functional**: features, interactions, system behaviour
- **Non-functional**: performance, security, scalability, usability
- **Scenarios**: use cases, journeys, edge cases, error paths
- **Business context**: goals, constraints, success criteria
- **Technical context**: integration points, data, system boundaries
- **Quality attributes**: reliability, maintainability, testability, accessibility

When in doubt, ask. Incomplete requirements are the most common cause of a delivery
that passes review and still does the wrong thing.

## 5. Extension opt-ins

Scan the `extensions/*/**/*.opt-in.md` files for an `## Opt-In Prompt` section and
include each question in `questions.md`, phrased in the user's language.

After answers are in, record the choices at the analyze gate so they land in state,
and load the **full** rules file only for extensions that were opted into (drop
`.opt-in` from the filename). Never load rules for a declined extension, and never
enable one on the user's behalf.

## 6. Clarifying questions

- Create or append to `openflow/changes/{ticket}/questions.md` unless the work item
  is genuinely unambiguous.
- Use `../common/question-format-guide.md`: lettered options, mutually exclusive,
  always an "Other" option, an `[Answer]:` line per question.
- **Gate**: stop and wait. Do not write final requirements while blocking questions
  are unanswered.
- Analyze the answers for new ambiguity and ask follow-ups until either everything
  is resolved or the user explicitly accepts the risk (record that acceptance).

## 7. Write it down

In `context.md`: summary, classification, depth and rationale, functional
requirements, non-functional expectations, acceptance criteria as a checkable list,
assumptions, decisions, and open questions.

Then present the analyze gate (`../flow-engine/human-gate.md`). Never write progress
into state by hand — the CLI owns `openflow/state.json`.
