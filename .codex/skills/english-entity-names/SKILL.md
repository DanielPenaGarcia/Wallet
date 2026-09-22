---
name: english-entity-names
description: Use this when creating or renaming domain entities, database schemas, models, DTOs, repositories, services, or related identifiers so entity names remain in English.
---

# English Entity Names

When defining application entities or code artifacts that represent domain concepts, use English names for the entities and their related technical identifiers.

Apply this convention to:

- Domain entities, models, classes, interfaces, types, DTOs, schemas, tables, collections, repositories, services, factories, mappers, files, folders, and migration identifiers.
- Relationship names, enum names, field names, method names, and variable names when they describe the entity's domain model.
- New names introduced during refactors, migrations, or feature work.

Keep names consistent across layers. Prefer one English term for the same business concept and reuse it everywhere unless the existing codebase has a stronger established convention.

Do not translate user-facing product copy solely because this skill is active. UI labels, messages, route titles, seed display names, and documentation written for Spanish-speaking users may remain in Spanish when that is the product language.

If the codebase already contains Spanish entity names, avoid broad renames unless the user requested a rename or the touched code requires a new name. For local changes, introduce English names for new artifacts and preserve compatibility with existing persisted data unless a migration is explicitly part of the task.
