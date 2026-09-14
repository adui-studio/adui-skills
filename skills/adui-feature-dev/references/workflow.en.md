# ADui Feature Development Workflow

Use this file only as an English fallback.

1. Classify the task: feature, bug fix, refactor, configuration, performance, or tests.
2. Read the smallest amount of repository context required for correctness.
3. Restate goal, inputs/outputs, constraints, boundaries, and acceptance criteria.
4. State assumptions when they are safe and reversible; ask only when missing information changes correctness or public behavior.
5. Plan the smallest necessary change.
6. Implement in the repository's existing style and dependency constraints.
7. Run relevant formatting, linting, type/static checks, tests, build, and runtime verification.
8. Review the Git diff for unrelated changes, security issues, debug leftovers, and sensitive data.
9. Deliver using the output contract and explicitly list unresolved items.
10. Do not commit, push, merge, or release unless the user explicitly requests it.
