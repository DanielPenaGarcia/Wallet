---
name: business-rule-docs
description: Keep project documentation aligned whenever a task adds, removes, or changes business rules, validation rules, domain workflows, derived values, or entity responsibilities.
---

# Business Rule Docs

Use this skill whenever the requested work adds, removes, or changes a business rule.

Business rules include:

- Domain validation, constraints, and invariants.
- Entity attributes that change how the domain behaves.
- Derived values and whether they are persisted or calculated.
- Allowed statuses, types, transitions, and lifecycle behavior.
- User-facing workflows that represent domain behavior.
- Service responsibilities, repository responsibilities, and boundaries between modules.

When this skill applies:

1. Update the implementation as requested.
2. Locate the relevant documentation for the affected entity or module.
3. Update documentation in the same change so it describes the new behavior accurately.
4. If no suitable document exists, create one in the project's existing documentation structure.
5. Keep docs concise and aligned with the code's actual behavior; do not document planned behavior unless the implementation already supports it or the user explicitly asks for roadmap notes.

Prefer existing documentation conventions in the repository. For projects with `docs/entities` and `docs/modules`, use entity docs for schema, fields, invariants, and server ownership; use module docs for UI workflows, actions, and feature scope.

Before finishing, mention the documentation files updated. If tests or checks are run, include them in the final summary. If documentation could not be updated, state why.
