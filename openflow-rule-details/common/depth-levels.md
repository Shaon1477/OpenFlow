# Adaptive Depth

**Purpose**: Explain how OpenFlow adapts detail level to problem complexity

## Core Principle

**When a stage executes, ALL its defined artifacts are created. The "depth" refers to the level of detail and rigor within those artifacts, which adapts to the problem's complexity.**

## Stage Selection vs Detail Level

### Stage Selection (Binary)
- The **flow** decides which stages exist; `optional: true` stages may be skipped
- **If a stage runs**: it creates ALL its defined artifacts
- Depth never removes an artifact — it changes how much is written inside it

### Detail Level (Adaptive)
- **Simple problems**: Concise artifacts with essential detail
- **Complex problems**: Comprehensive artifacts with extensive detail
- **Model decides**: Based on problem characteristics, not prescriptive rules

## Factors Influencing Detail Level

The model considers these factors when determining appropriate detail:

1. **Request Clarity**: How clear and complete is the user's request?
2. **Problem Complexity**: How intricate is the solution space?
3. **Scope**: Single file, component, multiple components, or system-wide?
4. **Risk Level**: What's the impact of errors or omissions?
5. **Available Context**: Greenfield vs brownfield, existing documentation
6. **User Preferences**: Has user expressed preference for brevity or detail?

## Example: analyze stage

**Always produced**: `context.md` (plus `questions.md` when anything is ambiguous)

### Simple scenario (bug fix)
- **context.md**: Short summary, the failing behaviour, one repo, scope matrix rows that apply
- **questions.md**: Only the questions that actually block

### Complex scenario (cross-repo migration)
- **context.md**: Full scope matrix, cross-role contracts, constraints per role, assumptions, decisions
- **questions.md**: Several rounds; unresolved business rules block the gate

## Example: plan stage

**Always produced**: `proposal.md`, `specs/`, `design.md`, `tasks.md`

### Simple scenario (single component)
- **specs/**: One requirement, one or two scenarios
- **design.md**: The pattern being followed and the files touched
- **tasks.md**: A handful of tasks

### Complex scenario (multi-component change)
- **specs/**: Multiple capability files, failure scenarios, traceability to criteria
- **design.md**: Structure table, full contract detail, non-functional decisions with values, rejected alternatives
- **tasks.md**: Grouped and ordered tasks, each traced to a requirement

## Guiding Principle for Model

**"Create exactly the detail needed for the problem at hand - no more, no less."**

- Don't artificially inflate simple problems with unnecessary detail
- Don't shortchange complex problems by omitting critical detail
- Let problem characteristics drive detail level naturally
- All required artifacts are always created when stage executes
