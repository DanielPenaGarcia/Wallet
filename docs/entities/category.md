# Category

`Category` classifies expenses and movements in the application.

## Fields

- `id`: unique category identifier.
- `name`: category display name.
- `color`: optional root category color. Child categories store `null`.
- `parentId`: optional parent category identifier.
- `isEssential`: marks whether expenses associated with the category are considered necessary or worthwhile.
- `createdAt`: timestamp for creation.
- `updatedAt`: timestamp for the last update.

## Server Module

Category business rules are owned by the server module at `src/lib/server/categories`. The service validates parent existence, normalizes names and colors, enforces unique names within the same parent level, builds the category tree, and delegates persistence through the category repository contract.

## Seed

Default expense categories can be loaded with `pnpm db:seed:categories`. The seed is idempotent: it inserts missing categories and updates existing categories matched by `name` and `parentId`, without deleting user-created categories.
