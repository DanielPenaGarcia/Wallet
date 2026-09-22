---
name: docs-update-on-domain-change
description: Use this when changing entities, modules, or business rules so the matching documentation under docs/ is reviewed and updated in the same task.
---

# Docs Update On Domain Change

When a task changes an entity, module, or business rule, update the corresponding documentation under `docs/` as part of the same work.

Apply this to changes that affect:

- Domain entities, schemas, tables, relationships, enums, DTOs, repositories, services, or persistence behavior.
- Application modules, routes, feature boundaries, user workflows, or configuration sections.
- Business rules, calculations, validations, state transitions, permissions, side effects, scheduled behavior, or integration contracts.

Before finishing the task, inspect `docs/` for the matching module or topic. Update the existing document when it exists; create a focused document only when the change introduces a documented area that has no suitable page yet.

Documentation updates should describe the current behavior after the code change, not the implementation history. Include the relevant entities, flows, rules, calculations, and user-visible effects needed for future maintenance.

Keep documentation scoped to the affected area. Do not rewrite unrelated docs or add broad project documentation unless the change truly affects those sections.

If the user explicitly asks for a code-only change, mention that the docs may now be stale instead of silently editing them.
