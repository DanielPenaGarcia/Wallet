# Category

`Category` classifies expenses and movements in the application.

## Fields

- `id`: unique category identifier.
- `name`: category display name.
- `color`: optional root category color. Child categories store `null`.
- `parentId`: optional parent category identifier.
- `isEssential`: explicitly marks whether expenses associated with this category are considered necessary or worthwhile.
- `createdAt`: timestamp for creation.
- `updatedAt`: timestamp for the last update.

## Server Module

Category business rules are owned by the server module at `src/lib/server/categories`. The service validates parent existence, normalizes names and colors, enforces unique names within the same parent level, blocks deletion while a category has child categories or recurring expenses, builds the category tree, and delegates persistence through the category repository contract.

## Essential Semantics

Essentiality is stored per category. A child category does not automatically inherit `isEssential` from its parent; parent and child categories can each decide whether associated expenses are essential.

This keeps the rule explicit for allocation and filtering logic: consumers must read the category assigned to the expense or movement instead of inferring essentiality from ancestors.

## Deletion

Category deletion is restricted while the category has subcategories or recurring expenses associated with it. This prevents cascading removal of category hierarchy and preserves the classification context of configured obligations.

## Seed

Default expense categories can be loaded with `pnpm db:seed:categories`. The seed is idempotent: it inserts missing categories and updates existing categories matched by `name` and `parentId`, without deleting user-created categories.
