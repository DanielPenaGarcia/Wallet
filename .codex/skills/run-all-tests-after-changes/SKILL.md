---
name: run-all-tests-after-changes
description: Use after making any code, domain, test, or documentation change in this repository to require the full automated test suite before concluding.
---

# Run All Tests After Changes

After changing files in this repository, do not conclude the task until the full automated test suite has run and passed.

For this project, the required full test command is:

```bash
pnpm test
```

When the change can affect TypeScript, Svelte components, routes, server code, or imports, also run:

```bash
pnpm check
```

Use faithful, concrete tests. Tests should validate real behavior and meaningful invariants, not implementation trivia, copied wording, or mocks that make the behavior tautological.

If a test fails, treat the task as unfinished: investigate, fix the cause, and rerun the full required test command. Do not report completion while required tests are failing or unrun. If an environmental blocker prevents running tests, state the exact blocker and do not claim the change is verified.
